/**
 * Module Description
 * 
 * NSVersion    Date            			Author         
 * 1.00       	2018-09-21 08:36:21   		ankith.ravindran
 *
 * Description:         
 * 
 * @Last Modified by:   ankith.ravindran
 * @Last Modified time: 2019-05-07 10:37:29
 *
 */

 var days_of_week = [];
 days_of_week[0] = 0;
 days_of_week[1] = 'custrecord_service_freq_day_mon';
 days_of_week[2] = 'custrecord_service_freq_day_tue';
 days_of_week[3] = 'custrecord_service_freq_day_wed';
 days_of_week[4] = 'custrecord_service_freq_day_thu';
 days_of_week[5] = 'custrecord_service_freq_day_fri';
 days_of_week[6] = 6;
 
 function main() {
 
     var day = moment().utc().day();
 
     var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_rp_shift_run_times');
 
     if (day != 0 && day != 6) {
         var newFiltersRunPlan = new Array();
         newFiltersRunPlan[newFiltersRunPlan.length] = new nlobjSearchFilter(days_of_week[day], 'custrecord_service_freq_run_plan', 'is', 'T');
     }
 
     runPlanSearch.addFilters(newFiltersRunPlan);
 
     var resultRunPlan = runPlanSearch.runSearch();
 
     var old_run_plan_id;
     var old_end_time;
     var start_time;
     var old_stop_id;
     var old_stop_name;
     var old_operator_id;
     var old_operator_prem_id;
     var old_run_plan_name;
 
     var run_plan_count = 0;
     var driver_count = 0;
 
     var new_operator_prem_id = null;
 
     var shift_json = '';
     var driver_json = '';
 
     var freq = [];
     var old_freq = [];
 
     resultRunPlan.forEachResult(function(searchResult) {
 
         var run_plan_id = searchResult.getValue('internalid', null, "GROUP");
         var run_plan_name = searchResult.getValue('name', null, "GROUP");
         var operator_id = searchResult.getValue('custrecord_run_operator', null, "GROUP");
         var operator_text = searchResult.getText('custrecord_run_operator', null, "GROUP");
         var operator_prem_id = searchResult.getValue("custrecord_operator_prem_id", "CUSTRECORD_RUN_OPERATOR", "GROUP");
         var operator_email = searchResult.getValue("custrecord_operator_email", "CUSTRECORD_RUN_OPERATOR", "GROUP");
         var operator_phone = searchResult.getValue("custrecord_operator_phone", "CUSTRECORD_RUN_OPERATOR", "GROUP");
         var run_plan_start_time = convertTo24Hour(searchResult.getValue("custrecord_service_freq_time_start", "CUSTRECORD_SERVICE_FREQ_RUN_PLAN", "GROUP"));
         var run_plan_end_time = convertTo24Hour(searchResult.getValue("custrecord_service_freq_time_end", "CUSTRECORD_SERVICE_FREQ_RUN_PLAN", "GROUP"));
         // var freq_mon = searchResult.getValue("custrecord_service_freq_day_mon", "CUSTRECORD_SERVICE_FREQ_RUN_PLAN", "GROUP");
         // var freq_tue = searchResult.getValue("custrecord_service_freq_day_tue", "CUSTRECORD_SERVICE_FREQ_RUN_PLAN", "GROUP");
         // var freq_wed = searchResult.getValue("custrecord_service_freq_day_wed", "CUSTRECORD_SERVICE_FREQ_RUN_PLAN", "GROUP");
         // var freq_thu = searchResult.getValue("custrecord_service_freq_day_thu", "CUSTRECORD_SERVICE_FREQ_RUN_PLAN", "GROUP");
         // var freq_fri = searchResult.getValue("custrecord_service_freq_day_fri", "CUSTRECORD_SERVICE_FREQ_RUN_PLAN", "GROUP");
 
         var shiftsSearch = nlapiLoadSearch('customrecord_shifts', 'customsearch_rp_nowgo_created_shifts');
 
         if (day != 0 && day != 6) {
             var newFiltersShifts = new Array();
             newFiltersShifts[newFiltersShifts.length] = new nlobjSearchFilter('custrecord_ns_run_plan_id', null, 'anyof', run_plan_id);
         }
 
         shiftsSearch.addFilters(newFiltersShifts);
 
         var resultShifts = shiftsSearch.runSearch();
 
         var shiftsResult = resultShifts.getResults(0, 1);
 
         if (shiftsResult.length == 0) {
             if(run_plan_count == 0){
                 start_time = run_plan_start_time;
             }
             else if (run_plan_count > 0 && old_run_plan_id != run_plan_id) {
 
                 var start_time_array = start_time.split(':');
                 var json_start_time = moment().utc().hours(start_time_array[0]).minutes(start_time_array[1]).seconds(0).format();
 
                 var end_time_array = old_end_time.split(':');
                 var json_end_time = moment().utc().hours(end_time_array[0]).minutes(end_time_array[1]).seconds(0).format();
 
 
                 var shiftsRecord = nlapiCreateRecord('customrecord_shifts');
                 shiftsRecord.setFieldValue('name', old_run_plan_name);
                 shiftsRecord.setFieldValue('custrecord_ns_run_plan_id', old_run_plan_id);
                 shiftsRecord.setFieldValue('custrecord_shift_date', getDate());
                 shiftsRecord.setFieldValue('custrecord_shift_start_time', onTimeChange(start_time));
                 shiftsRecord.setFieldValue('custrecord_shift_end_time', onTimeChange(old_end_time));
                 // shiftsRecord.setFieldValue('custrecord_app_shift_id', shift_data.id);
                 var shiftID = nlapiSubmitRecord(shiftsRecord);
 
                 start_time = run_plan_start_time;
 
             } else if (run_plan_count > 0 && old_operator_id != operator_id) {
 
 
                 var start_time_array = start_time.split(':');
                 var json_start_time = moment().utc().hours(start_time_array[0]).minutes(start_time_array[1]).seconds(0).format();
 
                 var end_time_array = old_end_time.split(':');
                 var json_end_time = moment().utc().hours(end_time_array[0]).minutes(end_time_array[1]).seconds(0).format();
 
 
                 var shiftsRecord = nlapiCreateRecord('customrecord_shifts');
                 shiftsRecord.setFieldValue('name', old_run_plan_name);
                 shiftsRecord.setFieldValue('custrecord_ns_run_plan_id', old_run_plan_id);
                 shiftsRecord.setFieldValue('custrecord_shift_date', getDate());
                 shiftsRecord.setFieldValue('custrecord_shift_start_time', onTimeChange(start_time));
                 shiftsRecord.setFieldValue('custrecord_shift_end_time', onTimeChange(old_end_time));
                 // shiftsRecord.setFieldValue('custrecord_app_shift_id', shift_data.id);
                 var shiftID = nlapiSubmitRecord(shiftsRecord);
 
                 start_time = run_plan_start_time;
             }
             old_run_plan_id = run_plan_id;
             old_operator_id = operator_id;
             old_end_time = run_plan_end_time;
             old_freq = freq;
             old_operator_prem_id = operator_prem_id;
             old_run_plan_name = run_plan_name;
             run_plan_count++;
         }
         return true;
     });
 
     if (run_plan_count > 0) {
 
 
         var start_time_array = start_time.split(':');
         var json_start_time = moment().utc().hours(start_time_array[0]).minutes(start_time_array[1]).seconds(0).format();
 
         var end_time_array = old_end_time.split(':');
         var json_end_time = moment().utc().hours(end_time_array[0]).minutes(end_time_array[1]).seconds(0).format();
 
         var shiftsRecord = nlapiCreateRecord('customrecord_shifts');
         shiftsRecord.setFieldValue('name', old_run_plan_name);
         shiftsRecord.setFieldValue('custrecord_ns_run_plan_id', old_run_plan_id);
         shiftsRecord.setFieldValue('custrecord_shift_date', getDate());
         shiftsRecord.setFieldValue('custrecord_shift_start_time', onTimeChange(start_time));
         shiftsRecord.setFieldValue('custrecord_shift_end_time', onTimeChange(old_end_time));
         // shiftsRecord.setFieldValue('custrecord_app_shift_id', shift_data.id);
         var shiftID = nlapiSubmitRecord(shiftsRecord);
     }
 }
 
 function convertTo24Hour(time) {
     // nlapiLogExecution('DEBUG', 'time', time);
     var hours = parseInt(time.substr(0, 2));
     if (time.indexOf('AM') != -1 && hours == 12) {
         time = time.replace('12', '0');
     }
     if (time.indexOf('AM') != -1 && hours < 10) {
         time = time.replace(hours, ('0' + hours));
     }
     if (time.indexOf('PM') != -1 && hours < 12) {
         time = time.replace(hours, (hours + 12));
     }
     return time.replace(/( AM| PM)/, '');
 }
 
 
 function onTimeChange(value) {
     if (!isNullorEmpty(value)) {
         var timeSplit = value.split(':'),
             hours,
             minutes,
             meridian;
         hours = timeSplit[0];
         minutes = timeSplit[1];
         if (hours > 12) {
             meridian = 'PM';
             hours -= 12;
         } else if (hours < 12) {
             meridian = 'AM';
             if (hours == 0) {
                 hours = 12;
             }
         } else {
             meridian = 'PM';
         }
         return (hours + ':' + minutes + ' ' + meridian);
     }
 }
 
 function getDate() {
     var date = new Date();
     if (date.getHours() > 6) {
         date = nlapiAddDays(date, 1);
     }
     date = nlapiDateToString(date);
 
     return date;
 }
 