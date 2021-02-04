/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description Scheduled script to export a run into the import template
 * 
 * @Last Modified by:   Sruti Desai
 * 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'],
    function(runtime, search, record, log, task, currentRecord, format) {
        var zee = 0;
        var role = 0;
        role = runtime.getCurrentUser().role;
        var ctx = runtime.getCurrentScript();

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }
        function main() {
            log.debug({
                title: 'start',
                details: 'start'
            });

            deleteRecords();

            var activeRunSearch = search.load({
                id: 'customsearch_app_run_plan_active',
                type: 'customrecord_run_plan'
            });
            
            var index = 0;
            var activeRunSearchResults = activeRunSearch.run();
            activeRunSearchResults.each(function(searchResult) {
                var run_id = searchResult.getValue({name: 'internalid'});
                var zee = searchResult.getValue({name: 'custrecord_run_franchisee'});
                var run_name = searchResult.getValue({name: 'name'});
                log.debug({
                    title: 'zee',
                    details: zee
                });
                log.debug({
                    title: 'index',
                    details: index
                });
                index++;

                indexCallBack = index;

                var data_set = JSON.parse(ctx.getParameter({ name: 'custscript_export_run_run_id' }));
                if (isNullorEmpty(data_set)){
                    data_set = JSON.parse(JSON.stringify([]));
                }

                var usageLimit = ctx.getRemainingUsage();
                if (usageLimit < 200) {
                    params = {
                        custscript_export_run_run_id: JSON.stringify(run_id)
                    };
                    var reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: ctx.scriptId,
                        deploymentId: ctx.deploymentId,
                        params: params
                    });
                    var reschedule_id = reschedule.submit();
                    log.debug({
                        title: 'Attempting: Rescheduling Script',
                        details: reschedule
                    });
                    return false;
                    // }
                } else { 
                    if (data_set.indexOf(run_id) == -1){
                        data_set.push(run_id);
                        onclick_exportRun(run_id, run_name, zee);
                    }    
                    
                    return true;
                }
            });

            //onclick_exportRun(229, 'Byron Bay', 794958);

        }

        function onclick_exportRun(run_id, run_name, zee) {   
            
            var runRecord = record.create({
                type: 'customrecord_export_run_json',
                isDynamic: true,
            });
           
            if (zee.toString().indexOf(',') > -1) { 
                zee = zee.toString().split(',').map(Number);

            }

            runRecord.setValue({ fieldId: 'custrecord_export_run_franchisee', value: zee});
            runRecord.setValue({ fieldId: 'custrecord_export_run_template', value: false});
            runRecord.setValue({ fieldId: 'custrecord_export_run_id', value: run_id});
            runRecord.setValue({ fieldId: 'custrecord_export_run_name', value: run_name});

            log.debug({
                title: 'in fn',
                details: 'in fn'
            });    
            var freqSearch = search.load({
                id: 'customsearch_rp_servicefreq_excel_export',
                type: 'customrecord_service_freq'
            });

            freqSearch.filters.push(search.createFilter({
                name: 'custrecord_service_freq_run_plan',
                operator: search.Operator.IS,
                values: run_id
            }));

            var freqSearchResults = freqSearch.run();

            

            //need to check for legs

            var freqIDs = [];
            var serviceIDs = [];
            var run_json = [];
            
            freqSearchResults.each(function(searchResult) {

                var usageLimit = ctx.getRemainingUsage();
                if (usageLimit < 200) {
                    params = {
                        custscript_export_run_run_id: JSON.stringify(freqIDs)
                    };
                    var reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: ctx.scriptId,
                        deploymentId: ctx.deploymentId,
                        params: params
                    });
                    var reschedule_id = reschedule.submit();
                    log.debug({
                        title: 'Attempting: Rescheduling Script',
                        details: reschedule
                    });
                    return false;
                    // }
                } else { 
                        
                    var run_info = {"custInternalId": null, "custId": null, "custName": null, "serviceId": null, "serviceName": null, "price": null, "freq": null, "stop1LocationType": null, "poBox1": null, "stop1Location": null, "stop1Duration": null, "stop1Time": null, "stop1Transfer": null, "stop1Notes": null, "stop2LocationType": null, "poBox2": null, "stop2Location": null, "stop2Duration": null, "stop2Time": null, "stop2Transfer": null, "stop2Notes": null, "driverName": null, "runName": null,};
                    var internalId = searchResult.getValue({name: 'internalid'});
                    var service_id = searchResult.getValue({name: 'internalid', join: "CUSTRECORD_SERVICE_FREQ_SERVICE"}); 

                    //if freq id has already been visited, then continue
                    if (freqIDs.indexOf(internalId) !== -1 ) {
                        return true;
                    }
                    if (serviceIDs.indexOf(service_id) !== -1 ) {
                        return true;
                    }
                    freqIDs.push(internalId);
                    log.debug({ title: 'freqIDs', details: freqIDs });
                    
                    var customer = searchResult.getValue({name: 'custrecord_service_freq_customer'});

                    var custRecord = record.load({type: record.Type.CUSTOMER, id: customer });
                    var internal_custid = custRecord.getValue({ fieldId: 'id'})

                    run_info.custInternalId = internal_custid;

                    var custid = custRecord.getValue({ fieldId: 'entityid'});
                    run_info.custId = custid;

                    var companyName = custRecord.getValue({ fieldId: 'companyname'});

                    run_info.custName = companyName;

                    //excelRecord.setValue({fieldId: 'custrecord_export_run_service_id', value: service_id });
                    run_info.serviceId = service_id;

                    var serviceRecord = record.load({type: 'customrecord_service', id: service_id });

                    var service_name = serviceRecord.getValue({fieldId: 'name'}); 
                    //excelRecord.setValue({fieldId: 'custrecord_export_run_service_name', value: service_name });
                    run_info.serviceName = service_name;

                    var price = serviceRecord.getValue({fieldId: 'custrecord_service_price'});
                    //excelRecord.setValue({fieldId: 'custrecord_export_run_price', value: price });
                    run_info.price = price;

                    var mon = searchResult.getValue({name: 'custrecord_service_freq_day_mon'});
                    var tue = searchResult.getValue({name: 'custrecord_service_freq_day_tue'});
                    var wed = searchResult.getValue({name: 'custrecord_service_freq_day_wed'});
                    var thurs = searchResult.getValue({name: 'custrecord_service_freq_day_thu'});
                    var fri = searchResult.getValue({name: 'custrecord_service_freq_day_fri'});
                    var adhoc = searchResult.getValue({name: 'custrecord_service_freq_day_adhoc'});


                    if (mon === true && tue === true && wed === true && thurs === true && fri === true ) {
                        var freq = "Daily";  
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_freq', value: freq });
                        run_info.freq = freq;

                    } else if (adhoc === true ) {
                        var freq = "Adhoc";
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_freq', value: freq });
                        run_info.freq = freq;

                    } else {
                        var freqArr = [];
                        if (mon === true) { freqArr.push("Mon");  }
                        if (tue === true) { freqArr.push("Tue");  }
                        if (wed === true) { freqArr.push("Wed");  }
                        if (thurs === true) { freqArr.push("Thurs");  }
                        if (fri === true) { freqArr.push("Fri");  }
                        var freqString = freqArr.join("/");
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_freq', value: freqString });
                        run_info.freq = freqString;

                    }

                    var stop1_id = searchResult.getValue({name: 'custrecord_service_freq_stop'});

                    var stopRecord = record.load({type: 'customrecord_service_leg', id: stop1_id });
                    var location_type = stopRecord.getValue({ fieldId: 'custrecord_service_leg_location_type'});

                    if (location_type == 1) {
                        var stop1_location_type = "Customer";
                        log.debug({
                            title: 'stop1_location_type',
                            details: stop1_location_type
                        });
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_stop1_type', value: stop1_location_type });
                        run_info.stop1LocationType = stop1_location_type;

                        var poBox1 = stopRecord.getValue({ fieldId: 'custrecord_service_leg_addr_postal'});
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_po_box1', value: poBox1 });
                        run_info.poBox1 = poBox1;

                        var addrArr = [];
                        if (!isNullorEmpty(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_subdwelling'}))) {
                            addrArr.push(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_subdwelling'}));
                        }
                        addrArr.push(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_st_num_name'}));
                        addrArr.push(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_suburb'}));
                        addrArr.push(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_state'}));
                        addrArr.push(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_postcode'}));
                        var stop1_location = addrArr.join(',');
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_stop1_location', value: stop1_location });
                        run_info.stop1Location = stop1_location;

                    } else {
                        var stop1_location_type = "Non-Customer";
                        log.debug({
                            title: 'stop1_location_type',
                            details: stop1_location_type
                        });
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_stop1_type', value: stop1_location_type });
                        run_info.stop1LocationType = stop1_location_type;

                        var poBox1 = stopRecord.getValue({ fieldId: 'custrecord_service_leg_addr_postal'});
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_po_box1', value: poBox1 });
                        run_info.poBox1 = poBox1;

                        var stop1_location = stopRecord.getValue({ fieldId: 'name'});
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_stop1_location', value: stop1_location });
                        run_info.stop1Location = stop1_location;

                    }

                    var stop1_duration = stopRecord.getValue({ fieldId: 'custrecord_service_leg_duration'});
                    //excelRecord.setValue({fieldId: 'custrecord_export_run_stop1_duration', value: stop1_duration });
                    run_info.stop1Duration = stop1_duration;

                    var stop1_time = searchResult.getValue({name: 'custrecord_service_freq_time_current'});
                    //excelRecord.setValue({fieldId: 'custrecord_export_run_stop1_time', value: stop1_time });
                    run_info.stop1Time = stop1_time;

                    var stop1_transfer = stopRecord.getText({ fieldId: 'custrecord_service_leg_trf_type'});
                    //excelRecord.setValue({fieldId: 'custrecord_export_run_stop1_transfer', value: stop1_transfer });
                    run_info.stop1Transfer = stop1_transfer;

                    var stop1_notes = stopRecord.getValue({ fieldId: 'custrecord_service_leg_notes'});
                    //excelRecord.setValue({fieldId: 'custrecord_export_run_stop1_notes', value: stop1_notes });
                    run_info.stop1Notes = stop1_notes;

                    log.debug({
                        title: 'stop1_notes',
                        details: stop1_notes
                    });

                    log.debug({
                        title: 'service_id',
                        details: service_id
                    });                  
                    
                    var stop2_driver = searchResult.getText({name: 'custrecord_service_freq_operator'});
                    //excelRecord.setValue({fieldId: 'custrecord_export_run_driver', value: stop2_driver });
                    run_info.driverName = stop2_driver;

                    var stop2_run_plan = searchResult.getText({name: 'custrecord_service_freq_run_plan'});
                    //excelRecord.setValue({fieldId: 'custrecord_export_run_run_name', value: stop2_run_plan });
                    run_info.runName = stop2_run_plan;


                    ///STOP 2!!
                    var freqSearch2 = search.load({
                        id: 'customsearch_rp_servicefreq_excel_export',
                        type: 'customrecord_service_freq'
                    });
        
                    freqSearch2.filters.push(search.createFilter({
                        name: 'custrecord_service_freq_run_plan',
                        operator: search.Operator.IS,
                        values: run_id
                    }));
                    
                    freqSearch2.filters.push(search.createFilter({
                        name: 'internalid',
                        join: 'CUSTRECORD_SERVICE_FREQ_SERVICE',
                        operator: search.Operator.IS,
                        values: service_id
                    }));
        
                    var freqSearchResults2 = freqSearch2.run();
                    freqSearchResults2.each(function(searchResult) {
                        var internalId = searchResult.getValue({name: 'internalid'});

                        if (freqIDs.indexOf(internalId) !== -1) {
                            return true;
                        }

                        log.debug({
                            title: 'in2nd',
                            details: 'in2nd'
                        })
                        serviceIDs.push(service_id);
                        freqIDs.push(internalId);
                        var stop2_id = searchResult.getValue({name: 'custrecord_service_freq_stop'});
                        var stopRecord2 = record.load({type: 'customrecord_service_leg', id: stop2_id });
                        var location_type = stopRecord2.getValue({ fieldId: 'custrecord_service_leg_location_type'});

                        if (location_type == 1) {
                            var stop2_location_type = "Customer";
                            //excelRecord.setValue({fieldId: 'custrecord_export_run_stop2_type', value: stop2_location_type });
                            run_info.stop2LocationType = stop2_location_type;

                            var poBox2 = stopRecord2.getValue({ fieldId: 'custrecord_service_leg_addr_postal'});
                            //excelRecord.setValue({fieldId: 'custrecord_export_run_po_box2', value: poBox2 });
                            run_info.poBox2 = poBox2;

                            var addrArr2 = [];
                            if (!isNullorEmpty(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_subdwelling'}))) {
                                addrArr2.push(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_subdwelling'}));
                            }
                            addrArr2.push(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_st_num_name'}));
                            addrArr2.push(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_suburb'}));
                            addrArr2.push(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_state'}));
                            addrArr2.push(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_postcode'}));
                            var stop2_location =  addrArr2.join(',');
                            //excelRecord.setValue({fieldId: 'custrecord_export_run_stop2_location', value: stop2_location });
                            run_info.stop2Location = stop2_location;

                        } else {
                            var stop2_location_type = "Non-Customer";
                            //excelRecord.setValue({fieldId: 'custrecord_export_run_stop2_type', value: stop2_location_type });
                            run_info.stop2LocationType = stop2_location_type;

                            var poBox2 = stopRecord2.getValue({ fieldId: 'custrecord_service_leg_addr_postal'});
                            //excelRecord.setValue({fieldId: 'custrecord_export_run_po_box2', value: poBox2 });
                            run_info.poBox2 = poBox2;

                            var stop2_location = stopRecord2.getValue({ fieldId: 'name'});
                            //excelRecord.setValue({fieldId: 'custrecord_export_run_stop2_location', value: stop2_location });
                            run_info.stop2Location = stop2_location;

                        }

                        var stop2_duration = stopRecord2.getValue({ fieldId: 'custrecord_service_leg_duration'});
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_stop2_duration', value: stop2_duration });
                        run_info.stop2Duration = stop2_duration;

                        var stop2_time = searchResult.getValue({name: 'custrecord_service_freq_time_start'});
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_stop2_time', value: stop2_time });
                        run_info.stop2Time = stop2_time;

                        var stop2_transfer = stopRecord2.getText({ fieldId: 'custrecord_service_leg_trf_type'});
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_stop2_transfer', value: stop2_transfer });
                        run_info.stop2Transfer = stop2_transfer;

                        var stop2_notes = stopRecord2.getValue({ fieldId: 'custrecord_service_leg_notes'});
                        //excelRecord.setValue({fieldId: 'custrecord_export_run_stop2_notes', value: stop2_notes });
                        run_info.stop2Notes = stop2_notes;

                        return true;
                    });
                                    
                    run_json.push(run_info);
                    
                    return true;
                }
            });

            log.debug({
                title: 'script complete',
                details: 'script complete'
            })

            runRecord.setValue({ fieldId: 'custrecord_export_run_json_info', value: JSON.stringify(run_json)});
            var id = runRecord.save({
                enableSourcing: true,
            });

            log.debug({
                title: 'runRecord id',
                details: id
            });

        }
        

        function deleteRecords() {
            log.debug({
                title: 'DELETE STRING ACTIVATED'
            });
            var exportRunSearch = search.load({
                type: 'customrecord_export_run_json',
                id: 'customsearch_export_run_json'
            });
            exportRunSearch.run().each(function(result) {
                
                var index = result.getValue('internalid');
                if (result.getValue('custrecord_export_run_template') !== 'T') {
                    deleteResultRecord(index);
                }
                
              
                return true;
            });

            
        }

        function deleteResultRecord(index) {           
            // Deleting a record consumes 4 governance units.
            record.delete({
                type: 'customrecord_export_run_json',
                id: index
            });
            
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            execute: main
        }
    }
);