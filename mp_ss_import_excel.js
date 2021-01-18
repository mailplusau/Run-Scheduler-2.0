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
         *  3. Completed
         */

        function main(context){
            log.audit({
                title: 'SS Initialised',
                details: any
            });

            var excelImportSearch = search.load({
                type: 'customseach',
                id: ''
            });

            var data_set = ctx.getParameter({
                name: 'custscript_data_set'
            });
            if (isNullorEmpty(data_set)){
                data_set = [];
            }

            var stage = ctx.getParameter({
                name: 'custscript_stage'
            });
            if (isNullorEmpty(stage)){
                stage = 0;
            }

            var res = excelImportSearch.run();

            log.audit({
                title: 'JSON.stringify(res)',
                details: JSON.stringify(res)
            })
            
            res.each( function(val, index){
                indexInCallback = index;

                var usageLimit = ctx.getRemainingUsage();
                if (usageLimit < 200) {
                    params = {
                        custscript_data_set: JSON.stringify(data_set),
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
                    // }
                } else {
                    val; // Value of Array containing csv elements.

                    // Variables of All Column Items
                    var id = val[0];
                    var comp = val[1];
                    var serv = val[2];
                    var price = val[3];
                    var freq = val[4];
                    var po = val[5];
                    var stop_1 = val[6];
                    var stop_1_time = val[7];
                    var stop_1_dur = val[8];
                    var stop_2 = val[9];
                    var stop_2_time = val[10];
                    var stop_2_dur = val[11];
                    var notes = val[12];
                    var name = val[13];

                    // Start Functions here.

                    if (stage == 0){ // Create Stops
                        stage++;

                    }

                    if (stage == 1){ // Schedule Service 
                        stage++;

                    }

                    if (stage == 2){
                        stage++;

                    }
                    return true;
                }
            });

        }

        /**
         * Used to pass the values of `date_from` and `date_to` between the scripts and to Netsuite for the records and the search.
         * @param   {String} date_iso       "2020-06-01"
         * @returns {String} date_netsuite  "1/6/2020"
         */
        function dateISOToNetsuite(date_iso) {
            var date_netsuite = '';
            if (!isNullorEmpty(date_iso)) {
                var date_utc = new Date(date_iso);
                // var date_netsuite = nlapiDateToString(date_utc);
                var date_netsuite = format.format({
                    value: date_utc,
                    type: format.Type.DATE,
                    timezone: format.Timezone.AUSTRALIA_SYDNEY
                });
            }
            return date_netsuite;
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

