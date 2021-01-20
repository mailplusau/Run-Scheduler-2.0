/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 2.00         2020-10-18 18:08:08         Anesu
 *
 * Description: Import an excel file of stops to add into an existing run   
 * 
 * @Last Modified by:   Anesu Chakaingesu
 * @Last Modified time: 2020-10-22 16:49:26
 * 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'],
    function(runtime, search, record, log, task, currentRecord, format) {
        var zee = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        role = runtime.getCurrentUser().role;

        if (role == 1000) {
            zee = runtime.getCurrentUser().id;
        } else if (role == 3) { //Administrator
            zee = 6; //test
        } else if (role == 1032) { // System Support
            zee = 425904; //test-AR
        }

        var indexInCallback = 0;
        var currRec = currentRecord.get();
        var ctx = runtime.getCurrentScript();

        /**
         *  Comments for Coding
         * 
         *  Generic Modules Used in the Run scheduler to creates/edited stops on an existing run.
         * 
         *  Modules - (ID):
         *  Create Stops - 738
         *  Schedule Service - 733
         * 
         * 
         *  Adding Stop Process:
         *  1. Create Stop
         *      Add Stop - Address Type (Customers Location and Non Customer Location)
         *      Add Duration 
         *      Add Notes
         *      Transfer? (Before or After)
         * 
         *  2. Schedule Service
         *      Frequency (Daily, ADHOC. M,T,W,T,F,S,S)
         *      2.1 Stop 1 Info
         *          Select Run - Run created yet?
         *          Service Time - Earliest & Latest Time (AM/PM)
         *      2.2 Stop 2 Info
         *          Select Run
         *          Service Time
         * 
         *  3. Save New Record of Data
         * 
         *  4. Delete Record Once User Goes Back
         */
        
        function main(context){
            var file_id = context.request.parameters.fileid;
            var file1 = file.load({
                id: file_id
            });

            var iterator = file1.lines.iterator();

            // skip first line (header)
            iterator.each(function () {return false;});

            iterator.each(function (line, index) {

                run(line, index);
                // return true;
            });
        }

        function run(line, index){
            log.audit({
                title: 'SS Initialised'
            });
            

            var rs_values = line.value.split(',');
            var custId = rs_values[0];
            var companyName = "\"" + rs_values[1]+ "\"";
            var service_id = rs_values[2];
            var service_name = rs_values[3];
            var price = rs_values[4];
            var frequency = rs_values[5];
            var poBox = "\"" + rs_values[6]+ "\"";
            var stop1_location = "\"" + rs_values[7]+ "\"";
            var stop1_time = rs_values[8];
            var stop2_location = "\"" + rs_values[9]+ "\"";
            var stop2_time = rs_values[10];
            var notes = "\"" + rs_values[11]+ "\"";
            var driver = rs_values[12];

            log.debug({
                title: 'comp',
                details: companyName
            })
            log.debug({
                title: 'lineVals',
                details: rs_values
            });

            var custIdSet = ctx.getParameter({
                name: 'custscript_data_set'
            });
            if (isNullorEmpty(custIdSet)){
                custIdSet = []; // custid
            }

            var stage = ctx.getParameter({
                name: 'custscript_stage'
            });
            if (isNullorEmpty(stage)){
                stage = 0;
            }

            indexInCallback = index;
            var usageLimit = ctx.getRemainingUsage();
            if (usageLimit < 100) {
                params = {
                    custscript_data_set: JSON.stringify(custIdSet),
                    custscript_stage: stage
                };
                
                var reschedule = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    scriptId: 'customscript_ss_import_excel',
                    deploymentId: 'customdeploy_ss_import_excel',
                    params: params
                });
                var reschedule_id = reschedule.submit();

                log.debug({
                    title: 'Attempting: Rescheduling Script',
                    details: reschedule
                });

                return false;
            } else {

                if (custIdSet.indexOf(service_id) == -1) {
                    custIdSet.push(service_id);
                    if (!isNullorEmpty(stop1_location)){
                        // Start Functions here.

                        if (stage == 0){ // Create Stops
                            stage++;

                            createStop();
                        }

                        if (stage == 1){ // Schedule Service 
                            stage++;

                        }

                        if (stage == 2){
                            stage++;

                        }
                    }
                }
            }
            
            return true;   
        }

        function createStop(){
            var customer_id = currentScript.getValue({
                fieldId: 'custpage_customer_id',
            });

            var service_id = currentScript.getValue({
                fieldId: 'custpage_service_id',
            });

            for (var i = 0; i < edit_stop_elem.length; i++) {
                var stop_id = edit_stop_elem[i].getAttribute('data-newstop');
                console.log('edit_stop_elem[i]', edit_stop_elem[i]);
                console.log('stop_id', stop_id);
                var old_stop_id = table_info_elem[i].getAttribute('data-oldstop');
                console.log('old_stop_id', old_stop_id);

                var delete_stop_id = delete_stop_elem[i].getAttribute('data-stopid');

                var transfer_type = table_stop_name_elem[i].getAttribute('data-transfertype');
                var linked_zee = table_stop_name_elem[i].getAttribute('data-linkedzee');
                var linked_stop = table_stop_name_elem[i].getAttribute('data-linkedstop');
                var old_value = table_stop_name_elem[i].getAttribute('data-oldvalue');
                var notes = table_stop_name_elem[i].getAttribute('data-notes');

                if (delete_stop_elem[i].value == 'T' && !isNullorEmpty(delete_stop_id)) {
                    var serviceLegSearch = search.load({
                        id: 'customsearch_rp_servicefreq',
                        type: 'customrecord_service_freq'
                    }) 
                    
                    serviceLegSearch.filters.push(search.createFilter({
                        name: 'custrecord_service_freq_service',
                        operator: search.Operator.IS,
                        values: service_id
                    }));
                    if (!isNullorEmpty(linked_stop)) {
                        serviceLegSearch.filters.push(search.createFilter({
                            name: 'custrecord_service_freq_stop',
                            operator: search.Operator.ANYOF,
                            values: delete_stop_id
                        }));
                    } else {
                        serviceLegSearch.filters.push(search.createFilter({
                            name: 'custrecord_service_freq_stop',
                            operator: search.Operator.IS,
                            values: delete_stop_id
                        }));
                    }


                    var resultSet = serviceLegSearch.run();

                    resultSet.each(function(searchResult) {

                        var freq_id = searchResult.getValue('internalid');

                        if (!isNullorEmpty(freq_id)) {
                            var freq_record = record.load({
                                type: 'customrecord_service_freq',
                                id: freq_id,
                            });

                            freq_record.setValue({
                                fieldId: 'isinactive',
                                value: 'T',
                            });

                            freq_record.save({
                                enableSourcing: true,
                            });

                        }
                        return true;
                    });


                    var service_leg_record = record.load({
                        type: 'customrecord_service_leg',
                        id: delete_stop_id,
                    });

                    var deleted_link_zee = service_leg_record.getValue({
                        fieldId: 'custrecord_service_leg_trf_franchisee'
                    });

                    if (!isNullorEmpty(deleted_link_zee)) {

                        deleted_stop_array[deleted_stop_array.length] = delete_stop_id;
                        deleted_linked_zee_email[deleted_linked_zee_email.length] = deleted_link_zee;

                    }

                    service_leg_record.setValue({
                        fieldId: 'isinactive',
                        value: 'T',
                    })

                    service_leg_record.save({
                        enableSourcing: true,
                    });

                    //FOR TRANSFERS
                    if (!isNullorEmpty(linked_stop)) {
                        var linked_service_leg_record = record.load({
                            type: 'customrecord_service_leg',
                            id: linked_stop,
                        });
                        linked_service_leg_record.setValue({
                            fieldId: 'isinactive',
                            value: 'T',
                        });
                        linked_service_leg_record.save({
                            enableSourcing: true
                        });
                    }


                } else {
                    var transfer_created = false;
                    var edited = false;
                    console.log('transfer_type', transfer_type);
                    console.log('old_stop_id', old_stop_id);

                    if (isNullorEmpty(old_stop_id)) {
                        edited = true;
                        var service_leg_record = record.create({
                            type: 'customrecord_service_leg',
                            isDynamic: true
                        });
                        
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_customer',
                            value: customer_id
                        });

                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_service',
                            value: service_id
                        });

                        if (!isNullorEmpty(transfer_type) && transfer_type != 0) {
                            transfer_created = true;
                            transfer_array[transfer_array.length] = i;
                            transfer_zee_array[transfer_zee_array.length] = linked_zee;
                            console.log('creating transfer stop');
                            var service_leg_record_transfer = record.create({
                                type: 'customrecord_service_leg',
                                isDynamic: true,
                            });
                            
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_customer',
                                value: customer_id
                            });

                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_service',
                                value: service_id
                            });

                        }
                    } else if (!isNullorEmpty(old_stop_id)) {
                        if (!isNullorEmpty(transfer_type) && transfer_type != 0) {
                            transfer_array[transfer_array.length] = i;
                            transfer_zee_array[transfer_zee_array.length] = linked_zee;
                        }
                        for (k = 0; k < edited_stop_array.length; k++) {
                            if (old_stop_id == edited_stop_array[k]) {
                                edited = true;
                                var service_leg_record = record.load({
                                    type: 'customrecord_service_leg',
                                    id: old_stop_id,
                                });

                                if (!isNullorEmpty(transfer_type) && transfer_type != 0) {
                                    
                                    var transfer_app_service_leg = service_leg_record.getValue({
                                        fieldId: 'custrecord_service_leg_trf_leg'
                                    });
                                    
                                    console.log('transfer_app_service_leg', transfer_app_service_leg);
                                    if (transfer_app_service_leg == 1) {
                                        var transfer_stop_linked_id = service_leg_record.getValue({
                                            fieldId: 'custrecord_service_leg_trf_linked_stop'
                                        });
                                        
                                        var service_leg_record_transfer = record.load({
                                            type: 'customrecord_service_leg',
                                            id: transfer_stop_linked_id,
                                        });
                                        
                                    }
                                }
                            }
                        }

                    }
                    console.log('edited', edited);
                    if (edited == false) {
                        stop_array[stop_array.length] = old_stop_id;
                        continue;
                    }

                    //Array with the stops of which the name has changed
                    if (old_value != table_stop_name_elem[i].value && !isNullorEmpty(old_value)) {
                        updated_stop_array[updated_stop_array.length] = table_stop_name_elem[i].value;
                        old_stop_array[old_stop_array.length] = old_value;
                        if (linked_zee != 0) {
                            updated_stop_zee[updated_stop_zee.length] = linked_zee;
                        }
                    }

                    service_leg_record.setValue({
                        fieldId: 'name',
                        value: table_stop_name_elem[i].value,
                    });
                    console.log('table_stop_name_elem[i].value', table_stop_name_elem[i].value);

                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_location_type',
                        value: table_info_elem[i].getAttribute('data-addresstype'),
                    });

                    if (!isNullorEmpty(table_stop_name_elem[i].getAttribute('data-ncl')) && table_stop_name_elem[i].getAttribute('data-ncl') != 0) {
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_non_cust_location',
                            value: table_stop_name_elem[i].getAttribute('data-ncl'),
                        });
                        
                        var ncl_inactiveSearch = search.load({
                            id: 'customsearch_noncust_inactiv',
                            type: 'customrecord_ap_lodgment_location'
                        });
                        
                        //CONVERT

                        ncl_inactiveSearch.filters.push(search.createFilter({
                            name: 'internalid',
                            operator: search.Operator.IS,
                            values: table_stop_name_elem[i].getAttribute('data-ncl')
                        }));

                        var resultSet_ncl_inactive = ncl_inactiveSearch.run();
                        var error = false;

                        resultSet_ncl_inactive.each(function(ResultSet) {
                            var ncl_name = ResultSet.getValue('name');
                            showAlert(ncl_name + ' is inactive. Please choose another location for that stop.');
                            error = true;
                            return true
                        })
                        if (error == true) {
                            return false;
                        }
                    }

                    if (table_stop_name_elem[i].getAttribute('data-customeraddressid') != 0) {
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_addr',
                            value: table_stop_name_elem[i].getAttribute('data-customeraddressid'),
                        });
                        
                    }

                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_postal',
                        value: table_stop_name_elem[i].getAttribute('data-postbox'),
                    });
                    
                    if (isNullorEmpty(table_stop_name_elem[i].getAttribute('data-postbox'))) {
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_addr_subdwelling',
                            value: table_stop_name_elem[i].getAttribute('data-addr1'),
                        });
                        
                    }

                    if (!isNullorEmpty(transfer_type) && transfer_type != 0) {
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_trf_type',
                            value: transfer_type,
                        });
                        
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_trf_leg',
                            value: 1,
                        });

                    }

                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_st_num_name',
                        value: table_stop_name_elem[i].getAttribute('data-addr2'),
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_suburb',
                        value: table_stop_name_elem[i].getAttribute('data-city'),
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_state',
                        value: table_stop_name_elem[i].getAttribute('data-state'),
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_postcode',
                        value: table_stop_name_elem[i].getAttribute('data-zip'),
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_lat',
                        value: table_stop_name_elem[i].getAttribute('data-lat'),
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_lon',
                        value: table_stop_name_elem[i].getAttribute('data-lng'),
                    });
                    
                    var duration = table_duration_elem[i].value;


                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_duration',
                        value: duration,
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_notes',
                        value: notes,
                    });
                    

                    var original_service_leg_id = service_leg_record.save({
                        enableSourcing: true,
                    });
                    
                    stop_array[stop_array.length] = original_service_leg_id;



                    if (!isNullorEmpty(transfer_type) && transfer_type != 0 && !isNullorEmpty(service_leg_record_transfer)) {
                        console.log('editing transfer stop');
                        service_leg_record_transfer.setValue({
                            fieldId: 'name',
                            value: table_stop_name_elem[i].value,
                        });
                        

                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_location_type',
                            value: table_info_elem[i].getAttribute('data-addresstype'),
                        });
                        
                        if (!isNullorEmpty(table_stop_name_elem[i].getAttribute('data-ncl')) && table_stop_name_elem[i].getAttribute('data-ncl') != 0) {
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_non_cust_location',
                                value: table_stop_name_elem[i].getAttribute('data-ncl'),
                            });
                            
                        }

                        if (table_stop_name_elem[i].getAttribute('data-customeraddressid') != 0) {
                            service_leg_record.setValue({
                                fieldId: 'custrecord_service_leg_addr',
                                value: table_stop_name_elem[i].getAttribute('data-customeraddressid'),
                            });
                            
                        }

                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_postal',
                            value: table_stop_name_elem[i].getAttribute('data-postbox'),
                        });
                        
                        if (isNullorEmpty(table_stop_name_elem[i].getAttribute('data-postbox'))) {
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_addr_subdwelling',
                                value: table_stop_name_elem[i].getAttribute('data-addr1'),
                            });
                            
                        }

                        if (!isNullorEmpty(transfer_type) && transfer_type != 0) {
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_trf_type',
                                value: transfer_type,
                            });
                            
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_trf_leg',
                                value: 2,
                            });
                            
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_trf_linked_stop',
                                value: original_service_leg_id,
                            });
                            
                        }

                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_st_num_name',
                            value: table_stop_name_elem[i].getAttribute('data-addr2'),
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_suburb',
                            value: table_stop_name_elem[i].getAttribute('data-city'),
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_state',
                            value: table_stop_name_elem[i].getAttribute('data-state'),
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_postcode',
                            value: table_stop_name_elem[i].getAttribute('data-zip'),
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_lat',
                            value: table_stop_name_elem[i].getAttribute('data-lat'),
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_lon',
                            value: table_stop_name_elem[i].getAttribute('data-lng'),
                        });
                        
                        var duration = table_duration_elem[i].value;


                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_duration',
                            value: duration,
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_notes',
                            value: notes,
                        });

                        var original_service_leg_id_transfer = service_leg_record_transfer.save({
                            enableSourcing: true,
                        });

                        console.log('transfer_created', transfer_created);
                        if (transfer_created == true) {
                            var service_leg_record = record.load({
                                type: 'customrecord_service_leg',
                                id: original_service_leg_id,
                                isDynamic: true,
                            });

                            service_leg_record.setValue({
                                fieldId: 'custrecord_service_leg_trf_linked_stop',
                                value: original_service_leg_id_transfer,
                            });
                            
                            service_leg_record.save({
                                enableSourcing: true,
                            });
                        }
                    }

                }
            }
        }

        /**
         * [getDate description] - Get the current date
         * @return {[String]} [description] - return the string date
         */
        function getDate() {
            var date = new Date();
            date = format.format({
                value: date,
                type: format.Type.DATE,
                timezone: format.Timezone.AUSTRALIA_SYDNEY
            });

            return date;
        }

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }
        
        return {
            execute: main
        }
    });

