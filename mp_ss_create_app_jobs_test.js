/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NAmdConfig ./custom_modules_config.json
 * 
 * Module Description
 * 
 * @Author: ankith.ravindran
 * @Date:   2018-09-19 13:20:56
 * @Last Modified by:   Anesu Chakaingesu
 * @Last Modified time: 2020-04-30 14:56:03

 */

 define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/task', 'moment2', 'N/format'],
 function(ui, email, runtime, search, record, http, log, redirect, task, moment, format) {
    // log.debug({
    //     title: 'moment Defined',
    //     details: JSON.stringify(moment)
    // });
    var days_of_week = [];
    days_of_week[0] = 0;
    days_of_week[1] = 'custrecord_service_freq_stop.custrecord_service_freq_day_mon';
    days_of_week[2] = 'custrecord_service_freq_stop.custrecord_service_freq_day_tue';
    days_of_week[3] = 'custrecord_service_freq_stop.custrecord_service_freq_day_wed';
    days_of_week[4] = 'custrecord_service_freq_stop.custrecord_service_freq_day_thu';
    days_of_week[5] = 'custrecord_service_freq_stop.custrecord_service_freq_day_fri';
    days_of_week[6] = 6;

    var days_of_week2 = [];
    days_of_week2[0] = 0;
    days_of_week2[1] = 'custrecord_service_freq_day_mon';
    days_of_week2[2] = 'custrecord_service_freq_day_tue';
    days_of_week2[3] = 'custrecord_service_freq_day_wed';
    days_of_week2[4] = 'custrecord_service_freq_day_thu';
    days_of_week2[5] = 'custrecord_service_freq_day_fri';
    days_of_week2[6] = 6;

    var usage_threshold = 200; //20
    var usage_threshold_invoice = 1000; //1000
    var adhoc_inv_deploy = 'customdeploy2';
    var prev_inv_deploy = null;
    var ctx = runtime.getCurrentScript();

    var date_of_week;

    function main(){
    
        var day = moment().utc().day();
        var date = moment().utc().add(1, 'days').date();
        var month = moment().utc().month();
        var year = moment().utc().year();

        var startDate = moment([year, month]);
        var endDate = moment(startDate).endOf('month').date();

        if(moment().utc().date() == endDate){
            date_of_week = date + '/' + (month + 2) + '/' + year;
        } else {
            date_of_week = date + '/' + (month + 1) + '/' + year;
        }

        // date_of_week = date + '/' + (month + 1) + '/' + year;

        log.debug({
            title: 'moment().utc()',
            details: moment().utc()
        })
        log.debug({
            title: 'day',
            details: day
        })
        log.debug({
            title: 'original date',
            details: moment().utc().date()
        })
        log.debug({
            title: 'date',
            details: date
        })
        log.debug({
            title: 'Last Day of Month',
            details: endDate
        })
        log.debug({
            title: 'month',
            details: month
        })
        log.debug({
            title: 'year',
            details: year
        })
        log.debug({
            title: 'date_of_week',
            details: date_of_week
        })
        log.debug({
            title: 'days_of_week[day + 1]',
            details: days_of_week[day + 1]
        });

        log.debug({
            title: 'prev_deployment',
            details: ctx.getParameter({
                name: 'custscript_rp_prev_deployment_create_app'
            })
        })
        if (!isNullorEmpty(ctx.getParameter({ name: 'custscript_rp_prev_deployment_create_app' }))) {
            prev_inv_deploy = ctx.getParameter({
                name: 'custscript_rp_prev_deployment_create_app'
            })
        } else {
            prev_inv_deploy = ctx.deploymentId;
        }

        var new_day = 0;
        var runPlanSearch;
        new_day = day + 1;
        log.audit({
            title: 'day',
            details: 'New Day ' + new_day + 'Old Day ' + day
        });
        // switch (new_day){
        //     case 1: runPlanSearch = search.load({ type: 'customrecord_service_leg', id: 'customsearch_rp_leg_freq_create_app_mon'});
        //         break;
        //     case 2: runPlanSearch = search.load({ type: 'customrecord_service_leg', id: 'customsearch_rp_leg_freq_create_app_tue'});
        //         break;
        //     case 3: runPlanSearch = search.load({ type: 'customrecord_service_leg', id: 'customsearch_rp_leg_freq_create_app_wed'});
        //         break;
        //     case 4: runPlanSearch = search.load({ type: 'customrecord_service_leg', id: 'customsearch_rp_leg_freq_create_app_thu'});
        //         break;
        //     case 5: runPlanSearch = search.load({ type: 'customrecord_service_leg', id: 'customsearch_rp_leg_freq_create_app_fri'});
        //         break;
        // }
        runPlanSearch = search.load({ type: 'customrecord_service_leg', id: 'customsearch_rp_leg_freq_create_app_test'});
        log.debug({
            title: 'runPlanSearch',
            details: runPlanSearch
        });
        
        // var resultRunPlan = runPlanSearch.run();
        var resultRunPlan = runPlanSearch.run().getRange({
            start: 30,
            end: 40
        }); // Test

        if (!isNullorEmpty(ctx.getParameter({ name: 'custscript_rp_old_service_id_create_app'}))) {
            var old_service_id = parseInt(ctx.getParameter({ name: 'custscript_rp_old_service_id_create_app'}));
        } else {
            var old_service_id;
        }

        if (!isNullorEmpty(ctx.getParameter({ name: 'custscript_rp_app_job_group_id_create_app'}))) {
            var app_job_group_id2 = ctx.getParameter({ name: 'custscript_rp_app_job_group_id_create_app'});
        } else {
            var app_job_group_id2;
        }

        var count = 0;
        var exit = false;
        resultRunPlan.forEach(function(searchResult) {

            var service_leg_id = searchResult.getValue({ name: "internalid", join: null, summary: search.Summary.GROUP});
            var service_leg_name = searchResult.getValue({ name: "name", join: null, summary: search.Summary.GROUP});
            var service_leg_zee = searchResult.getValue({ name: "custrecord_service_leg_franchisee", join: null, summary: search.Summary.GROUP});
            var service_leg_customer = searchResult.getValue({ name: "custrecord_service_leg_customer", join: null, summary: search.Summary.GROUP});
            var service_leg_customer_text = searchResult.getText({ name: "custrecord_service_leg_customer", join: null, summary: search.Summary.GROUP});
            var service_id = searchResult.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_LEG_SERVICE", summary: search.Summary.GROUP});
            var service_leg_service = searchResult.getValue({ name: "custrecord_service_leg_service", join: null, summary: search.Summary.GROUP});
            var service_leg_service_text = searchResult.getText({ name: "custrecord_service_leg_service", join: null, summary: search.Summary.GROUP});
            var service_price = searchResult.getValue({ name: "custrecord_service_price", join: "CUSTRECORD_SERVICE_LEG_SERVICE", summary: search.Summary.GROUP});
            var service_cat = searchResult.getValue({ name: "custrecord_service_category", join: "CUSTRECORD_SERVICE_LEG_SERVICE", summary: search.Summary.GROUP});
            var service_leg_no = searchResult.getValue({ name: "custrecord_service_leg_number", join: null, summary: search.Summary.GROUP});
            var service_leg_ncl = searchResult.getValue({ name: "custrecord_service_leg_non_cust_location", join: null, summary: search.Summary.GROUP});
            var service_leg_addr = searchResult.getValue({ name: "custrecord_service_leg_addr", join: null, summary: search.Summary.GROUP});
            var service_leg_addr_postal = searchResult.getValue({ name: "custrecord_service_leg_addr_postal", join: null, summary: search.Summary.GROUP});
            var service_leg_addr_subdwelling = searchResult.getValue({ name: "custrecord_service_leg_addr_subdwelling", join: null, summary: search.Summary.GROUP});
            var service_leg_addr_st_num = searchResult.getValue({ name: "custrecord_service_leg_addr_st_num_name", join: null, summary: search.Summary.GROUP});
            var service_leg_addr_suburb = searchResult.getValue({ name: "custrecord_service_leg_addr_suburb", join: null, summary: search.Summary.GROUP});
            var service_leg_addr_state = searchResult.getValue({ name: "custrecord_service_leg_addr_state", join: null, summary: search.Summary.GROUP});
            var service_leg_addr_postcode = searchResult.getValue({ name: "custrecord_service_leg_addr_postcode", join: null, summary: search.Summary.GROUP});
            var service_leg_addr_lat = searchResult.getValue({ name: "custrecord_service_leg_addr_lat", join: null, summary: search.Summary.GROUP});
            var service_leg_addr_lon = searchResult.getValue({ name: "custrecord_service_leg_addr_lon", join: null, summary: search.Summary.GROUP});
            var service_leg_type = searchResult.getValue({ name: "custrecord_service_leg_type", join: null, summary: search.Summary.GROUP});
            var service_leg_duration = searchResult.getValue({ name: "custrecord_service_leg_duration", join: null, summary: search.Summary.GROUP});
            var service_leg_notes = searchResult.getValue({ name: "custrecord_service_leg_notes", join: null, summary: search.Summary.GROUP});
            var service_leg_location_type = searchResult.getValue({ name: "custrecord_service_leg_location_type", join: null, summary: search.Summary.GROUP});
            var service_leg_transfer_type = searchResult.getValue({ name: "custrecord_service_leg_trf_type", join: null, summary: search.Summary.GROUP});
            var service_leg_transfer_linked_stop = searchResult.getValue({ name: "custrecord_service_leg_trf_linked_stop", join: null, summary: search.Summary.GROUP});
            var service_freq_id = searchResult.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_mon = searchResult.getValue({ name: "custrecord_service_freq_day_mon", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_tue = searchResult.getValue({ name: "custrecord_service_freq_day_tue", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_wed = searchResult.getValue({ name: "custrecord_service_freq_day_wed", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_thu = searchResult.getValue({ name: "custrecord_service_freq_day_thu", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_fri = searchResult.getValue({ name: "custrecord_service_freq_day_fri", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_adhoc = searchResult.getValue({ name: "custrecord_service_freq_day_adhoc", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_time_current = searchResult.getValue({ name: "custrecord_service_freq_time_current", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_time_start = searchResult.getValue({ name: "custrecord_service_freq_time_start", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_time_end = searchResult.getValue({ name: "custrecord_service_freq_time_end", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_run_plan_id = searchResult.getValue({ name: "custrecord_service_freq_run_plan", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_operator = searchResult.getValue({ name: "custrecord_service_freq_operator", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});
            var service_freq_zee = searchResult.getValue({ name: "custrecord_service_freq_franchisee", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP});

            var service_multiple_operators = searchResult.getValue({ name: "custrecord_multiple_operators", join: "CUSTRECORD_SERVICE_LEG_SERVICE", summary: search.Summary.GROUP});

            var street_no_name = null;

            log.audit({
                title: 'service_leg_id',
                details: service_leg_id
            });

            // try {
                // statements
                if (!isNullorEmpty(service_freq_run_plan_id)) {
                    log.audit({
                        title: 'service_freq_run_plan_id',
                        details: service_freq_run_plan_id
                    })
                    var run_plan_record = record.load({
                        id: service_freq_run_plan_id,
                        type: 'customrecord_run_plan'
                    })
                    var run_plan_inactive = run_plan_record.getValue({ fieldId: 'isinactive'});

                    var serviceLegRecord = record.load({
                        type: 'customrecord_service_freq',
                        id: service_freq_id
                    });
                    var weekOfDay = serviceLegRecord.getValue({ fieldId: days_of_week2[day + 1]});
                    log.audit({
                        title: 'weekOfDay',
                        details: weekOfDay
                    })

                    if (weekOfDay == false && service_freq_adhoc == false) {

                    } else {
                        if (run_plan_inactive == false) {
                            log.audit({
                                title: 'Run Plan Inactive = False'
                            });

                            if (isNullorEmpty(service_leg_addr_subdwelling) && !isNullorEmpty(service_leg_addr_st_num)) {
                                street_no_name = service_leg_addr_st_num;
                            } else if (!isNullorEmpty(service_leg_addr_subdwelling) && isNullorEmpty(service_leg_addr_st_num)) {

                                street_no_name = service_leg_addr_subdwelling;
                            } else {

                                street_no_name = service_leg_addr_subdwelling + ', ' + service_leg_addr_st_num;
                            }

                            service_leg_addr_st_num = street_no_name;

                            if (isNullorEmpty(old_service_id)){

                                log.audit({
                                    title: 'No Old Service ID Set'
                                });

                                app_job_group_id2 = createAppJobGroup(service_leg_service_text, service_leg_customer, service_leg_zee, service_id);

                                createAppJobs(service_leg_id, service_leg_customer, service_leg_name,
                                    service_id,
                                    service_price,
                                    service_freq_time_current,
                                    service_freq_time_end,
                                    service_freq_time_start,
                                    service_leg_no,
                                    app_job_group_id2,
                                    service_leg_addr_st_num,
                                    service_leg_addr_suburb,
                                    service_leg_addr_state,
                                    service_leg_addr_postcode,
                                    service_leg_addr_lat,
                                    service_leg_addr_lon, service_leg_zee, service_id, service_leg_notes, service_freq_run_plan_id, service_leg_location_type, service_freq_adhoc, service_leg_customer_text, service_multiple_operators);

                                var service_leg_record = record.load({
                                    id: service_leg_id,
                                    type: 'customrecord_service_leg'
                                })
                                service_leg_record.setValue({ fieldId: 'custrecord_app_ser_leg_daily_job_create', value: 1});
                                var service = service_leg_record.save();

                                log.audit({
                                    title: 'Service Leg - Saved',
                                    details: service
                                })

                                old_service_id = service_id;
                                count++;
                                return true;

                            } else if (old_service_id == service_id){

                                log.audit({
                                    title: 'Old Service ID == Service ID ',
                                    details: old_service_id + ' == ' + service_id
                                });

                                createAppJobs(service_leg_id, service_leg_customer, service_leg_name,
                                    service_id,
                                    service_price,
                                    service_freq_time_current,
                                    service_freq_time_end,
                                    service_freq_time_start,
                                    service_leg_no,
                                    app_job_group_id2,
                                    service_leg_addr_st_num,
                                    service_leg_addr_suburb,
                                    service_leg_addr_state,
                                    service_leg_addr_postcode,
                                    service_leg_addr_lat,
                                    service_leg_addr_lon, service_leg_zee, service_id, service_leg_notes, service_freq_run_plan_id, service_leg_location_type, service_freq_adhoc, service_leg_customer_text, service_multiple_operators);
                                    
                                var service_leg_record = record.load({
                                    id: service_leg_id,
                                    type: 'customrecord_service_leg'
                                })
                                service_leg_record.setValue({ fieldId: 'custrecord_app_ser_leg_daily_job_create', value: 1});
                                service_leg_record.save();
                                log.audit({
                                    title: 'Service Leg - Saved',
                                    details: service
                                });

                                old_service_id = service_id;
                                count++;
                                return true;
                                        
                            } else if (old_service_id != service_id) {

                                log.audit({
                                    title: 'Old Service ID != Service ID',
                                    details: old_service_id + ' != ' + service_id
                                });
                                log.audit({
                                    title: 'Count of Service Leg',
                                    details: count
                                });

                                // var params = {
                                //     custscript_rp_prev_deployment_create_app: ctx.deploymentId,
                                //     custscript_rp_old_service_id_create_app: old_service_id,
                                //     custscript_rp_app_job_group_id_create_app: app_job_group_id2
                                // }

                                reschedule = task.create({
                                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                                    scriptId: 'customscript_ss_create_app_jobs_2',
                                    deploymentId: 'customdeploy_ss_create_app_jobs_test',
                                    params: null
                                });
                                log.emergency({​​​​​
                                    title: 'Reschedule Return - IN LOOP'
                                });
                                var rescheduled = reschedule.submit();
                                if (task.checkStatus({​​​​​ taskId: rescheduled}​​​​​) == false) {​​​​​
                                    exit = true;
                                    return false;
                                }​​​​​

                                count++;
                            }
                            // if (exit == false){
                            //     old_service_id = service_id;
                            //     count++;
                            //     return true;
                            // }
                        }
                    }
                }
            // } catch (e) {
            //     // statements
            //     var body = 'Error on one of the following: \n';
            //     body += 'Service Leg ID: ' + service_leg_id + '\n';
            //     body += 'Service Leg Freq ID: ' + service_freq_id + '\n';
            //     body += 'Run Plan: ' + service_freq_run_plan_id + '\n';
            //     body += 'e: ' + e + '\n';
            //     email.send({ author: 112209, recipients: 'ankith.ravindran@mailplus.com.au', subject: 'Create App Jobs', body: body})
            //     log.error({
            //         title: 'ERROR',
            //         details: body
            //     });
            // }

            log.emergency({
                title: 'End of Loop | Count?',
                details: count
            });
        });
    }

    function createAppJobGroup(service_leg_service_text, service_leg_customer, service_leg_zee, service_id) {
        var app_job_group_rec = record.create({
            type: 'customrecord_jobgroup'
        });
        log.audit({
            title: 'Create Jobs Group Activated',
            details: app_job_group_rec
        });
        app_job_group_rec.setValue({ fieldId: 'name', value: service_leg_service_text + '_' + date_of_week});
        app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_ref', value: service_leg_service_text + '_' + date_of_week});
        app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_customer', value: service_leg_customer});
        app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_franchisee', value: service_leg_zee});
        app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_service', value: service_id});
        app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_status', value: 4});
    
        var app_job_group_id = app_job_group_rec.save();
        log.audit({
            title: 'Create Jobs Group Saved!!',
            details: app_job_group_id
        })

        return app_job_group_id;
    }
    
    function createAppJobs(service_leg_id, service_leg_customer, service_leg_name,
        service_id,
        service_price,
        service_freq_time_current,
        service_freq_time_end,
        service_freq_time_start,
        service_leg_no,
        app_job_group_id,
        service_leg_addr_st_num,
        service_leg_addr_suburb,
        service_leg_addr_state,
        service_leg_addr_postcode,
        service_leg_addr_lat,
        service_leg_addr_lon, service_leg_zee, service_id, service_leg_notes, service_freq_run_plan_id, service_leg_location_type, service_freq_adhoc, service_leg_customer_text, service_multiple_operators) {
        
        var app_job_rec = record.create({
            type: 'customrecord_job'
        });
        log.audit({
            title: 'Create Jobs Function Activated',
            details: app_job_rec
        });
        app_job_rec.setValue({ fieldId: 'custrecord_job_franchisee', value: service_leg_zee});
        log.audit({
            title: 'Adhoc Value',
            details: service_freq_adhoc
        });

        if (service_freq_adhoc == true) {
            if (service_leg_location_type == 2) {
                app_job_rec.setValue({ fieldId:'custrecord_app_job_stop_name', value: 'ADHOC - ' + service_leg_name + ' - ' + service_leg_customer_text});
            } else {
                app_job_rec.setValue({ fieldId:'custrecord_app_job_stop_name', value: 'ADHOC - ' + service_leg_name});
            }
    
        } else {
            app_job_rec.setValue({ fieldId: 'custrecord_app_job_stop_name', value: service_leg_name});
        }
    
        app_job_rec.setValue({ fieldId: 'custrecord_job_customer', value: service_leg_customer});
        app_job_rec.setValue({ fieldId: 'custrecord_job_source', value: 6});
        app_job_rec.setValue({ fieldId: 'custrecord_job_service', value: service_id});
        app_job_rec.setValue({ fieldId: 'custrecord_job_service_price', value: service_price});
        app_job_rec.setValue({ fieldId: 'custrecord_job_stop', value: service_leg_id});
        app_job_rec.setValue({ fieldId: 'custrecord159', value: service_leg_id});
        app_job_rec.setValue({ fieldId: 'custrecord_job_status', value: 1});
        
        var new_date_of_week = format.parse({
            type: format.Type.DATE,
            value: date_of_week
        });
        app_job_rec.setValue({ fieldId: 'custrecord_job_date_scheduled', value: new_date_of_week});
        
        var convert_curr_arr = convertTo24Hour(service_freq_time_current);
        var curr_arr = convert_curr_arr.split(':');
        var curr_1 = curr_arr[0];
        var curr_2 = curr_arr[1];
        var currTimeVar = new Date ();
        currTimeVar.setHours(curr_1, curr_2, 0, 0);    
        log.emergency({
            title: 'Current Time! Before Format',
            details: currTimeVar
        });
        var currTimeVarFormat = format.format({
            value: currTimeVar,
            type:format.Type.TIMEOFDAY
        });
        log.emergency({
            title: 'Current Time! After Format',
            details: currTimeVarFormat
        });
        app_job_rec.setValue({ fieldId: 'custrecord_job_time_scheduled', value: '7:45 am'});
         
        var convert_end_arr = convertTo24Hour(service_freq_time_end);
        var end_arr = convert_end_arr.split(':');
        var end_1 = end_arr[0];
        var end_2 = end_arr[1];
        var endTimeVar = new Date ();
        endTimeVar.setHours(end_1, end_2, 0, 0);
        log.emergency({
            title: 'End Time!',
            details: endTimeVar
        });
        var endTimeVarFormat = format.format({
            value: endTimeVar,
            type:format.Type.TIMEOFDAY
        });
        log.emergency({
            title: 'End Time! After Format',
            details: endTimeVarFormat
        });
        app_job_rec.setValue({ fieldId: 'custrecord_job_time_scheduled_after', value: endTimeVarFormat});

        var convert_start_arr = convertTo24Hour(service_freq_time_start);
        var start_arr = convert_start_arr.split(':');
        var start_1 = start_arr[0];
        var start_2 = start_arr[1];
        var startTimeVar = new Date ();
        startTimeVar.setHours(start_1, start_2, 0, 0);
        log.emergency({
            title: 'Start Time! Before Format',
            details: startTimeVar
        });
        var startTimeVarFormat = format.format({
            value: startTimeVar,
            type:format.Type.TIMEOFDAY
        });
        log.emergency({
            title: 'Start Time! After Format',
            details: startTimeVarFormat
        });
        app_job_rec.setValue({ fieldId: 'custrecord_job_time_scheduled_before', value: startTimeVarFormat});
        
        app_job_rec.setValue({ fieldId: 'custrecord_job_service_leg', value: service_leg_no});
        app_job_rec.setValue({ fieldId: 'custrecord_job_group', value: app_job_group_id});
        // app_job_rec.setValue({ fieldId: 'custrecord_job_group_status'});
        app_job_rec.setValue({ fieldId: 'custrecord_app_job_st_name_no', value: service_leg_addr_st_num});
        app_job_rec.setValue({ fieldId: 'custrecord_app_job_suburb', value: service_leg_addr_suburb});
        app_job_rec.setValue({ fieldId: 'custrecord_app_job_state', value: service_leg_addr_state});
        app_job_rec.setValue({ fieldId: 'custrecord_app_job_post_code', value: service_leg_addr_postcode});
        app_job_rec.setValue({ fieldId: 'custrecord_app_job_lat', value: service_leg_addr_lat});
        app_job_rec.setValue({ fieldId: 'custrecord_app_job_lon', value: service_leg_addr_lon});
        app_job_rec.setValue({ fieldId: 'custrecord_app_job_notes', value: service_leg_notes});
        app_job_rec.setValue({ fieldId: 'custrecord_app_job_run', value: service_freq_run_plan_id});
        app_job_rec.setValue({ fieldId: 'custrecord_app_job_location_type', value: service_leg_location_type});
        app_job_rec.setValue({ fieldId: 'custrecord_job_multiple_operators', value: service_multiple_operators});

        var create_app_id = app_job_rec.save();
        log.audit({
            title: 'Create_App Saved with ID',
            details: create_app_id
        });
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

