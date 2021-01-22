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
            var zee_id = context.request.parameters.zee_id
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
            

            // ADD ENTITYID i.e. 751172738 id of customer in excel
            // FIX UP NAMES AND "\""- match with cl
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
            var stop1_time = rs_values[8];
            var stop1_duration = rs_values[8];
            var stop1_notes = rs_values[8];

            var stop2_location = "\"" + rs_values[9]+ "\"";
            var stop2_time = rs_values[10];
            var stop2_duration = rs_values[8];
            var stop2_notes = rs_values[8];

            var notes = "\"" + rs_values[11]+ "\"";
            var driver = rs_values[12];
            var run_name = rs_values[13];


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
                        var stop1_id = 0;
                        var stop2_id = 0;
                        if (stage == 0){ // Create Stops
                            stage++;

                            var service_leg_1 = 1;
                            var service_leg_2 = 2;
                            var stop1_id = createStop(service_leg_1);
                            var stop2_id = createStop(service_leg_2);
                        }

                        if (stage == 1){ // Schedule Service 
                            stage++;
                            scheduleService(stop1_id, stop2_id);

                        }

                        if (stage == 2){
                            stage++;

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
         * leg number is hardcoded i.e. stop1 = 1, stop2 = 2
        */
        function createStop(service_leg_number, custId, zee, companyName, serviceId, stop_location_type, stop_location, poBox, stop_duration, stop_notes ){

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

            //set location type in service leg rec for stop 1
            service_leg_record.setValue({
                fieldId: 'custrecord_service_leg_location_type',
                value: stop_location_type
            });

            
            //set address in service leg rec- dependent on if customer or not cust location
            if (stop_location_type == 'Customer') {
                service_leg_record.setValue({ fieldId: 'name', value: companyName });
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

                resultSet_addresses.each(function(searchResult_address) {
                    var addr_id = searchResult_address.getValue({name: 'addressinternalid', join: 'Address'});
                    //potentially might be getText
                    var addr_label = searchResult_address.getValue({ name: "addresslabel",join: "Address" }),
                    //sometimes is postal i.e. PO and else it is "ground floor etc"
                    var addr1 = searchResult_address.getValue({name: 'address1',join: 'Address'});
                    //street num name
                    var addr2 = searchResult_address.getValue({name: 'address2',join: 'Address'});
                    var city = searchResult_address.getValue({name: 'city',join: 'Address'});
                    var state = searchResult_address.getValue({name: 'state',join: 'Address'});
                    var zip = searchResult_address.getValue({name: 'zipcode',join: 'Address'});
                    var lat = searchResult_address.getValue({name: 'custrecord_address_lat',join: 'Address'});
                    var lon = searchResult_address.getValue({name: 'custrecord_address_lon',join: 'Address'});
                    
                    if (isNullorEmpty(poBox)) {
                        if (stop_location.contains(addr2) && stop_location.contains(city) && stop_location.contains(state) && stop_location.contains(zip)) {
                            //type of address i.e. site address, billing addr etc
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr',value: addr_label});
                            
                            //might fail if po box is null value?
                            // service_leg_record.setValue({ fieldId: 'custrecord_service_leg_addr_postal',value: addr_postal,});

                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_subdwelling',value: addr1});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_st_num_name',value: addr2});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_suburb',value: city,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_state',value: state,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_postcode',value: zip,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lat',value: lat,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lon',value: lon,});
                            
                            break;
                        }
                    } else {
                        //case when po box is in addr2 col
                        if (addr2.startsWith("PO Box") && addr2.contains(poBox) && stop_location.contains(city) && stop_location.contains(state) && stop_location.contains(zip)) {
                            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_addr', value: addr_label });
                            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_addr_postal',value: addr2,});
                            //NULL VALUR ERRORS?
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_st_num_name',value: ''});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_subdwelling',value: ''});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_suburb',value: city,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_state',value: state,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_postcode',value: zip,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lat',value: lat,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lon',value: lon,});

                        } else if(addr2.contains(poBox) && stop_location.contains(addr2) && stop_location.contains(city) && stop_location.contains(state) && stop_location.contains(zip)) {
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr',value: addr_label});
                            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_addr_postal',value: addr1,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_st_num_name',value: addr2});
                            //service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_subdwelling',value: ''});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_suburb',value: city,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_state',value: state,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_postcode',value: zip,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lat',value: lat,});
                            service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lon',value: lon,});
                        }
                    }                         
                    
                    return true;
                });

                
            } else {
                
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
                original_service_leg_id
                old_stop_id
                resultSet_ncl.each(function(searchResult_ncl) {

                    var internal_id = searchResult_ncl.getValue('internalid');
                    var name = searchResult_ncl.getValue('name');
                    var post_code = searchResult_ncl.getValue('custrecord_ap_lodgement_postcode');
                    var addr1 = searchResult_ncl.getValue('custrecord_ap_lodgement_addr1');
                    var addr2 = searchResult_ncl.getValue('custrecord_ap_lodgement_addr2');
                    var state = searchResult_ncl.getValue('custrecord_ap_lodgement_site_state');
                    var city = searchResult_ncl.getValue('custrecord_ap_lodgement_suburb');
                    var lat = searchResult_ncl.getValue('custrecord_ap_lodgement_lat');
                    var lon = searchResult_ncl.getValue('custrecord_ap_lodgement_long');
                    
                    if ((poBox.contains(addr1) || stop_location.contains(addr1)) && stop_location.contains(addr2) && stop_location.contains(city) && stop_location.contains(state) && stop_location.contains(post_code)) {
                        service_leg_record.setValue({ fieldId: 'custrecord_service_leg_addr_postal',value: addr1,});

                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_st_num_name',value: addr2});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_suburb',value: city,});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_state',value: state,});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_postcode',value: post_code,});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lat',value: lat,});
                        service_leg_record.setValue({fieldId: 'custrecord_service_leg_addr_lon',value: lon,});
                        service_leg_record.setValue({ fieldId: 'custrecord_service_leg_non_cust_location', value: name });
                        
                        service_leg_record.setValue({ fieldId: 'name', value: name });

                        break;
                    }
        
                    return true;
                });
            }
            

            service_leg_record.setValue({fieldId: 'custrecord_service_leg_duration',value: stop_duration });
            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_notes', value: stop_notes });

            var stop_id = service_leg_record.getValue({fieldId: 'id'});
            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_franchisee', value: zee});
            service_leg_record.setValue({ fieldId: 'custrecord_service_leg_number', value: service_leg_number})

            service_leg_record.save({
                enableSourcing: true,
            });
            
            return stop_id;
            
           
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
        */

        //only for setting up new stops atm

        function scheduleService(stop_1_id, stop_2_id, frequency, custID, zee_id, driver, run_input_name, service_id, stop1_time, stop2_time ) {
            // GET STOP 1 and STOP 2 ID from createStop()
            if(!isNullorEmpty(stop_1_id) && !isNullorEmpty(stop_2_id)) {
                //check line 970 in cl schedule service; check if new stop was created?
                // what is rows??
                if (rows.length == 1 || rows.length == 0 ) {
                    // this if statement will change for edit stop
                    if(!isNullorEmpty(frequency)) {

                        //what;s the id??
                        var freq_record1 = record.load({
                            type: 'customrecord_service_freq',
                            id: 1
                        });

                        var runPlan_search = search.load({
                            id: 'customsearch_app_run_plan_active',
                            type: 'customrecord_run_plan'
                        });
                        
                        runPlan_search.filters.push(search.createFilter({
                            name: 'partner',
                            operator: search.Operator.IS,
                            values: zee_id
                        }));

                        var run_id = 0;
                        var runPlan_results = runPlan_search.run();
                        runPlan_results.each(function(searchResult) {
                            run_id = searchResult.getValue('internalid');
                            run_name = searchResult_zee.getValue('name');
                            if(run_name.isEqualTo(run_input_name)) {
                                break;
                            }
                
                        });

                        //what format will stop1 times be etc?
                        //var stop1_24hr_time = convertto24Hour(stop1_time);
                        var hours_string = (stop1_time.substr(0, 2));
                        var hours = parseInt(stop1_time.substr(0, 2));
                        var earliest_time = stop1_time;
                        var latest_time = stop1_time;
                        
                        if (hours < 9 && hours != 0) {
                            earliest_time = service_time.replace(hours_string, '0' + (hours - 1));
                            latest_time = service_time.replace(hours_string, '0' + (hours + 1));
                        } else if (hours == 9) {
                            earliest_time = service_time.replace(hours_string, '0' + (hours - 1));
                            latest_time = service_time.replace(hours_string, (hours + 1));
                        } else if (hours == 10) {
                            earliest_time = service_time.replace(hours_string, '0' + (hours - 1));
                            latest_time = service_time.replace(hours_string, (hours + 1));
                        } else if (hours > 10) {
                            earliest_time = service_time.replace(hours_string, (hours - 1));
                            latest_time = service_time.replace(hours_string, (hours + 1));
                        }

                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_customer', value: custID });
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_run_plan', value: run_id });
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_service', value:  service_id });
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_stop', value: stop_1_id });
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_time_start', value: earliest_time});
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_time_end', value: latest_time});
                        freq_record1.setValue({ fieldId: 'custrecord_service_freq_time_current', value: stop1_time});

                        


                        var freq_record2 = record.load({
                            type: 'customrecord_service_freq',
                            id: 2
                        });

                        var hours_string2 = (stop2_time.substr(0, 2));
                        var hours2 = parseInt(stop2_time.substr(0, 2));
                        var earliest_time2 = stop2_time;
                        var latest_time2 = stop2_time;
                        
                        if (hours2 < 9 && hours2 != 0) {
                            earliest_time2 = service_time.replace(hours_string2, '0' + (hours2 - 1));
                            latest_time2 = service_time.replace(hours_string2, '0' + (hours2 + 1));
                        } else if (hours2 == 9) {
                            earliest_time2 = service_time.replace(hours_string2, '0' + (hours2 - 1));
                            latest_time2 = service_time.replace(hours_string2, (hours2 + 1));
                        } else if (hours2 == 10) {
                            earliest_time2 = service_time.replace(hours_string2, '0' + (hours2 - 1));
                            latest_time2 = service_time.replace(hours_string2, (hours2 + 1));
                        } else if (hours2 > 10) {
                            earliest_time2 = service_time.replace(hours_string2, (hours2 - 1));
                            latest_time2 = service_time.replace(hours_string2, (hours2 + 1));
                        }


                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_customer', value:  custID });
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_run_plan', value: run_id });
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_service', value:  service_id });
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_stop', value: stop2_id });
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_time_start', value: earliest_time2});
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_time_end', value: latest_time2});
                        freq_record2.setValue({ fieldId: 'custrecord_service_freq_time_current', value: stop2_time });

                        var freq = frequency.split('/');
                        freq.map(name => name.toLowerCase());

                        if (freq.includes("mon") || freq.includes("monday")) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: 'T'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: 'T'});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: 'F'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: 'F'});

                        }
                        if (freq.includes("tue") || freq.includes("tuesday")) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: 'T'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: 'T'});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: 'F'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: 'F'});

                        }
                        if (freq.includes("wed") || freq.includes("wednesday")) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: 'T'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: 'T'});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: 'F'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: 'F'});

                        }
                        if (freq.includes("thurs") || freq.includes("thursday")) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: 'T'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: 'T'});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: 'F'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: 'F'});

                        }
                        if (freq.includes("fri") || freq.includes("friday")) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: 'T'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: 'T'});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: 'F'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: 'F'});

                        }

                        if (freq.includes("adhoc")) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_adhoc', value: 'T'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_adhoc', value: 'T'});

                        } else {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_adhoc', value: 'F'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_adhoc', value: 'F'});

                        }

                        //check if daily is mon to fri
                        if (freq.includes("daily")) {
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: 'T'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: 'T'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: 'T'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: 'T'});
                            freq_record1.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: 'T'});

                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_mon', value: 'T'});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_tue', value: 'T'});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_wed', value: 'T'});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_thu', value: 'T'});
                            freq_record2.setValue({ fieldId: 'custrecord_service_freq_day_fri', value: 'T'});
                        }
                        freq_record1.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });

                        freq_record2.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });

                        //Update the Run Scheduled box for the service
                        var service_record = record.load({ type: 'customrecord_service', id: service_id});
                        service_record.setValue({ type: 'custrecord_service_run_scheduled', id: 1});
                    
                        ///CHECK
                        ///service_record.setValue({type: 'custrecord_multiple_operators', id: multiple_operators});
                        service_record.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });

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

