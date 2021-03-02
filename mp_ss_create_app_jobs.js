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

            log.audit({
                title: 'moment().utc()',
                details: moment().utc()
            })
            log.audit({
                title: 'day',
                details: day
            })
            log.audit({
                title: 'original date',
                details: moment().utc().date()
            })
            log.audit({
                title: 'date',
                details: date
            })
            log.audit({
                title: 'Last Day of Month',
                details: endDate
            })
            log.audit({
                title: 'month',
                details: month
            })
            log.audit({
                title: 'year',
                details: year
            })
            log.audit({
                title: 'date_of_week',
                details: date_of_week
            })
            log.audit({
                title: 'days_of_week[day + 1]',
                details: days_of_week[day + 1]
            });
            log.audit({
                title: 'days_of_week[day]',
                details: days_of_week[day]
            });

            log.audit({
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

            var zeeSearch = search.load({ type: 'partner', id: 'customsearch_rp_zee_no_job_created' });
            var resultZee = zeeSearch.run(); //.getRange({ start: 0, end: 1})

            log.audit({
                title: 'searchResultZee',
                details: resultZee
            })

            resultZee.each(function(searchResultZee) {
                // var zee_id = searchResultZee.getValue({ name: "internalid"});
                var zee_id = 621451; // Gold Coast
                // var zee_id = 626844; // Test QLD
                var zee_name = searchResultZee.getValue({ name: "entityid"});
                log.debug({
                    title: 'Zee Name',
                    details: zee_name
                });
                log.debug({
                    title: 'date_of_week',
                    details: date_of_week
                });

                //SEARCH: RP - Service Leg Frequency - All - Create App Jobs
                var runPlanSearch = search.load({ type: 'customrecord_service_leg', id: 'customsearch_rp_leg_freq_create_app_jobs'});

                // log.debug({
                //     title: 'days_of_week[day]',
                //     details: days_of_week[day]
                // });
                // log.debug({
                //     title: 'service_leg_customer',
                //     details: service_leg_customer
                // });

                if (day != 0 && day != 6) {
                    
                    var filterExpression = [];
                    // var filterExpression = runPlanSearch.filterExpression;
                    // filterExpression.push('AND');
                    filterExpression.push([
                        [days_of_week[day + 1], search.Operator.IS , 'T'], // customer id
                        // [days_of_week[day], search.Operator.IS , 'T'], // customer id
                        "OR", ["custrecord_service_freq_stop.custrecord_service_freq_day_adhoc", search.Operator.IS , 'T']
                    ]);
                    filterExpression.push("AND", ["isinactive", search.Operator.IS , "F"]);
                    filterExpression.push("AND", ["custrecord_service_leg_customer.partner", search.Operator.IS , zee_id]);
                    filterExpression.push("AND", ["custrecord_service_leg_customer.status", search.Operator.ANYOF, "32", "13"]);
                    filterExpression.push("AND", ["custrecord_service_leg_service.isinactive", search.Operator.IS , "F"]);
                    filterExpression.push("AND", ["custrecord_service_freq_stop.internalid", search.Operator.NONEOF, "@NONE@"]);
                    filterExpression.push("AND", [
                        ["formulatext: CASE WHEN TO_CHAR({custrecord_service_leg_closing_date}, 'DD/MM/YYYY') <= TO_CHAR(SYSDATE, 'DD/MM/YYYY') THEN 'T' ELSE 'F' END", search.Operator.IS , "F"], "AND", ["formulatext: CASE WHEN TO_CHAR({custrecord_service_leg_opening_date}, 'DD/MM/YYYY') > TO_CHAR(SYSDATE, 'DD/MM/YYYY') THEN 'T' ELSE 'F' END", search.Operator.IS, "F"]
                    ]);
                    filterExpression.push("AND", ["custrecord_app_ser_leg_daily_job_create", search.Operator.ANYOF, "2", "@NONE@"]);
                    log.debug({
                        title: 'Filter Expression',
                        details: filterExpression
                    });
                    runPlanSearch.filterExpression = filterExpression;
                }
                var resultRunPlan = runPlanSearch.run();
                // var runPlanResult = resultRunPlan.getResults()
                // log.debug({
                //     title: 'Length',
                //     details: runPlanResult.length
                // })

                if (!isNullorEmpty(ctx.getParameter({ name: 'custscript_rp_old_service_id_create_app'}))) {
                    var old_service_id = ctx.getParameter({ name: 'custscript_rp_old_service_id_create_app'});
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
                resultRunPlan.each(function(searchResult) {

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

                    log.debug({
                        title: 'service_leg_id',
                        details: service_leg_id
                    });

                    try {
                        // statements
                        log.audit({
                            title: 'Inside Try Statement'
                        })

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

                            log.audit({
                                title: 'run_plan_inactive',
                                details: run_plan_inactive
                            })

                            var serviceLegRecord = record.load({
                                type: 'customrecord_service_freq',
                                id: service_freq_id
                            });
                            var weekOfDay = serviceLegRecord.getValue({ fieldId: days_of_week2[day + 1]});
                            // var weekOfDay = serviceLegRecord.getValue({ fieldId: days_of_week2[day]});
                            log.debug({
                                title: 'weekOfDay',
                                details: weekOfDay
                            })

                            if (weekOfDay == 'false' && service_freq_adhoc == 'false') {

                            } else {
                                log.audit({
                                    title: 'In Else Function'
                                })
                                if (run_plan_inactive == 'false') {
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

                                    if (old_service_id != service_id) {
                                        log.audit({
                                            title: 'old_service_id != service_id',
                                            details: old_service_id + " != " + service_id
                                        });

                                        var usage_loopstart_cust = ctx.getRemainingUsage();

                                        log.audit({
                                            title: 'usage_loopstart_cust',
                                            details: usage_loopstart_cust
                                        })
                                        log.audit({
                                            title: 'usage_threshold',
                                            details: usage_threshold
                                        })

                                        if (usage_loopstart_cust < usage_threshold) {

                                            var params = {
                                                custscript_rp_prev_deployment_create_app: ctx.deploymentId,
                                                custscript_rp_old_service_id_create_app: old_service_id,
                                                custscript_rp_app_job_group_id_create_app: app_job_group_id2
                                            }

                                            reschedule = task.create({
                                                taskType: task.TaskType.SCHEDULED_SCRIPT,
                                                scriptId: 'customscript_ss_create_app_jobs_2',
                                                deploymentId: 'customdeploy_ss_create_app_jobs_2',
                                                params: params
                                            });
                                            log.audit({​​​​​
                                                title: 'Reschedule Return - IN LOOP'
                                            });
                                            var rescheduled = reschedule.submit();
                                            // if (task.checkStatus({​​​​​ taskId: reschedule}​​​​​) == false) {​​​​​
                                            //     exit = true;
                                            //     return false;
                                            // }​​​​​
                                        }

                                        var service_leg_record = record.load({
                                            id: service_leg_id,
                                            type: 'customrecord_service_leg'
                                        })
                                        service_leg_record.setValue({ fieldId: 'custrecord_app_ser_leg_daily_job_create', value: 1});
                                        // var service = service_leg_record.save();
                                        log.audit({
                                            title: 'Service Leg - Saved',
                                            details: service
                                        })

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

                                    } else {
                                        log.audit({
                                            title: 'Else Statement'
                                        });
                                        var service_leg_record = record.load({
                                            id: service_leg_id,
                                            type: 'customrecord_service_leg'
                                        })
                                        service_leg_record.setValue({ fieldId: 'custrecord_app_ser_leg_daily_job_create', value: 1});
                                        // service_leg_record.save();

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
                                    }
                                }
                                log.audit({
                                    title: 'Finised Run Plan'
                                })
                            }
                        }
                    } catch (e) {
                        // statements
                        var body = 'Error on one of the following: \n';
                        body += 'Service Leg ID: ' + service_leg_id + '\n';
                        body += 'Service Leg Freq ID: ' + service_freq_id + '\n';
                        body += 'Run Plan: ' + service_freq_run_plan_id + '\n';
                        body += 'e: ' + e + '\n';
                        email.send({ author: 112209, recipients: 'ankith.ravindran@mailplus.com.au', subject: 'Create App Jobs', body: body})
                        log.debug({
                            title: 'ERROR',
                            details: body
                        });
                    }

                    old_service_id = service_id;
                    count++;
                    return true;
                });

                log.audit({
                    title: 'Total Count for ' + zee_name, 
                    details: count
                })
                if (exit == false) {
                    var zee_record = record.load({type: 'partner', id: zee_id});
                    zee_record.setValue({ fieldId: 'custentity_zee_app_job_created', value: 1});
                    // REMEMBER TO UNCOMMENT
                    // zee_record.save();
                    
                    reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_ss_create_app_jobs_2',
                        deploymentId: 'customdeploy_ss_create_app_jobs_2'
                    });
                    log.audit({​​​​​
                        title: 'Reschedule Return - END LOOP'
                    });
                    var rescheduled = reschedule.submit();
                    // if (task.checkStatus({​​​​​ taskId: rescheduled}​​​​​) == false) {​​​​​
                    //     // exit = true;
                    //     log.debug({
                    //         title: 'Reschedule Status False'
                    //     });
                    //     return false;
                    // }​​​​​
                }

                // To remove or not too remove?!?!?
                return true;
            });
        
        }

        function createAppJobGroup(service_leg_service_text, service_leg_customer, service_leg_zee, service_id) {
            var app_job_group_rec = record.create({
                type: 'customrecord_jobgroup'
            })
            app_job_group_rec.setValue({ fieldId: 'name', value: service_leg_service_text + '_' + date_of_week});
            app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_ref', value: service_leg_service_text + '_' + date_of_week});
            app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_customer', value: service_leg_customer});
            app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_franchisee', value: service_leg_zee});
            app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_service', value: service_id});
            app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_status', value: 4});
        
            // var app_job_group_id = app_job_group_rec.save();
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
            log.audit({
                title: 'Create Jobs Function Activated'
            });
            var app_job_rec = record.create({
                type: 'customrecord_job'
            });
            app_job_rec.setValue({ fieldId: 'custrecord_job_franchisee', value: service_leg_zee});
            log.audit({
                title: 'Adhoc Value',
                details: service_freq_adhoc
            })
            // if (service_freq_adhoc == 'T') {
            if (service_freq_adhoc == 'true') {
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
            log.audit({
                title: 'service_id',
                details: service_id
            });
            app_job_rec.setValue({ fieldId: 'custrecord_job_service_price', value: service_price});
            app_job_rec.setValue({ fieldId: 'custrecord_job_stop', value: service_leg_id});
            app_job_rec.setValue({ fieldId: 'custrecord159', value: service_leg_id});
            app_job_rec.setValue({ fieldId: 'custrecord_job_status', value: 1});

            log.audit({
                title: 'date_of_week',
                details: date_of_week
            });
            
            var new_date_of_week = format.parse({
                type: format.Type.DATE,
                value: date_of_week
            });
            log.audit({
                title: 'new_date_of_week',
                details: new_date_of_week
            });
            app_job_rec.setValue({ fieldId: 'custrecord_job_date_scheduled', value: new_date_of_week});
            
            log.audit({
                title: 'service_freq_time_current',
                details: service_freq_time_current
            });
            var convert_curr_arr = convertTo24Hour(service_freq_time_current);
            var curr_arr = convert_curr_arr.split(':');
            var curr_1 = parseInt(curr_arr[0]);
            var curr_2 = parseInt(curr_arr[1]);
            var currTimeVar = new Date ();
            currTimeVar.setHours(curr_1, curr_2, 0, 0);
            log.debug({
                title: 'currTimeVar',
                details: currTimeVar
            })            
            app_job_rec.setValue({ fieldId: 'custrecord_job_time_scheduled', value: currTimeVar});
                        
            log.audit({
                title: 'service_freq_time_end',
                details: service_freq_time_end
            })
            var convert_end_arr = convertTo24Hour(service_freq_time_end);
            var end_arr = convert_end_arr.split(':');
            var end_1 = parseInt(end_arr[0]);
            var end_2 = parseInt(end_arr[1]);
            var endTimeVar = new Date ();
            endTimeVar.setHours(end_1, end_2, 0, 0);
            log.debug({
                title: 'endTimeVar',
                details: endTimeVar
            })
            app_job_rec.setValue({ fieldId: 'custrecord_job_time_scheduled_after', value: endTimeVar});

            log.audit({
                title: 'service_freq_time_start',
                details: service_freq_time_start
            })
            var convert_start_arr = convertTo24Hour(service_freq_time_start);
            var start_arr = convert_start_arr.split(':');
            var start_1 = parseInt(start_arr[0]);
            var start_2 = parseInt(start_arr[1]);
            var startTimeVar = new Date ();;
            startTimeVar.setHours(start_1, start_2, 0, 0);
            log.debug({
                title: 'startTimeVar',
                details: startTimeVar
            });
            app_job_rec.setValue({ fieldId: 'custrecord_job_time_scheduled_before', value: startTimeVar});
            
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
            
            log.audit({
                title: 'Create App Job Save'
            });
            
            // var create_app_id = app_job_rec.save();
            // log.audit({
            //     title: 'Create_App Save ID',
            //     details: create_app_id
            // })
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