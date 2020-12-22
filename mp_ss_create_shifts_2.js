/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * 
 * @Last Modified by:   Sruti Desai
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
        

            var runPlanSearch = search.load({
                id: 'customsearch_rp_shift_run_times',
                type: 'customrecord_run_plan'
            });
        
            if (day != 0 && day != 6) {
                runPlanSearch.filters.push(search.createFilter({
                    name: days_of_week[day],
                    operator: search.Operator.IS,
                    join: 'custrecord_service_freq_run_plan',
                    values: 'T'
                }));
            
            }
                
            var resultRunPlan = runPlanSearch.run();
        
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
        
            resultRunPlan.each(function(searchResult) {
        

                var run_plan_id = searchResult.getValue({
                    name: 'internalid',
                    summary: "GROUP",
                });
                var run_plan_name = searchResult.getValue({
                    name: 'name',
                    summary: "GROUP",
                });
                var operator_id = searchResult.getValue({
                    name: 'custrecord_run_operator',
                    summary: "GROUP",
                });
                var operator_text = searchResult.getText({
                    name: 'custrecord_run_operator',
                    summary: "GROUP",
                });
                var operator_prem_id = searchResult.getValue({
                    name: 'custrecord_operator_prem_id',
                    join: 'CUSTRECORD_RUN_OPERATOR',
                    summary: "GROUP",
                });
                var operator_email = searchResult.getValue({
                    name: 'custrecord_operator_email',
                    join: 'CUSTRECORD_RUN_OPERATOR',
                    summary: "GROUP",
                });
                var operator_phone = searchResult.getValue({
                    name: 'custrecord_operator_phone',
                    join: 'CUSTRECORD_RUN_OPERATOR',
                    summary: "GROUP",
                });
                var run_plan_start_time = searchResult.getValue({
                    name: 'custrecord_service_freq_time_start',
                    join: 'CUSTRECORD_SERVICE_FREQ_RUN_PLAN',
                    summary: "GROUP",
                });
                run_plan_start_time = convertTo24Hour(run_plan_start_time);

                var run_plan_end_time = searchResult.getValue({
                    name: 'custrecord_service_freq_time_end',
                    join: 'CUSTRECORD_SERVICE_FREQ_RUN_PLAN',
                    summary: "GROUP",
                });

                run_plan_end_time = convertTo24Hour(run_plan_end_time);
        

                var shiftsSearch = search.load({
                    id: 'customsearch_rp_nowgo_created_shifts',
                    type: 'customrecord_shifts'
                });
                
                
                if (day != 0 && day != 6) {

                    shiftsSearch.filters.push(search.createFilter({
                        name: 'custrecord_ns_run_plan_id',
                        operator: search.Operator.ANYOF,
                        values: run_plan_id
                    }));
                }
        
        
                var resultShifts = shiftsSearch.run();
        
                var shiftsResult = resultShifts.getRange({
                    start: 0,
                    end: 1
                });

        
                if (shiftsResult.length == 0) {
                    if(run_plan_count == 0){
                        start_time = run_plan_start_time;
                    }
                    else if (run_plan_count > 0 && old_run_plan_id != run_plan_id) {
        
                        var start_time_array = start_time.split(':');
                        var json_start_time = moment().utc().hours(start_time_array[0]).minutes(start_time_array[1]).seconds(0).format();
        
                        var end_time_array = old_end_time.split(':');
                        var json_end_time = moment().utc().hours(end_time_array[0]).minutes(end_time_array[1]).seconds(0).format();
        
        
                        var shiftsRecord = record.create({
                            type: 'customrecord_shifts',
                            isDynamic: true
                        });

                        shiftsRecord.setValue({
                            fieldId: 'name',
                            value: old_run_plan_name,
                        });

                        shiftsRecord.setValue({
                            fieldId: 'custrecord_ns_run_plan_id',
                            value: old_run_plan_id,
                        });

                        shiftsRecord.setValue({
                            fieldId: 'custrecord_shift_date',
                            value: getDate(),
                        });

                        shiftsRecord.setValue({
                            fieldId: 'custrecord_shift_start_time',
                            value: onTimeChange(start_time),
                        });

                        shiftsRecord.setValue({
                            fieldId: 'custrecord_shift_end_time',
                            value: onTimeChange(old_end_time),
                        });

                       
                        var shiftID = shiftsRecord.save({
                            enableSourcing: true
                        });
        
                        start_time = run_plan_start_time;
        
                    } else if (run_plan_count > 0 && old_operator_id != operator_id) {
        
        
                        var start_time_array = start_time.split(':');
                        var json_start_time = moment().utc().hours(start_time_array[0]).minutes(start_time_array[1]).seconds(0).format();
        
                        var end_time_array = old_end_time.split(':');
                        var json_end_time = moment().utc().hours(end_time_array[0]).minutes(end_time_array[1]).seconds(0).format();
        
                        var shiftsRecord = record.create({
                            type: 'customrecord_shifts',
                            isDynamic: true
                        });

                        shiftsRecord.setValue({
                            fieldId: 'name',
                            value: old_run_plan_name,
                        });

                        shiftsRecord.setValue({
                            fieldId: 'custrecord_ns_run_plan_id',
                            value: old_run_plan_id,
                        });

                        shiftsRecord.setValue({
                            fieldId: 'custrecord_shift_date',
                            value: getDate(),
                        });

                        shiftsRecord.setValue({
                            fieldId: 'custrecord_shift_start_time',
                            value: onTimeChange(start_time),
                        });

                        shiftsRecord.setValue({
                            fieldId: 'custrecord_shift_end_time',
                            value: onTimeChange(old_end_time),
                        });

                       
                        var shiftID = shiftsRecord.save({
                            enableSourcing: true
                        });
        
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
        
                var shiftsRecord = record.create({
                    type: 'customrecord_shifts',
                    isDynamic: true
                });

                shiftsRecord.setValue({
                    fieldId: 'name',
                    value: old_run_plan_name,
                });

                shiftsRecord.setValue({
                    fieldId: 'custrecord_ns_run_plan_id',
                    value: old_run_plan_id,
                });

                shiftsRecord.setValue({
                    fieldId: 'custrecord_shift_date',
                    value: getDate(),
                });

                shiftsRecord.setValue({
                    fieldId: 'custrecord_shift_start_time',
                    value: onTimeChange(start_time),
                });

                shiftsRecord.setValue({
                    fieldId: 'custrecord_shift_end_time',
                    value: onTimeChange(old_end_time),
                });

                var shiftID = shiftsRecord.save({
                    enableSourcing: true
                });
            
            }
        }

        function convertTo24Hour(time) {

            log.debug({
                title: 'time',
                details: time
            });
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
                date.setDate(date.getDate() + 1); 
            }

            format.format({
                value: date,
                type: format.Type.DATE,
                timezone: format.Timezone.AUSTRALIA_SYDNEY
            })

            return date;
        }

        function isNullorEmpty(strVal) {
			return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }
        
        return {
            execute: main
        }
    }
);