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


define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format', 'N/file'],
    function(runtime, search, record, log, task, currentRecord, format, file) {
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
            //var file_id = context.request.params.fileid;
            //var zee_id = context.request.params.zee_id
            var file_id = runtime.getCurrentScript().getParameter({ name: 'custscript_import_excel_file_id' });
            var zee_id = runtime.getCurrentScript().getParameter({ name: 'custscript_import_excel_zee_id' });
            //context.getSetting('SCRIPT', 'custscriptstartdate');
            log.debug({
                title: 'fileid',
                details: file_id
            });

            log.debug({
                title: 'zee_id',
                details: zee_id
            });
            var file1 = file.load({
                id: file_id
            });

            var iterator = file1.lines.iterator();

            // skip first line (header)
            iterator.each(function (line) { 
                log.debug({
                title: 'line',
                details: line
            });
            return false;
        });

        var index = 0;
            iterator.each(function (line) {
                index++;
                log.audit({
                    title: 'num lines',
                    details: index
                });
                run(line, index, zee_id);
                return true;
            });
        }

        function run(line, index, zee){
            log.audit({
                title: 'SS Initialised'
            });

            // ADD ENTITYID i.e. 751172738 id of customer in excel
            // FIX UP NAMES AND "\""- match with cl
            var headers = ["Customer Internal ID", "Customer ID", "Customer Name", "Service ID", "Service Name", "Price", "Frequency", "Stop 1: Customer or Non-Customer Location", "PO Box# or DX#", "Stop 1 Location", "Stop 1 Duration", "Stop 1 Time", "Stop 1 Transfer", "Notes", "Stop 2: Customer or Non-Customer Location", "PO Box# or DX#", "Stop 2 Location", "Stop 2 Duration", "Stop 2 Time", "Stop 2 Transfer", "Notes", "Driver Name", "Run Name"]

            var rs_values = line.value.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            log.debug({
                title: 'lineVals1',
                details: rs_values
            });
            

            var internalID = rs_values[0];
            var custId = rs_values[1];
            var companyName = rs_values[2];
            var service_id = rs_values[3];
            var service_name = rs_values[4];
            var price = rs_values[5];
            var frequency = rs_values[6];

            var stop1_location_type = rs_values[7];
            var poBox1 = rs_values[8];
            var stop1_location = rs_values[9];
            var stop1_duration = rs_values[10];
            var stop1_time = rs_values[11];
            var stop1_transfer = rs_values[12];
            var stop1_notes = rs_values[13];

            var stop2_location_type = rs_values[14];
            var poBox2 = rs_values[15];
            var stop2_location =  rs_values[16];
            var stop2_duration = rs_values[17];
            var stop2_time = rs_values[18];
            var stop2_transfer = rs_values[19];
            var stop2_notes = rs_values[20];

            var driver = rs_values[21];
            var run_name = rs_values[22];

            log.debug({
                title: 'comp',
                details: companyName
            })
            log.debug({
                title: 'lineVals',
                details: rs_values
            });

            var custIdSet = ctx.getParameter({
                name: 'custscript_import_excel_data_set'
            });
            if (isNullorEmpty(custIdSet)){
                custIdSet = []; // custid
            }

            var stage = ctx.getParameter({
                name: 'custscript_import_excel_stage'
            });
            if (isNullorEmpty(stage)){
                stage = 0;
            }

            indexInCallback = index;
            var usageLimit = ctx.getRemainingUsage();
            if (usageLimit < 100) {
                params = {
                    custscript_import_excel_data_set: JSON.stringify(custIdSet),
                    custscript_import_excel_stage: stage
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
                        deleteRecords();
                        // Start Functions here.
                        var stop1_id = 0;
                        var stop2_id = 0;
                        if (stage == 0){ // Create Stops
                            stage++;

                            var service_leg_1 = 1;
                            var service_leg_2 = 2;
                            stop1_id = createStop(service_leg_1, internalID, zee, companyName, service_id, stop1_location_type, stop1_location, poBox1, stop1_duration, stop1_notes );
                            
                            log.debug({
                                title: 'stop1 id',
                                details: stop1_id
                            });
                            log.debug({
                                title: 'zee',
                                details: zee
                            });
                            stop2_id = createStop(service_leg_2, internalID, zee, companyName, service_id, stop2_location_type, stop2_location, poBox2, stop2_duration, stop2_notes );

                            

                            log.debug({
                                title: 'stop2 id',
                                details: stop2_id
                            });
                        }

                        if (stage == 1){ // Schedule Service 
                            log.debug({
                                title: 'stop1 id in ss',
                                details: stop1_id
                            });
                            log.debug({
                                title: 'stop2 id in ss',
                                details: stop2_id
                            });
                            stage++;
                            scheduleService(stop1_id, stop2_id, frequency, internalID, zee, driver, run_name, service_id, stop1_time, stop2_time )

                        }

                        if (stage == 2){
                            stage++;
                            
                            saveData(internalID, custId, companyName, service_id, service_name, price, frequency, stop1_location_type, poBox1, poBox2, stop1_location, stop1_time, stop1_duration, stop1_notes, stop1_transfer, stop2_location_type, stop2_location, stop2_time, stop2_duration, stop2_transfer, stop2_notes, driver, run_name, stop1_id, stop2_id);

                            
                        }
                    }
                }
            }
            
            return true;   
        }
        /*
         *  Adding Stop Process:
         *  1. Create Stop
         *      Add Stop - Address Type (Customers Location and Non Customer Location)
         *      Add Duration 
         *      Add Notes
         *      Transfer? (Before or After) -- COMPLETE THIS
         *  po box?? or dx? what is the diff, zee will have to outline
         *  Stop1_location_type == customer or non-customer; field in excel
         * stop1_duration must be in sec= add field in excel and stop2_duration
         * why is there no po box for the second stop in raine excel? because one is always guaranteed tp be customer?
         * check service_leg_record.setValue('name') ==> not sure if accessing the right values
         * assuming it's either po box or subdwelling i.e. level 4/ground floor/suite 4 etc
         * haven't included transfer yet
         * service leg number is hardcoded i.e. stop1 = 1, stop2 = 2
         * STATE will need to be in caps
         * 
        */
        function createStop(service_leg_number, custId, zee, companyName, serviceId, stop_location_type, stop_location, poBox, stop_duration, stop_notes ){

            log.debug({ title: 'service_leg_number',details: service_leg_number });
            log.debug({ title: 'custId', details: custId });
            log.debug({ title: 'zee', details: zee });
            log.debug({ title: 'companyName', details: companyName });
            log.debug({ title: 'serviceId', details: serviceId});
            log.debug({title: 'stop_location_type',details: stop_location_type });
            log.debug({ title: 'stop_location', details: stop_location })
            log.debug({ title: 'poBox', details: poBox })
            log.debug({ title: 'stop_duration', details: stop_duration })
            log.debug({ title: 'stop_notes', details: stop_notes })

            stop_location = stop_location.toLowerCase();
            poBox_2 = poBox.toLowerCase();
            //Create Service Leg record for stop 1
            var service_leg_record = record.create({
                type: 'customrecord_service_leg',
                isDynamic: true
            });

            //Set customer id in service  record for stop 1
            service_leg_record.setValue({
                fieldId: 'custrecord_service_leg_customer',
                value: custId
            });

            //set service id in service leg record for stop 1
            service_leg_record.setValue({
                fieldId: 'custrecord_service_leg_service',
                value: serviceId
            });

            log.debug({
                title: "customer",
                details: stop_location_type
            });
            //set address in service leg rec- dependent on if customer or not cust location
            if (stop_location_type === 'Customer') {
                log.debug({
                    title: 'in if statement',
                })

                service_leg_record.setValue({ fieldId: 'name', value: companyName });
                log.debug({
                    title: 'name',
                    details: service_leg_record.getValue({fieldId: 'name'})
                });

                log.debug({
                    title: 'name2',
                    details: companyName
                });
                //set location type in service leg rec for stop 1--> 1 for Customer, 2 for Non-Customer
                service_leg_record.setValue({ fieldId: 'custrecord_service_leg_location_type', value: 1 });
                
                var searched_address = search.load({
                    id: 'customsearch_smc_address',
                    type: search.Type.CUSTOMER
                });
                
                searched_address.filters.push(search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.IS,
                    values: custId
                }));

                var resultSet_addresses = searched_address.run();
                

                log.debug({ title: 'stop_location', details: stop_location });
                log.debug({ title: 'po_box2', details: poBox_2 });


                resultSet_addresses.each(function(searchResult_address) {
                    var addr_id = searchResult_address.getValue({name: 'addressinternalid', join: 'Address'});
                    var addr_id_2 = addr_id.toLowerCase();
                    //potentially might be getText
                    var addr_label = searchResult_address.getValue({ name: "addresslabel",join: "Address" });
                    var addr_label_2 = addr_label.toLowerCase();
                    
                    //sometimes is postal i.e. PO and else it is "ground floor etc"
                    var addr1 = searchResult_address.getValue({name: 'address1',join: 'Address'});
                    var addr1_2 = addr1.toLowerCase();
                    //street num name
                    var addr2 = searchResult_address.getValue({name: 'address2',join: 'Address'});
                    var addr2_2 = addr2.toLowerCase();
                    var city = searchResult_address.getValue({name: 'city',join: 'Address'});
                    var city_2 = city.toLowerCase();
                    var state = searchResult_address.getValue({name: 'state',join: 'Address'});
                    var state_2 = state.toLowerCase();
                    var zip = searchResult_address.getValue({name: 'zipcode',join: 'Address'});
                    var lat = searchResult_address.getValue({name: 'custrecord_address_lat',join: 'Address'});
                    var lon = searchResult_address.getValue({name: 'custrecord_address_lon',join: 'Address'}).toLowerCase();
                    
                    log.debug({ title: 'addr_label', details: addr_label });
                    log.debug({ title: 'addr_label_2', details: addr_label_2 });
                    log.debug({ title: 'addr1', details: addr1 });
                    log.debug({ title: 'addr1_2', details: addr1_2 });
                    log.debug({ title: 'addr2', details: addr2 });
                    log.debug({ title: 'addr2_2', details: addr2_2 });
                    log.debug({ title: 'city', details: city });
                    log.debug({ title: 'city_2', details: city_2 });

                    if (isNullorEmpty(poBox)) {
                        if (stop_location.indexOf(addr2_2) !== -1 && stop_location.indexOf(city_2) !== -1 && stop_location.indexOf(state_2) !== -1 && stop_location.indexOf(zip) !== -1 ) {
                            log.debug({
                                title: 'in first address',
                                
                            });
                            
                            //type of address i.e. site address, billing addr etc
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr',value: addr_id});
                            
                            //might fail if po box is null value?
                            // service_leg_record.setValue({ fieldId: 'custrecord_service_leg_addr_postal',value: addr_postal,});

                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_subdwelling',value: addr1});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_st_num_name',value: addr2});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_suburb',value: city,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_state',value: state,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_postcode',value: zip,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lat',value: lat,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lon',value: lon,});
                            
                            return false;
                        }
                    } else {
                        //case when po box is in addr2 col
                        if (addr2_2.indexOf("PO Box") === 0 && addr2_2.indexOf(poBox_2) !== -1 && stop_location.indexOf(city_2) !== -1 && stop_location.indexOf(state_2) !== -1 && stop_location.indexOf(zip) !== -1 ) {
                            
                            log.debug({
                                title: 'in first address',
                                
                            });
                            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_addr', value: addr_id });
                            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_addr_postal',value: addr2,});
                            //NULL VALUR ERRORS?
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_st_num_name',value: ''});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_subdwelling',value: ''});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_suburb',value: city,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_state',value: state,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_postcode',value: zip,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lat',value: lat,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lon',value: lon,});
                            return false;
                        } else if(addr1_2.indexOf(poBox_2) !== -1 && stop_location.indexOf(addr2_2) !== -1 && stop_location.indexOf(city_2) !== -1 && stop_location.indexOf(state_2) !== -1 && stop_location.indexOf(zip) !== -1 ) {
                            log.debug({
                                title: 'in first address',
                                
                            });
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr',value: addr_id});
                            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_addr_postal',value: addr1,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_st_num_name',value: addr2});
                            //service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_subdwelling',value: ''});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_suburb',value: city,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_state',value: state,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_postcode',value: zip,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lat',value: lat,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lon',value: lon,});
                            return false;
                        }
                    }                         
                    
                    return true;
                });

                
            } else {
                //set location type in service leg rec for stop 1--> 1 for Customer, 2 for Non-Customer
                service_leg_record.setValue({ fieldId: 'custrecord_service_leg_location_type', value: 2 });
                
                var zeeRec = record.load({
                    type: record.Type.PARTNER,
                    id: zee,
                });
                var zeeLocation = zeeRec.getValue({ fieldId: 'location' })
                var searched_ncl = search.load({
                    id: 'customsearch_smc_noncust_location',
                    type: 'customrecord_ap_lodgment_location'
                })
                
                if (zeeLocation == 6) {
                    searched_ncl.filters.push(search.createFilter({
                        name: 'custrecord_ap_lodgement_site_state',
                        operator: search.Operator.ANYOF,
                        values: [1, 6]
                    }));
    
                } else {
                    searched_ncl.filters.push(search.createFilter({
                        name: 'custrecord_ap_lodgement_site_state',
                        operator: search.Operator.IS,
                        values: zeeLocation
                    }));
    
                    
                }

                var resultSet_ncl = searched_ncl.run();
                // original_service_leg_id
                // old_stop_id
                resultSet_ncl.each(function(searchResult_ncl) {
                    
                    var internal_id = searchResult_ncl.getValue('internalid');
                    var name = searchResult_ncl.getValue('name').toLowerCase();
                    var name2 = searchResult_ncl.getValue('name');
                    var post_code = searchResult_ncl.getValue('custrecord_ap_lodgement_postcode');
                    var addr1 = searchResult_ncl.getValue('custrecord_ap_lodgement_addr1');
                    var addr1_2 = addr1.toLowerCase();
                    var addr2 = searchResult_ncl.getValue('custrecord_ap_lodgement_addr2');
                    var addr2_2 = addr2.toLowerCase();
                    var state = searchResult_ncl.getValue('custrecord_ap_lodgement_site_state');
                    var city = searchResult_ncl.getValue('custrecord_ap_lodgement_suburb');
                    var city_2 = city.toLowerCase();
                    var lat = searchResult_ncl.getValue('custrecord_ap_lodgement_lat');
                    var lon = searchResult_ncl.getValue('custrecord_ap_lodgement_long');
                    
                    // var h = "hello";
                    // var hh = "Hello hello I am";
                    // if (hh.indexOf(h) !== -1 ) {
                    //     log.debug({
                    //         title: "includes worked",
                    //     });
                    //     log.debug({
                    //         title: 'test',
                    //         details: hh.indexOf(h)
                    //     })
                    // } else {
                    //     'false';
                    // }

                    // log.debug({
                    //     title: 'loop addr',
                    //     details: name
                    // });

                    // log.debug({
                    //     title: 'loop addr',
                    //     details: stop_location
                    // });

                    if (stop_location.indexOf(name) !== -1  || name.indexOf(stop_location) !== -1 ) {
                        service_leg_record.setValue({ fieldId: 'custrecord_service_leg_addr_postal',value: addr1});
                        log.debug({
                            title: 'in 2nd address',
                            
                        });
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr',value: internal_id});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_st_num_name',value: addr2});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_suburb',value: city,});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_state',value: state,});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_postcode',value: post_code,});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lat',value: lat,});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lon',value: lon,});
                        service_leg_record.setValue({ fieldId: 'custrecord_service_leg_non_cust_location', value: internal_id });
                        
                        log.debug({
                            title: 'nameee',
                            details: name
                        });
                        service_leg_record.setValue({ fieldId: 'name', value: name2 });
                        log.debug({
                            title: 'namewwe',
                            details: service_leg_record.getValue({fieldId: 'name'})
                        });
                        return false;
                    }
        
                    return true;
                });
            }
            

            service_leg_record.setValue({fieldId: 'custrecord_service_leg_duration',value: stop_duration });
            // regex to remove first and last quotes in string
            stop_notes = stop_notes.replace(/^"(.*)"$/, '$1');

            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_notes', value: stop_notes });

            log.debug({
                title: 'zee',
                details: zee
            });
            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_franchisee', value: zee});
            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_number', value: service_leg_number})

            var id = service_leg_record.save({
                enableSourcing: true,
            });

            return id;
            
           
        }
        /*
        *  2. Schedule Service
        *      Frequency (Daily, ADHOC. M,T,W,T,F,S,S)
        *      2.1 Stop 1 Info
        *          Select Run - Run created yet?
        *          Service Time - Earliest & Latest Time (AM/PM)
        *      2.2 Stop 2 Info
        *          Select Run
        *          Service Time
        * 
        * assume that freq record has to be created and not loaded- not sure the logic
        * 
        */

        //only for setting up new stops atm

        function scheduleService(stop_1_id, stop_2_id, frequency, custID, zee_id, driver, run_input_name, service_id, stop1_time, stop2_time ) {
            // GET STOP 1 and STOP 2 ID from createStop()
            if(!isNullorEmpty(stop_1_id) && !isNullorEmpty(stop_2_id)) {
                //check line 970 in cl schedule service; check if new stop was created?
                // what is rows??
                var rows = [];
                //if (rows.length == 1 || rows.length == 0 ) {
                    // this if statement will change for edit stop
                    if(!isNullorEmpty(frequency)) {

                        //what;s the id??
                        var freq_record1 = record.create({ type: 'customrecord_service_freq' });

                        log.debug({
                            title: 'time',
                            details: stop1_time
                        });
                        

                        
                        stop1_time = stop1_time.toLowerCase();
                        var ampm = stop1_time.replace(/[0-9:]/g, '');
                        ampm = ampm.toLowerCase();
                        stop1_time = stop1_time.replace(/[a-zA-Z]/g, '').trim();
                        stop1_time = stop1_time + ' ' + ampm;

                        stop1_time = convertTo24Hour(stop1_time);
                        var earliest_time = stop1_time;
                        var latest_time = stop1_time;

                        var hours_string = (stop1_time.substr(0, 2));
                        var hours = parseInt(stop1_time.substr(0, 2));

                        

                        if (hours < 9 && hours != 0) {
                            earliest_time = stop1_time.replace(hours_string, '0' + (hours - 1));
                            latest_time = stop1_time.replace(hours_string, '0' + (hours + 1));
                        } else if (hours == 9) {
                            earliest_time = stop1_time.replace(hours_string, '0' + (hours - 1));
                            latest_time = stop1_time.replace(hours_string, (hours + 1));
                        } else if (hours == 10) {
                            earliest_time = stop1_time.replace(hours_string, '0' + (hours - 1));
                            latest_time = stop1_time.replace(hours_string, (hours + 1));
                        } else if (hours > 10) {
                            earliest_time = stop1_time.replace(hours_string, (hours - 1));
                            latest_time = stop1_time.replace(hours_string, (hours + 1));
                        }                                             
                        
                        var stop1_time_arr = stop1_time.split(':');
                        var currTime_1 = stop1_time_arr[0];
                        var currTime_2 = stop1_time_arr[1];

                        log.debug({
                            title: 'currTime_1',
                            details: currTime_1
                        });

                        log.debug({
                            title: 'currTime_2',
                            details: currTime_2
                        });

                        log.debug({
                            title: 'new date',
                            details: new Date()
                        });
                        var earliest_arr = earliest_time.split(':');
                        var earliest_1 = earliest_arr[0];
                        var earliest_2 = earliest_arr[1];
                        
                        var latest_arr = latest_time.split(':');
                        var latest_1 = latest_arr[0];
                        var latest_2 = latest_arr[1];
                        
                        var today = new Date();
                        // var today_day_in_month = today.getDate();
                        // var today_month = today.getMonth();
                        // var today_year = today.getFullYear();
                        
                        // var currTimeVar = new Date(Date.UTC(today_year, today_month, today_day_in_month, currTime_1, currTime_2, 0, 0));

                        // var earlyTimeVar = new Date(Date.UTC(today_year, today_month, today_day_in_month, earliest_1, earliest_2, 0, 0));

                        // var lateTimeVar = new Date(Date.UTC(today_year, today_month, today_day_in_month, latest_1, latest_2, 0, 0));
                      
                        var currTimeVar = new Date();
                        currTimeVar.setHours(currTime_1, currTime_2, 0, 0);

                        var earlyTimeVar = new Date();
                        earlyTimeVar.setHours(earliest_1, earliest_2, 0, 0);

                        var lateTimeVar = new Date();
                        lateTimeVar.setHours(latest_1, latest_2, 0, 0);

                        log.debug({
                            title: 'currTimeVar',
                            details: currTimeVar
                        });

                        log.debug({
                            title: 'earlyTimeVar',
                            details: earlyTimeVar
                        });

                        log.debug({
                            title: 'lateTimeVar',
                            details: lateTimeVar
                        });

                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_customer', value: custID });
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_service', value:  service_id });
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_stop', value: stop_1_id });
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_time_start', value: earlyTimeVar});
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_time_end', value: lateTimeVar});
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_time_current', value: currTimeVar});

                        


                        var freq_record2 = record.create({ type: 'customrecord_service_freq'});

                        
                        stop2_time = stop2_time.toLowerCase();
                        var ampm = stop2_time.replace(/[0-9:]/g, '');
                        ampm = ampm.toLowerCase();
                        stop2_time = stop2_time.replace(/[a-zA-Z]/g, '').trim();
                        stop2_time = stop2_time + ' ' + ampm;

                        stop2_time = convertTo24Hour(stop2_time);
                        var earliest_time = stop2_time;
                        var latest_time = stop2_time;

                        var hours_string = (stop2_time.substr(0, 2));
                        var hours = parseInt(stop2_time.substr(0, 2));

                        

                        if (hours < 9 && hours != 0) {
                            earliest_time = stop2_time.replace(hours_string, '0' + (hours - 1));
                            latest_time = stop2_time.replace(hours_string, '0' + (hours + 1));
                        } else if (hours == 9) {
                            earliest_time = stop2_time.replace(hours_string, '0' + (hours - 1));
                            latest_time = stop2_time.replace(hours_string, (hours + 1));
                        } else if (hours == 10) {
                            earliest_time = stop2_time.replace(hours_string, '0' + (hours - 1));
                            latest_time = stop2_time.replace(hours_string, (hours + 1));
                        } else if (hours > 10) {
                            earliest_time = stop2_time.replace(hours_string, (hours - 1));
                            latest_time = stop2_time.replace(hours_string, (hours + 1));
                        }                                             
                        
                        var stop2_time_arr = stop2_time.split(':');
                        var currTime_1 = stop2_time_arr[0];
                        var currTime_2 = stop2_time_arr[1];

                        
                        var earliest_arr = earliest_time.split(':');
                        var earliest_1 = earliest_arr[0];
                        var earliest_2 = earliest_arr[1];
                        
                        var latest_arr = latest_time.split(':');
                        var latest_1 = latest_arr[0];
                        var latest_2 = latest_arr[1];
                        
                        var today = new Date();
                        // var today_day_in_month = today.getDate();
                        // var today_month = today.getMonth();
                        // var today_year = today.getFullYear();
                        
                        // var currTimeVar = new Date(Date.UTC(today_year, today_month, today_day_in_month, currTime_1, currTime_2, 0, 0));

                        // var earlyTimeVar = new Date(Date.UTC(today_year, today_month, today_day_in_month, earliest_1, earliest_2, 0, 0));

                        // var lateTimeVar = new Date(Date.UTC(today_year, today_month, today_day_in_month, latest_1, latest_2, 0, 0));
                      
                        var currTimeVar = new Date();
                        currTimeVar.setHours(currTime_1, currTime_2, 0, 0);

                        var earlyTimeVar = new Date();
                        earlyTimeVar.setHours(earliest_1, earliest_2, 0, 0);

                        var lateTimeVar = new Date();
                        lateTimeVar.setHours(latest_1, latest_2, 0, 0);

                        

                        log.debug({
                            title: 'currTimeVar',
                            details: currTimeVar
                        });

                        log.debug({
                            title: 'earlyTimeVar',
                            details: earlyTimeVar
                        });

                        log.debug({
                            title: 'lateTimeVar',
                            details: lateTimeVar
                        });

                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_customer', value:  custID });
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_service', value:  service_id });
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_stop', value: stop_2_id });
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_time_start', value: earlyTimeVar});
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_time_end', value: lateTimeVar});
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_time_current', value: currTimeVar });


                        var runPlan_search = search.load({
                            id: 'customsearch_app_run_plan_active',
                            type: 'customrecord_run_plan'
                        });
                        
                        runPlan_search.filters.push(search.createFilter({
                            name: 'custrecord_run_franchisee',
                            operator: search.Operator.IS,
                            values: zee_id
                        }));

                        var runPlan_results = runPlan_search.run();
                        runPlan_results.each(function(searchResult) {
                            run_id = searchResult.getValue('internalid');
                            run_name = searchResult.getValue('name');
                            if(run_name.indexOf(run_input_name)  !== -1 || run_input_name.indexOf(run_name)  !== -1 ) {
                                freq_record2.setValue({ fieldId: 'custrecord_service_freq_run_plan', value: run_id });
                                freq_record1.setValue({ fieldId: 'custrecord_service_freq_run_plan', value: run_id });

                                return false;
                            }
                
                        });

                        var freq = frequency.split('/');
                        //freq = freq.map(name => name.toLowerCase());
                        freq = freq.map(function(v) {
                            return v.toLowerCase();
                        });
                        if (freq.indexOf("mon") !== -1 || freq.indexOf("monday") !== -1 ) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: true});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: true});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: false});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: false});

                        }
                        if (freq.indexOf("tue") !== -1 || freq.indexOf("tuesday") !== -1 ) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: true});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: true});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: false});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: false});

                        }
                        if (freq.indexOf("wed") !== -1 || freq.indexOf("wednesday") !== -1) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: true});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: true});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: false});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: false});

                        }
                        if (freq.indexOf("thurs") !== -1 || freq.indexOf("thursday") !== -1) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: true});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: true});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: false});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: false});

                        }
                        if (freq.indexOf("fri") !== -1 || freq.indexOf("friday") !== -1) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: true});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: true});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: false});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: false});

                        }

                        if (freq.indexOf("adhoc") !== -1) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_adhoc', value: true});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_adhoc', value: true});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_adhoc', value: false});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_adhoc', value: false});

                        }

                        //check if daily is mon to fri
                        if (freq.indexOf("daily") !== -1) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: true});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: true});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: true});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: true});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: true});

                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: true});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: true});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: true});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: true});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: true});
                        }
                        var freq1_id = freq_record1.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });

                        var freq2_id = freq_record2.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });

                        //Update the Run Scheduled box for the service
                        var service_record = record.load({ type: 'customrecord_service', id: service_id});
                        service_record.setValue({ fieldId: 'custrecord_service_run_scheduled', value: 1});
                    
                        ///CHECK
                        ///service_record.setValue({type: 'custrecord_multiple_operators', id: multiple_operators});
                        service_record.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });

                        log.debug({
                            title: '1 id',
                            details: freq1_id
                        });

                        log.debug({
                            title: '2 id',
                            details: freq2_id
                        });

                    }   
                //}               
            }
        }

        function saveData(internalID, custId, companyName, service_id, service_name, price, frequency, stop1_location_type, poBox1, poBox2, stop1_location, stop1_time, stop1_duration, stop1_notes, stop1_transfer, stop2_location_type, stop2_location, stop2_time, stop2_duration, stop2_transfer, stop2_notes, driver, run_name, stop1_id, stop2_id){

            log.audit({
                title: 'Save Record Initialised'
            });

            var stopRecord1 = record.load({
                type: 'customrecord_service_leg',
                id: stop1_id
            });
            var stopRecord2 = record.load({
                type: 'customrecord_service_leg',
                id: stop2_id
            });
            stop1_location = stopRecord1.getValue({ fieldId: 'name'})
            stop2_location = stopRecord2.getValue({ fieldId: 'name'})

            var saveRecord = record.create({
                type: 'customrecord_import_excel'
            });

            log.debug({
                title: 'stop1 notes',
                details: stop1_notes
            });

            var name = 'cust_id: ' + internalID +' _service_id: ' + service_id + ' _date_ ' + getDate();
            saveRecord.setValue({
                fieldId: 'name',
                value: name
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_custid',
                value: internalID
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_company',
                value: companyName
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_service_id',
                value: service_id
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_service_name',
                value: service_name
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_price',
                value: price
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_freq',
                value: frequency
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_po_box1',
                value: poBox1
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_po_box2',
                value: poBox2
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop1_type',
                value: stop1_location_type
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop1_location',
                value: stop1_location
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop1_time',
                value: stop1_time
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop1_duration',
                value: stop1_duration
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop1_notes',
                value: stop1_notes
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop2_type',
                value: stop2_location_type
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop2_location',
                value: stop2_location
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop2_time',
                value: stop2_time
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop2_duration',
                value: stop2_duration
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop2_notes',
                value: stop2_notes
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_driver',
                value: driver
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_run_name',
                value: run_name
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop1_transfer',
                value: stop1_transfer
            });
            saveRecord.setValue({
                fieldId: 'custrecord_import_excel_stop2_transfer',
                value: stop2_transfer
            });
            if (!isNullorEmpty(service_id)){
                log.audit({
                    title: 'Save SS Record'
                })
                saveRecord.save();
            }

            
        }

        function deleteRecords() {
            log.debug({
                title: 'DELETE STRING ACTIVATED'
            });
            var importExcelSearch = search.load({
                type: 'customrecord_import_excel',
                id: 'customsearch_import_excel_table_2'
            });
            importExcelSearch.run().each(function(result) {
                
                var index = result.getValue('internalid');
                
                
                // if (name != 'END'){
                deleteResultRecord(index);
                // } else {
                //     record.delete({
                //         type: 'customrecord_debt_coll_inv',
                //         id: index
                //     });
                    // return true;
                // }
                return true;
            });

            
        }

        function deleteResultRecord(index) {
            // var usage_loopstart_cust = ctx.getRemainingUsage();
            // if (usage_loopstart_cust < 4 || index == 3999) {
            //     // Rescheduling a scheduled script doesn't consumes any governance units.
            //     var delReschedule = task.create({
            //         taskType: task.TaskType.SCHEDULED_SCRIPT,
            //         scriptId: 'customscript_ss_debt_coll_delete',
            //         deploymentId: 'customdeploy_ss_debt_coll_delete'
            //     });
            //     var delResult = delReschedule.submit();
            // }
            log.debug({
                title: 'Delete index',
                details: index
            });
            // Deleting a record consumes 4 governance units.
            record.delete({
                type: 'customrecord_import_excel',
                id: index
            });
            log.debug({
                title: 'Removed',
                details: 'Removed'
            });
        }

        /**
         * [getDate description] - Get the current date
         * @return {[String]} [description] - return the string date
         */
        function getDate() {
            var date = new Date();
            date = format.parse({
                value: date,
                type: format.Type.DATE,
                timezone: format.Timezone.AUSTRALIA_SYDNEY
            });

            return date;
        }

        function convertTo24Hour(time) {
            var hours = parseInt(time.substr(0, 2));
            if (time.indexOf('am') != -1 && hours == 12) {
                time = time.replace('12', '0');
            }
            if (time.indexOf('am') != -1 && hours < 10) {
                time = time.replace(hours, ('0' + hours));
            }
            if (time.indexOf('pm') != -1 && hours < 12) {
                time = time.replace(hours, (hours + 12));
            }
            return time.replace(/( am| pm)/, '');
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

