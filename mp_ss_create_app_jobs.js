/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * 
 * @Author: ankith.ravindran
 * @Date:   2018-09-19 13:20:56
 * @Last Modified by:   Ankith

 * @Last Modified time: 2020-04-30 14:56:03

 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/task'],
    function(ui, email, runtime, search, record, http, log, redirect, task) {

        var days_of_week = [];
        days_of_week[0] = 0;
        days_of_week[1] = 'custrecord_service_freq_stop.custrecord_service_freq_day_mon';
        days_of_week[2] = 'custrecord_service_freq_stop.custrecord_service_freq_day_tue';
        days_of_week[3] = 'custrecord_service_freq_stop.custrecord_service_freq_day_wed';
        days_of_week[4] = 'custrecord_service_freq_stop.custrecord_service_freq_day_thu';
        days_of_week[5] = 'custrecord_service_freq_stop.custrecord_service_freq_day_fri';
        days_of_week[6] = 6;

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

            if(moment().utc().date() == endDate){
                date_of_week = date + '/' + (month + 2) + '/' + year;
            } else {
                date_of_week = date + '/' + (month + 1) + '/' + year;
            }

            // date_of_week = date + '/' + (month + 1) + '/' + year;

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

            log.audit({
                title: 'prev_deployment',
                details: ctxScript.getParameter({
                    name: 'custscript_rp_prev_deployment'
                })
            })
            if (!isNullorEmpty(ctxScript.getParameter({
                name: 'custscript_rp_prev_deployment'
            }))) {
                prev_inv_deploy = ctxScript.getParameter({
                    name: 'custscript_rp_prev_deployment'
                })
            } else {
                prev_inv_deploy = ctx.deploymentId;
            }

            var zeeSearch = search.load({ type: 'partner', id: 'customsearch_rp_zee_no_job_created' })
            var resultZee = zeeSearch.run();

            resultZee.each(function(searchResultZee) {

                var zee_id = searchResultZee.getValue({ name: "internalid"});
                var zee_name = searchResultZee.getValue({ name: "entityid"});

                // nlapiLogExecution('DEBUG', 'date_of_week', date_of_week);
                log.debug({
                    title: 'date_of_week',
                    details: date_of_week
                })
                //SEARCH: RP - Service Leg Frequency - All - Create App Jobs
                // var runPlanSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_leg_freq_create_app_jobs');
                
                // nlapiLogExecution('DEBUG', days_of_week[day]);
                log.debug({
                    title: 'days_of_week[day]',
                    details: days_of_week[day]
                })
                // nlapiLogExecution('DEBUG', service_leg_customer);


                if (day != 0 && day != 6) {
                    var filterExpression = [
                        [
                            [days_of_week[day], "is", 'T'], // customer id
                            "OR", ["custrecord_service_freq_stop.custrecord_service_freq_day_adhoc", "is", 'T']
                        ],
                        "AND", ["isinactive", "is", "F"],
                        //"AND", ["custrecord_service_leg_franchisee", "is", zee_id],
                        //"AND", ["custrecord_service_leg_franchisee", "is", 228330],
                        "AND", ["custrecord_service_leg_customer.partner", "is", zee_id],
                        "AND", ["custrecord_service_leg_customer.status", "anyof", "32", "13"],
                        "AND", ["custrecord_service_leg_service.isinactive", "is", "F"],
                        "AND", ["custrecord_service_freq_stop.internalid", "noneof", "@NONE@"],
                        "AND", [
                            ["formulatext: CASE WHEN TO_CHAR({custrecord_service_leg_closing_date}, 'DD/MM/YYYY') <= TO_CHAR(SYSDATE, 'DD/MM/YYYY') THEN 'T' ELSE 'F' END", "is", "F"], "AND", ["formulatext: CASE WHEN TO_CHAR({custrecord_service_leg_opening_date}, 'DD/MM/YYYY') > TO_CHAR(SYSDATE, 'DD/MM/YYYY') THEN 'T' ELSE 'F' END", "is", "F"]
                        ],
                        "AND", ["custrecord_app_ser_leg_daily_job_create", "anyof", "2", "@NONE@"],
                        //"AND", ["custrecord_service_leg_franchisee.custentity_zee_app_job_created", "anyof", "@NONE@", "2"]
                    ];
                    // var newFiltersRunPlan = new Array();
                    // newFiltersRunPlan[newFiltersRunPlan.length] = new nlobjSearchFilter(days_of_week[day], 'custrecord_service_freq_stop', 'is', 'T');
                    //  newFiltersRunPlan[newFiltersRunPlan.length] = new nlobjSearchFilter('custrecord_service_freq_day_adhoc', 'custrecord_service_freq_stop', 'is', 'T');
                    // runPlanSearch.addFilters(newFiltersRunPlan);
                    // nlapiLogExecution('DEBUG', 'Filter Expression', filterExpression)
                    runPlanSearch.setFilterExpression(filterExpression);
                }
                var runPlanSearch = search.load({ type: 'customrecord_service_leg', name: 'customsearch_rp_leg_freq_create_app_jobs', filters: filterExpression });
                var resultRunPlan = runPlanSearch.run();

                // var runPlanResult = resultRunPlan.getResults()

                // nlapiLogExecution('DEBUG', 'Length', runPlanResult.length)

                if (!isNullorEmpty(ctx.getParameter({ name: 'custscript_rp_old_service_id'}))) {
                    var old_service_id = ctx.getParameter({ name: 'custscript_rp_old_service_id'});
                } else {
                    var old_service_id;
                }

                if (!isNullorEmpty(ctx.getParameter({ name: 'custscript_rp_app_job_group_id'}))) {
                    var app_job_group_id2 = ctx.getParameter({ name: 'custscript_rp_app_job_group_id'});
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

                    // nlapiLogExecution('DEBUG', 'service_leg_id', service_leg_id);
                    log.debug({
                        title: 'service_leg_id',
                        details: service_leg_id
                    });

                    try {
                        // statements

                        if (!isNullorEmpty(service_freq_run_plan_id)) {
                            // var run_plan_record = nlapiLoadRecord('customrecord_run_plan', service_freq_run_plan_id);
                            // var run_plan_inactive = run_plan_record.getValue({ fieldId: 'isinactive'});
                            var run_plan_record = record.load({
                                id: service_freq_run_plan_id,
                                type: 'customrecord_run_plan'
                            })
                            var run_plan_inactive = run_plan_record.getValue({ fieldId: 'isinactive'});

                            if (run_plan_inactive == 'F') {

                                if (isNullorEmpty(service_leg_addr_subdwelling) && !isNullorEmpty(service_leg_addr_st_num)) {
                                    street_no_name = service_leg_addr_st_num;
                                } else if (!isNullorEmpty(service_leg_addr_subdwelling) && isNullorEmpty(service_leg_addr_st_num)) {

                                    street_no_name = service_leg_addr_subdwelling;
                                } else {

                                    street_no_name = service_leg_addr_subdwelling + ', ' + service_leg_addr_st_num;
                                }

                                service_leg_addr_st_num = street_no_name;

                                if (old_service_id != service_id) {

                                    var usage_loopstart_cust = ctx.getRemainingUsage();

                                    nlapiLogExecution('DEBUG', 'usage_loopstart_cust', usage_loopstart_cust);
                                    nlapiLogExecution('DEBUG', 'usage_threshold', usage_threshold);
                                    log.debug({
                                        title: 'usage_loopstart_cust',
                                        details: usage_loopstart_cust
                                    })
                                    log.debug({
                                        title: 'usage_threshold',
                                        details: usage_threshold
                                    })

                                    if (usage_loopstart_cust < usage_threshold) {

                                        var params = {
                                            custscript_rp_prev_deployment: ctx.deploymentId,
                                            custscript_rp_old_service_id: old_service_id,
                                            custscript_rp_app_job_group_id: app_job_group_id2
                                        }

                                        // reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
                                        // nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
                                        // if (reschedule == false) {
                                        //     exit = true;
                                        //     return false;
                                        // }

                                        reschedule = task.create({
                                            taskType: task.TaskType.SCHEDULED_SCRIPT,
                                            deploymentId: adhoc_inv_deploy,
                                            params: params,
                                            scriptId: prev_inv_deploy
                                        })
                                        var rescheduled = reschedule.submit();

                                        if (reschedule == false) {
                                            exit = true;
                                            return false;
                                        }
                                    }

                                    // var service_leg_record = nlapiLoadRecord('customrecord_service_leg', service_leg_id);
                                    // service_leg_record.setFieldValue('custrecord_app_ser_leg_daily_job_create', 1);
                                    // nlapiSubmitRecord(service_leg_record);
                                    var service_leg_record = record.load({
                                        id: service_leg_id,
                                        type: 'customrecord_service_leg'
                                    })
                                    service_leg_record.setValue({ id: 'custrecord_app_ser_leg_daily_job_create', value: 1});
                                    service_leg_record.save();

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
                                    // var service_leg_record = nlapiLoadRecord('customrecord_service_leg', service_leg_id);
                                    // service_leg_record.setFieldValue('custrecord_app_ser_leg_daily_job_create', 1);
                                    // nlapiSubmitRecord(service_leg_record);
                                    var service_leg_record = record.load({
                                        id: service_leg_id,
                                        type: 'customrecord_service_leg'
                                    })
                                    service_leg_record.setValue({ id: 'custrecord_app_ser_leg_daily_job_create', value: 1});
                                    service_leg_record.save();

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
                        }
                    } catch (e) {
                        // statements
                        var body = 'Error on one of the following: \n';
                        body += 'Service Leg ID: ' + service_leg_id + '\n';
                        body += 'Service Leg Freq ID: ' + service_freq_id + '\n';
                        body += 'Run Plan: ' + service_freq_run_plan_id + '\n';
                        body += 'e: ' + e + '\n';
                        // nlapiSendEmail(112209, 'ankith.ravindran@mailplus.com.au', 'Create App Jobs', body);
                        email.send({ author: 112209, recipients: 'ankith.ravindran@mailplus.com.au', subject: 'Create App Jobs', body: body})
                    }

                    old_service_id = service_id;
                    count++;
                    return true;
                });

                // nlapiLogExecution('AUDIT', 'Total Count for ' + zee_name, count);
                log.audit({
                    title: 'Total Count for ' + zee_name, 
                    details: count
                })
                if (exit == false) {
                    // var zee_record = nlapiLoadRecord('partner', zee_id);
                    // zee_record.setFieldValue('custentity_zee_app_job_created', 1);
                    // nlapiSubmitRecord(zee_record, false, true);
                    var zee_record = record.load({type: 'partner', id: zee_id});
                    zee_record.setValue('custentity_zee_app_job_created', 1);
                    // nlapiSubmitRecord(zee_record, false, true);
                    zee_record.save();

                    reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, null);
                    if (reschedule == false) {

                        return false;
                    }

                    reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        deploymentId: adhoc_inv_deploy,
                        params: params,
                        scriptId: prev_inv_deploy
                    })
                    var rescheduled = reschedule.submit();
                    if (rescheduled == false) {

                        return false;
                    }
                }

                return true;
            });
        
        }

        function createAppJobGroup(service_leg_service_text,
            service_leg_customer, service_leg_zee, service_id) {
            // var app_job_group_rec = nlapiCreateRecord('customrecord_jobgroup');
            var app_job_group_rec = record.create({
                type: 'customrecord_jobgroup'
            })
            app_job_group_rec.setValue({ fieldId: 'name', value: service_leg_service_text + '_' + date_of_week});
            app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_ref', value: service_leg_service_text + '_' + date_of_week});
            app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_customer', value: service_leg_customer});
            app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_franchisee', value: service_leg_zee});
            app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_service', value: service_id});
            app_job_group_rec.setValue({ fieldId: 'custrecord_jobgroup_status', value: 4});
        
            // var app_job_group_id = nlapiSubmitRecord(app_job_group_rec);
            var app_job_group_id = app_job_group_rec.save();
        
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
            // var app_job_rec = nlapiCreateRecord('customrecord_job');
            var app_job_rec = record.create({
                type: 'customrecord_job'
            })
            app_job_rec.setValue({ name: 'custrecord_job_franchisee', value: service_leg_zee});
            // nlapiLogExecution('DEBUG', 'Adhoc Value', service_freq_adhoc);
            log.debug({
                title: 'Adhoc Value',
                details: service_freq_adhoc
            })
            if (service_freq_adhoc == 'T') {
                if (service_leg_location_type == 2) {
                    app_job_rec.setValue({ name:'custrecord_app_job_stop_name', value: 'ADHOC - ' + service_leg_name + ' - ' + service_leg_customer_text});
                } else {
                    app_job_rec.setValue({ name:'custrecord_app_job_stop_name', value: 'ADHOC - ' + service_leg_name});
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
            app_job_rec.setValue({ fieldId: 'custrecord_job_date_scheduled', value: date_of_week});
            app_job_rec.setValue({ fieldId: 'custrecord_job_time_scheduled', value: service_freq_time_current});
            app_job_rec.setValue({ fieldId: 'custrecord_job_time_scheduled_after', value: service_freq_time_end});
            app_job_rec.setValue({ fieldId: 'custrecord_job_time_scheduled_before', value: service_freq_time_start});
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
        
            // nlapiSubmitRecord(app_job_rec);
            app_job_rec.save();
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