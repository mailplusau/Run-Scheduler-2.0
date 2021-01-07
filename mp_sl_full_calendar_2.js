/**
 * 
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Description: Calendar view page of the run
 * 
 * @Last Modified by:   Sruti Desai
 * 
 */

 

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
function(ui, email, runtime, search, record, http, log, redirect, format) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var zee = 0;
    var role = runtime.getCurrentUser().role;

    if (role == 1000) {
        //Franchisee
        zee = runtime.getCurrentUser();
    } 

    function onRequest(context) {  
        
        if (context.request.method === 'GET') {
            var run = 0;
            var form = ui.createForm({
                title: 'Run Scheduler'
            });

            form.addField({
                id: 'save_button',
                type: ui.FieldType.TEXT,
                label: 'save_button'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = 'F';

            form.addField({
                id: 'stops',
                type: ui.FieldType.TEXT,
                label: 'stops'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'duration',
                type: ui.FieldType.TEXT,
                label: 'duration'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });


            form.addField({
                id: 'freqs',
                type: ui.FieldType.TEXT,
                label: 'freqs'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'start_times',
                type: ui.FieldType.TEXT,
                label: 'start_times'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            log.debug({
                title: 'zee',
                details: zee
            });

            log.debug({
                title: 'role',
                details: role
            });

            run = context.request.parameters.run;
            var inlineQty = '';

            inlineQty += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.1/jquery.min.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.1/jspdf.debug.js" integrity="sha384-THVO/sM0mFD9h7dfSndI6TS0PgAGavwKvB5hAxRRvc0o9cPLohB0wb/PTA7LdUHs" crossorigin="anonymous"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script sr';
            inlineQty += 'c="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            inlineQty += '<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js"></script><script type="text/javascript" src="https://1048144.app.netsuite.com/core/media/media.nl?id=2392604&c=1048144&h=6a28cec4ec4cd48e6a16&_xt=.js"></script> <link rel="stylesheet" type="text/css" href=https://1048144.app.netsuite.com/core/media/media.nl?id=2392605&c=1048144&h=3060708076f338e371ff&_xt=.css"><link rel="stylesheet" type="text/css" media="print" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2392601&c=1048144&h=4e40a20752aed954e459&_xt=.css">';
            inlineQty += '<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/qtip2/3.0.3/jquery.qtip.min.css"><script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/qtip2/3.0.3/jquery.qtip.min.js"></script>'
            inlineQty += '<div id="alert" class="alert alert-danger fade in"></div><div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Information</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-primary save_run" data-dismiss="modal">SAVE</button><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
    
            if (role != 1000) {
                inlineQty += '<div class="container" style="padding-top: 3%;"><div class="form-group container"><div class="row"><div class="input-group"><span class="input-group-addon">SELECT ZEE</span><select class="form-control zee_dropdown" >';

                var searched_zee = search.load({
                    id: 'customsearch_job_inv_process_zee',
                    type: search.Type.PARTNER
                });
    
                var resultSet_zee = searched_zee.run();
    
                var count_zee = 0;
    
                inlineQty += '<option value=""></option>'
    
                resultSet_zee.each(function(searchResult_zee) {
    
                    zeeid = searchResult_zee.getValue('internalid');
                    zee_name = searchResult_zee.getValue('entityid');
    
                    if (context.request.parameters.zee == zeeid) {
                        inlineQty += '<option value="' + zeeid + '" selected="selected">' + zee_name + '</option>';
                    } else {
                        inlineQty += '<option value="' + zeeid + '">' + zee_name + '</option>';
                    }
    
                    return true;
                });
    
                inlineQty += '</select></div></div></div></div>';
                zee = context.request.parameters.zee;
            }
            
            form.addField({
                id: 'zee',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zee;

            if (zee != 0 && !isNullorEmpty(zee)) {
                var zee_record = record.load({
                    type: record.Type.PARTNER,
                    id: parseInt(zee),
                    isDynamic: true,
                });
                var delimiter =  /\u0005/;
                var multi = zee_record.getValue({ fieldId: 'custentity_zee_multiple_territory' }).split(delimeter);
                var multi_text = zee_record.getText({ fieldId: 'custentity_zee_multiple_territory' });

                if (!isNullorEmpty(multi)) {
                    var multi_zee_text = '';
                    
                    form.addField({
                        id: 'multi_zee',
                        type: ui.FieldType.TEXT,
                        label: 'multi_zee'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });
    
                    if (multi.length > 1) {
                        inlineQty += '<div class="container" style="padding-top: 3%;"><div class="form-group container"><div class="row"><div class="input-group"><span class="input-group-addon">MULTIPLE TERRITORIES OWNED</span><select readonly class = "form-control zee_dropdown" > ';
                        for (var x = 0; x < multi.length; x++) {
                            if (zee == multi[x]) {
                                inlineQty += '<option selected="selected" value="' + multi[x] + '" data-right="" >' + multi_text[x] + '</option>';
                            } else {
                                inlineQty += '<option value="' + multi[x] + '" data-right="" >' + multi_text[x] + '</option>';
                            }
    
                            if (x != (multi.length - 1)) {
                                multi_zee_text += multi_text[x] + ',';
                            } else {
                                multi_zee_text += multi_text[x];
                            }
                        }
                    }

                    form.addField({
                        id: 'multi_zee_text',
                        type: ui.FieldType.TEXT,
                        label: 'multi_zee_text'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    }).defaultValue = multi_zee_text;

                    inlineQty += '</select></div></div></div></div>';

                } else {
                    form.addField({
                        id: 'multi_zee',
                        type: ui.FieldType.TEXT,
                        label: 'multi_zee'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });

                    form.addField({
                        id: 'multi_zee_text',
                        type: ui.FieldType.TEXT,
                        label: 'multi_zee_text'
                    }).updateDisplayType({
                        displayType: ui.FieldDisplayType.HIDDEN
                    });

                }

                inlineQty += '<div class="container select_run" style="padding-top: 3%;"><div class="form-group container"><div class="row"><div class="input-group"><span class="input-group-addon">SELECT RUN</span><select class="form-control run_dropdown" >';

                var runPlanSearch = search.load({
                    id: 'customsearch_app_run_plan_active',
                    type: 'customrecord_run_plan'
                })

                if (!isNullorEmpty(multi)) {
                    runPlanSearch.filters.push(search.createFilter({
						name: 'custrecord_run_franchisee',
						operator: search.Operator.ANYOF,
						values: zee
                    }));

                } else {
                    runPlanSearch.filters.push(search.createFilter({
						name: 'custrecord_run_franchisee',
						operator: search.Operator.IS,
						values: zee
                    }));
                }

                var resultSet_runPlan = runPlanSearch.run();
                var count_zee = 0;
                inlineQty += '<option value="' + 0 + '">ALL</option>'
                resultSet_runPlan.each(function(searchResult_runPlan) {
                    runinternalid = searchResult_runPlan.getValue('internalid');
                    runname = searchResult_runPlan.getValue('name');
    
                    if (context.request.parameters.run == runinternalid) {
                        inlineQty += '<option value="' + runinternalid + '" selected="selected">' + runname + '</option>';
                    } else {
                        inlineQty += '<option value="' + runinternalid + '">' + runname + '</option>';
                    }
    
                    return true;
                });
                
                inlineQty += '</select></div></div></div></div>';

                log.debug({
                    title: 'zee',
                    details: zee
                });

                log.debug({
                    title: 'run',
                    details: run
                });

                
                var serviceLegSearch = search.load({
                    id: 'customsearch_rp_leg_freq_all_2',
                    type: 'customrecord_service_leg'
                });
                
                serviceLegSearch.filters.push(search.createFilter({
                    name: 'custrecord_service_leg_franchisee',
                    operator: search.Operator.ANYOF,
                    values: zee
                }));

                if (!isNullorEmpty(run) && run != 0) {
                    serviceLegSearch.filters.push(search.createFilter({
                        name: 'custrecord_service_freq_run_plan',
                        join: 'custrecord_service_freq_stop',
						operator: search.Operator.IS,
						values: run
                    }));

                }
        
                var resultSet = serviceLegSearch.run();

                var stop_count = 0;
                var freq_count = 0;

                var old_stop_name = null;
                var service_id_array = [];
                var service_name_array = [];
                var service_descp_array = [];
                var old_customer_id_array = [];
                var old_customer_text_array = [];
                var old_customer_zee_array = [];
                var old_run_plan_array = [];
                var old_run_plan_text_array = [];
                var old_closing_day = [];
                var old_opening_day = [];
                var old_service_notes = [];
                var old_stop_duration = [];

                var stop_id;
                var stop_name;
                var address;
                var stop_duration;
                var stop_notes;
                var stop_lat;
                var stop_lon;
                var service_id;
                var service_text;
                var customer_id;
                var customer_text;
                var customer_zee;
                var ncl;
                var freq_id;
                var freq_mon;
                var freq_tue;
                var freq_wed;
                var freq_thu;
                var freq_fri;
                var freq_adhoc;
                var freq_time_current;
                var freq_time_start;
                var freq_time_end;
                var freq_run_plan;

                var old_stop_id = [];
                var old_stop_name;
                var old_service_time;
                var old_address;
                var old_stop_notes = '';
                var old_stop_lat;
                var old_stop_lon;
                var old_service_id;

                var old_service_text;
                var old_customer_id;
                var old_customer_text;
                var old_customer_zee;
                var old_ncl;
                var old_freq_id = [];
                var old_freq_mon;
                var old_freq_tue;
                var old_freq_wed;
                var old_freq_thu;
                var old_freq_fri;
                var old_freq_adhoc;
                var old_freq_time_current;
                var old_freq_time_start;
                var old_freq_time_end;
                var old_freq_run_plan;


                var freq = [];
                var old_freq = [];

                var stop_freq_json_array = ['{ "data": ['];

                resultSet.each(function(searchResult) {
                    stop_id = searchResult.getValue({ name: 'internalid', join: null, summary: search.Summary.GROUP });
                    stop_name = searchResult.getValue({ name: 'name', join: null, summary: search.Summary.GROUP });
                    stop_duration = parseInt(searchResult.getValue({ name: 'custrecord_service_leg_duration', join: null, summary: search.Summary.GROUP }));
                    stop_notes = searchResult.getValue({ name: 'custrecord_service_leg_notes', join: null, summary: search.Summary.GROUP });
                    stop_lat = searchResult.getValue({ name: "custrecord_service_leg_addr_lat", join: null, summary: search.Summary.GROUP });
                    stop_lon = searchResult.getValue({ name: "custrecord_service_leg_addr_lon", join: null, summary: search.Summary.GROUP });
                    service_id = searchResult.getValue({ name: 'custrecord_service_leg_service', join: null, summary: search.Summary.GROUP });
                    service_text = searchResult.getText({ name: 'custrecord_service_leg_service', join: null, summary: search.Summary.GROUP });
                    customer_id = searchResult.getValue({ name: 'custrecord_service_leg_customer', join: null, summary: search.Summary.GROUP });
                    customer_text = searchResult.getText({ name: 'custrecord_service_leg_customer', join: null, summary: search.Summary.GROUP });
                    customer_zee = searchResult.getValue({ name: "partner", join: "CUSTRECORD_SERVICE_LEG_CUSTOMER", summary: search.Summary.GROUP });
                    customer_id_text = searchResult.getValue({ name: "entityid", join: "CUSTRECORD_SERVICE_LEG_CUSTOMER", summary: search.Summary.GROUP });
                    customer_name_text = searchResult.getValue({ name: "companyname", join: "CUSTRECORD_SERVICE_LEG_CUSTOMER", summary: search.Summary.GROUP });
                    ncl = searchResult.getValue({ name: 'custrecord_service_leg_non_cust_location', join: null, summary: search.Summary.GROUP });
    
                    freq_id = searchResult.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP });
                    freq_mon = searchResult.getValue({ name: "custrecord_service_freq_day_mon", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP });
                    freq_tue = searchResult.getValue({ name: "custrecord_service_freq_day_tue", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP });
                    freq_wed = searchResult.getValue({ name: "custrecord_service_freq_day_wed", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP });
                    freq_thu = searchResult.getValue({ name: "custrecord_service_freq_day_thu", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP });
                    freq_fri = searchResult.getValue({ name: "custrecord_service_freq_day_fri", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP });
                    freq_adhoc = searchResult.getValue({ name: "custrecord_service_freq_day_adhoc", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP });
                    freq_time_current = convertTo24Hour(searchResult.getValue({ name: "custrecord_service_freq_time_current", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP }));
                    freq_time_start = convertTo24Hour(searchResult.getValue({ name: "custrecord_service_freq_time_start", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP }));
                    freq_time_end = convertTo24Hour(searchResult.getValue({ name: "custrecord_service_freq_time_end", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP }));
                    freq_run_plan = searchResult.getValue({ name: "custrecord_service_freq_run_plan", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP });
                    closing_day = searchResult.getValue({ name: "custrecord_service_leg_closing_date", join: null, summary: search.Summary.GROUP });
                    opening_day = searchResult.getValue({ name: "custrecord_service_leg_opening_date", join: null, summary: search.Summary.GROUP });
                    freq_run_plan_text = searchResult.getText({ name: "custrecord_service_freq_run_plan", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP });
                    freq_run_st_no = searchResult.getValue({ name: "custrecord_service_leg_addr_st_num_name", join: null, summary: search.Summary.GROUP });
                    freq_run_suburb = searchResult.getValue({ name: "custrecord_service_leg_addr_suburb", join: null, summary: search.Summary.GROUP });
                    freq_run_state = searchResult.getValue({ name: "custrecord_service_leg_addr_state", join: null, summary: search.Summary.GROUP });
                    freq_run_postcode = searchResult.getValue({ name: "custrecord_service_leg_addr_postcode", join: null, summary: search.Summary.GROUP });
    
                    if (!isNullorEmpty(freq_run_st_no)) {
                        address = freq_run_st_no + ', ' + freq_run_suburb + ', ' + freq_run_state + ' - ' + freq_run_postcode;
                    } else {
                        address = freq_run_suburb + ', ' + freq_run_state + ' - ' + freq_run_postcode;
                    }
    
    
    
                    freq = [];
    
                    if (freq_mon == 'T') {
                        freq[freq.length] = 1
                    }
    
                    if (freq_tue == 'T') {
                        freq[freq.length] = 2
                    }
    
                    if (freq_wed == 'T') {
                        freq[freq.length] = 3
                    }
    
                    if (freq_thu == 'T') {
                        freq[freq.length] = 4
                    }
    
                    if (freq_fri == 'T') {
                        freq[freq.length] = 5
                    }

                    if (isNullorEmpty(ncl)) {
                        stop_name = customer_name_text + ' \\n Address: ' + address;
                    }
                    if (stop_count != 0 && old_stop_name != stop_name) {

                        if (!isNullorEmpty(old_freq_id.length)) {
                            if (stop_freq_json_array[stop_freq_json_array.length - 1].length < 900000) {
                                stop_freq_json_array[stop_freq_json_array.length - 1] += updateJSON(old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri);
                            } else {
                                stop_freq_json_array[stop_freq_json_array.length - 1] = stop_freq_json_array[stop_freq_json_array.length - 1].substring(0, stop_freq_json_array[stop_freq_json_array.length - 1].length - 1);
                                stop_freq_json_array[stop_freq_json_array.length] = updateJSON(old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri);
                                log.debug({
                                    title: 'stop_freq_json_array',
                                    details: stop_freq_json_array[stop_freq_json_array.length - 1]
                                });
                            }

                            old_stop_name = null;
                            old_stop_lat;
                            old_stop_lon;
                            old_stop_id = [];
                            old_closing_day = [];
                            old_opening_day = [];
                            service_id_array = [];
                            service_name_array = [];
                            old_customer_id_array = [];
                            old_customer_text_array = [];
                            old_customer_zee_array = [];
                            old_freq_id = [];
                            old_run_plan_array = [];
                            old_run_plan_text_array = [];
                            old_stop_notes = '';
                            old_service_notes = [];
                            old_stop_duration = [];
                            old_freq = [];
                            freq = [];

                            if (freq_mon == 'T') {
                                freq[freq.length] = 1
                            }

                            if (freq_tue == 'T') {
                                freq[freq.length] = 2
                            }

                            if (freq_wed == 'T') {
                                freq[freq.length] = 3
                            }

                            if (freq_thu == 'T') {
                                freq[freq.length] = 4
                            }

                            if (freq_fri == 'T') {
                                freq[freq.length] = 5
                            }
                            service_id_array[service_id_array.length] = service_id;
                            old_service_notes[old_service_notes.length] = stop_notes;
                            service_name_array[service_name_array.length] = service_text;
                            old_customer_id_array[old_customer_id_array.length] = customer_id;
                            old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                            old_customer_zee_array[old_customer_zee_array.length] = customer_zee;
                            old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                            old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                            old_closing_day[old_closing_day.length] = closing_day;
                            old_opening_day[old_opening_day.length] = opening_day;
                            old_stop_duration[old_stop_duration.length] = stop_duration;

                        }
                    } else {
                        var result = arraysEqual(freq, old_freq);
                        if (old_service_time != freq_time_current && stop_count != 0) {
                            if (!isNullorEmpty(old_freq_id.length)) {
                                if (stop_freq_json_array[stop_freq_json_array.length - 1].length < 900000) {
                                    stop_freq_json_array[stop_freq_json_array.length - 1] += updateJSON(old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri);
                                } else {
                                    stop_freq_json_array[stop_freq_json_array.length - 1] = stop_freq_json_array[stop_freq_json_array.length - 1].substring(0, stop_freq_json_array[stop_freq_json_array.length - 1].length - 1);
                                    stop_freq_json_array[stop_freq_json_array.length] = updateJSON(old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri);
                                    log.debug({
                                        title: 'stop_freq_json_array[stop_freq_json_array.length - 1]',
                                        details: stop_freq_json_array[stop_freq_json_array.length - 1]
                                    });  
                                }

                                old_stop_name = null;
                                old_service_time = null;
                                old_stop_id = [];
                                old_closing_day = [];
                                old_opening_day = [];
                                service_id_array = [];
                                service_name_array = [];
                                old_customer_id_array = [];
                                old_customer_text_array = [];
                                old_customer_zee_array = [];
                                old_run_plan_array = [];
                                old_run_plan_text_array = [];
                                old_freq_id = [];
                                old_freq = [];
                                freq = [];
                                old_stop_notes = '';
                                old_closing_day = [];
                                old_opening_day = [];
                                old_service_notes = [];
                                old_stop_duration = [];


                                if (freq_mon == 'T') {
                                    freq[freq.length] = 1
                                }

                                if (freq_tue == 'T') {
                                    freq[freq.length] = 2
                                }

                                if (freq_wed == 'T') {
                                    freq[freq.length] = 3
                                }

                                if (freq_thu == 'T') {
                                    freq[freq.length] = 4
                                }

                                if (freq_fri == 'T') {
                                    freq[freq.length] = 5
                                }

                                service_id_array[service_id_array.length] = service_id;
                                old_service_notes[old_service_notes.length] = stop_notes;
                                service_name_array[service_name_array.length] = service_text;
                                old_customer_id_array[old_customer_id_array.length] = customer_id;
                                old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                                old_customer_zee_array[old_customer_zee_array.length] = customer_zee;
                                old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                                old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                                old_closing_day[old_closing_day.length] = closing_day;
                                old_opening_day[old_opening_day.length] = opening_day;
                                old_stop_duration[old_stop_duration.length] = stop_duration;
                            }
                        }  else if (result == false && stop_count != 0) {
                            if (!isNullorEmpty(old_freq_id.length)) {
                                if (stop_freq_json_array[stop_freq_json_array.length - 1].length < 900000) {
                                    stop_freq_json_array[stop_freq_json_array.length - 1] += updateJSON(old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri);
                                } else {
                                    stop_freq_json_array[stop_freq_json_array.length - 1] = stop_freq_json_array[stop_freq_json_array.length - 1].substring(0, stop_freq_json_array[stop_freq_json_array.length - 1].length - 1);
                                    stop_freq_json_array[stop_freq_json_array.length] = updateJSON(old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri);
                                    log.debug({
                                        title: 'stop_freq_json_array[stop_freq_json_array.length - 1]',
                                        details: stop_freq_json_array[stop_freq_json_array.length - 1]
                                    });
                                    
                                }

                                old_stop_name = null;
                                old_service_time = null;
                                old_stop_id = [];
                                old_stop_lat;
                                old_stop_lon;
                                old_closing_day = [];
                                old_opening_day = [];
                                service_id_array = [];
                                service_name_array = [];
                                old_customer_id_array = [];
                                old_customer_text_array = [];
                                old_customer_zee_array = [];
                                old_run_plan_array = [];
                                old_run_plan_text_array = [];
                                old_freq_id = [];
                                old_freq = [];
                                freq = [];
                                old_stop_notes = '';
                                old_closing_day = [];
                                old_opening_day = [];
                                old_service_notes = [];
                                old_stop_duration = [];


                                if (freq_mon == 'T') {
                                    freq[freq.length] = 1
                                }

                                if (freq_tue == 'T') {
                                    freq[freq.length] = 2
                                }

                                if (freq_wed == 'T') {
                                    freq[freq.length] = 3
                                }

                                if (freq_thu == 'T') {
                                    freq[freq.length] = 4
                                }

                                if (freq_fri == 'T') {
                                    freq[freq.length] = 5
                                }

                                service_id_array[service_id_array.length] = service_id;
                                old_service_notes[old_service_notes.length] = stop_notes;
                                service_name_array[service_name_array.length] = service_text;
                                old_customer_id_array[old_customer_id_array.length] = customer_id;
                                old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                                old_customer_zee_array[old_customer_zee_array.length] = customer_zee;
                                old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                                old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                                old_closing_day[old_closing_day.length] = closing_day;
                                old_opening_day[old_opening_day.length] = opening_day;
                                old_stop_duration[old_stop_duration.length] = stop_duration;
                            }
                        } else {
                            service_id_array[service_id_array.length] = service_id;
                            old_service_notes[old_service_notes.length] = stop_notes;
                            service_name_array[service_name_array.length] = service_text;
                            old_customer_id_array[old_customer_id_array.length] = customer_id;
                            old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                            old_customer_zee_array[old_customer_zee_array.length] = customer_zee;
                            old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                            old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                            old_closing_day[old_closing_day.length] = closing_day;
                            old_opening_day[old_opening_day.length] = opening_day;
                            old_stop_duration[old_stop_duration.length] = stop_duration;
                         
                        }
                    }

                    old_stop_name = stop_name;
                    old_service_time = freq_time_current;
                    old_address = address;

                    old_stop_id[old_stop_id.length] = stop_id;
                    old_stop_lat = stop_lat;
                    old_stop_lon = stop_lon;
                    old_stop_notes += stop_notes;

                    old_ncl = ncl;
                    old_freq_id[old_freq_id.length] = freq_id;
                    old_freq_mon = freq_mon;
                    old_freq_tue = freq_tue;
                    old_freq_wed = freq_wed;
                    old_freq_thu = freq_thu;
                    old_freq_fri = freq_fri;
                    old_freq_adhoc = freq_adhoc;
                    old_freq_time_current = freq_time_current;
                    old_freq_time_start = freq_time_start;
                    old_freq_time_end = freq_time_end;
                    old_freq_run_plan = freq_run_plan;

                    old_freq = freq;

                    stop_count++;
                    return true;

                });

                if (stop_count > 0) {
                    if (stop_freq_json_array[stop_freq_json_array.length - 1].length < 900000) {
                        stop_freq_json_array[stop_freq_json_array.length - 1] += updateJSON(old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri);
                    } else {
                        stop_freq_json_array[stop_freq_json_array.length - 1] = stop_freq_json_array[stop_freq_json_array.length - 1].substring(0, stop_freq_json_array[stop_freq_json_array.length - 1].length - 1);
                        stop_freq_json_array[stop_freq_json_array.length] = updateJSON(old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri);
                        log.debug({
                            title: 'stop_freq_json_array[stop_freq_json_array.length - 1]',
                            details: stop_freq_json_array[stop_freq_json_array.length - 1]
                        });
                    }
                }

                log.debug({
                    title: 'Stop Freq JSON',
                    details: stop_freq_json_array[0]
                });

                log.debug({
                    title: 'Stop Freq JSON 2',
                    details: stop_freq_json_array[1]
                });

                log.debug({
                    title: 'Stop Freq JSON length',
                    details: stop_freq_json_array.length
                });

                if (stop_count == 0){
                    stop_freq_json_array = ['{ "data": [,']
                } 

                var zeeRecord = record.load({
                    type: record.Type.PARTNER,
                    id: zee,
                    isDynamic: true,
                });

                for (i = 0; i < stop_freq_json_array.length; i++) {
                    zeeRecord.setValue({
                        fieldId: 'custentity_zee_run_' + i,
                        value: stop_freq_json_array[i].substring(0, stop_freq_json_array[i].length - 1)
                    });
                }
                zeeRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

            }

            log.debug({
                title: 'stop_count',
                details: stop_count
            });

            //inlineQty += '<div class="se-pre-con"></div>
            inlineQty += '<div id="calendar" style="font-size:small;"></div>';
            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlineQty;

            form.addSubmitButton({
                label : 'Customer List View'
            });
            form.addButton({
                id : 'create_run',
                label : 'Create Run',
                functionName : 'onclick_createRun()'
            });

            form.addButton({
                id : 'customer_closure',
                label : 'Scheduled Customer Holiday Closure',
                functionName : 'onclick_customerClosure()'
            });

            form.addButton({
                id : 'save',
                label : 'Save Changes',
                functionName : 'onclick_save()'
            });
    
            form.addButton({
                id : 'back',
                label : 'Cancel',
                functionName : 'onclick_reset()'
            });

            form.addButton({
                id : 'network_map',
                label : 'Network Map',
                functionName : 'onclick_networkMap(' + zee + ')'
            });

            /**
             * CONVERT CL AND PUT CL ID
             */            
            form.clientScriptFileId = 4609635; //PROD = 4609635 SB = ?
            context.response.writePage(form);
            
        } else {
            var save_button = context.request.parameters.save_button;
            var stops_string = context.request.parameters.stops;
            var duration_string = context.request.parameters.duration;
            var freqs_string = context.request.parameters.freqs;
            var start_times_string = context.request.parameters.start_times;
            var zee_response = context.request.parameters.zee;

            if (!isNullorEmpty(stops_string) && !isNullorEmpty(duration_string)) {
                var stops = stops_string.split(',');
                var duration = duration_string.split(',');
    
                for (var x = 0; x < stops.length; x++) {
                    var serviceLegRecord = record.load({
                        type: 'customrecord_service_leg',
                        id: stops[x],
                        isDynamic: true,
                    });
                    
                    serviceLegRecord.setValue({ fieldId: 'custrecord_service_leg_duration', value: duration[x]});
                    serviceLegRecord.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                }
            }

            if (!isNullorEmpty(freqs_string) && !isNullorEmpty(start_times_string)) {
                var freqs = freqs_string.split(',');
                var start_times = start_times_string.split(',');
    
                for (var x = 0; x < freqs.length; x++) {
                    var freqRecord = record.load({
                        type: 'customrecord_service_freq',
                        id: freqs[x],
                        isDynamic: true,
                    });
                    freqRecord.setValue({ fieldId: 'custrecord_service_freq_time_current', value: start_times[x]});

                    freqRecord.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                }
            }

            if (save_button == 'T') {
                redirect.toSuitelet({
                    scriptId: 'customscript_sl_full_calendar_2',
                    deploymentId: 'customdeploy_sl_full_calender_2',
                });

            } else {
                var params = {
                    scriptid: 'customscript_sl_full_calendar_2',
                    deployid: 'customdeploy_sl_full_calender_2',
                    zee: zee_response
                }

                redirect.toSuitelet({
                    scriptId: 'customscript_sl_rp_customer_list',
                    deploymentId: 'customdeploy_sl_rp_customer_list',
                    parameters: params
                });
            }

        }
    }

    function convertSecondsToMinutes(seconds) {
        var min = Math.floor(seconds / 60);
        var sec = seconds % 60;
    
        var minutes_array = [];
    
        minutes_array[0] = min;
        minutes_array[1] = sec;
    
        return minutes_array;
    }

    function convertTo24Hour(time) {
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

    function arraysEqual(_arr1, _arr2) {

        if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length)
            return false;
    
        var arr1 = _arr1.concat().sort();
        var arr2 = _arr2.concat().sort();
    
        for (var i = 0; i < arr1.length; i++) {
    
            if (arr1[i] !== arr2[i])
                return false;
    
        }
    
        return true;
    
    }

    function getDate() {
        var date = new Date();
        if (date.getHours() > 6) {
            date = date.setDate(date.getDate() + 1); 
        }
        date = format.format({
            value: date,
            type: format.Type.DATE,
            timezone: format.Timezone.AUSTRALIA_SYDNEY
        });
    
        return date;
    }

    
    function updateJSON(old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri) {
        var stop_freq_json = '';
        var freq_time_current_array = old_freq_time_current.split(':');

        var min_array = convertSecondsToMinutes(Math.max.apply(Math, old_stop_duration));

        min_array[0] = parseInt(min_array[0]) + +freq_time_current_array[1];

        if (isNullorEmpty(old_ncl)) {
            var bg_color = '#3a87ad';
        } else {
            var bg_color = '#009688';
        }
        if (old_freq_mon == 'T') {
            var day_number = 1;
            stop_freq_json += addDayJSON(day_number, old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri, bg_color, freq_time_current_array, min_array);
        }
        if (old_freq_tue == 'T') {
            var day_number = 2;
            stop_freq_json += addDayJSON(day_number, old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri, bg_color, freq_time_current_array, min_array);
        }
        if (old_freq_wed == 'T') {
            var day_number = 3;
            stop_freq_json += addDayJSON(day_number, old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri, bg_color, freq_time_current_array, min_array);
        }
        if (old_freq_thu == 'T') {
            var day_number = 4;
            stop_freq_json += addDayJSON(day_number, old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri, bg_color, freq_time_current_array, min_array);
        }
        if (old_freq_fri == 'T') {
            var day_number = 5;
            stop_freq_json += addDayJSON(day_number, old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri, bg_color, freq_time_current_array, min_array);
        }

        if (old_freq_mon == 'F' && old_freq_tue == 'F' && old_freq_wed == 'F' && old_freq_thu == 'F' && old_freq_fri == 'F') {
            stop_freq_json += '{"id": "' + old_stop_id + '",';
            stop_freq_json += '"closing_days": "' + old_closing_day + '",';
            stop_freq_json += '"opening_days": "' + old_opening_day + '",';
            stop_freq_json += '"lat": "' + old_stop_lat + '",';
            stop_freq_json += '"lon": "' + old_stop_lon + '",';
            stop_freq_json += '"title": "' + old_stop_name + '",';

            var start_time = moment().day(6).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
            var end_time = moment().add({
                seconds: min_array[1]
            }).day(6).hours(freq_time_current_array[0]).minutes(min_array[0]).format();

            stop_freq_json += '"start": "' + start_time + '",';
            stop_freq_json += '"end": "' + end_time + '",';
            stop_freq_json += '"description": "' + old_stop_notes + '",';
            stop_freq_json += '"ncl": "' + old_ncl + '",';
            stop_freq_json += '"color": "' + bg_color + '",';
            stop_freq_json += '"freq_id": "' + old_freq_id + '",';
            stop_freq_json += '"services": ['
            for (var i = 0; i < service_id_array.length; i++) {
                stop_freq_json += '{';
                stop_freq_json += '"customer_id": "' + old_customer_id_array[i] + '",';
                stop_freq_json += '"customer_zee": "' + old_customer_zee_array[i] + '",';
                stop_freq_json += '"customer_notes": "' + old_service_notes[i] + '",';
                stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                stop_freq_json += '"service_text": "' + service_name_array[i] + '"';

                stop_freq_json += '},'
            }
            stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1); //to remove the last coma
            stop_freq_json += ']},'
        }
        return stop_freq_json;
    }

    
    function addDayJSON(day_number, old_stop_name, old_freq_time_current, old_stop_duration, old_stop_id, old_closing_day, old_opening_day, old_stop_lat, old_stop_lon, old_stop_notes, old_ncl, old_freq_id, old_customer_id_array, old_customer_text_array, old_customer_zee_array, old_service_notes, old_run_plan_array, old_run_plan_text_array, service_id_array, service_name_array, old_freq_mon, old_freq_tue, old_freq_wed, old_freq_thu, old_freq_fri, bg_color, freq_time_current_array, min_array) {
        var date = moment().day(day_number).date();
        var month = moment().day(day_number).month();
        var year = moment().day(day_number).year();

        var date_of_week = date + '/' + (month + 1) + '/' + year;

        var stop_freq_json = '';

        stop_freq_json += '{"id": "' + old_stop_id + '",';
        stop_freq_json += '"closing_days": "' + old_closing_day + '",';
        stop_freq_json += '"opening_days": "' + old_opening_day + '",';
        stop_freq_json += '"lat": "' + old_stop_lat + '",';
        stop_freq_json += '"lon": "' + old_stop_lon + '",';
        if (isNullorEmpty(old_ncl)) {
            for (var i = 0; i < service_id_array.length; i++) {
                if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                    stop_freq_json += '"title": "CLOSED - ' + old_stop_name + '",';
                    stop_freq_json += '"color": "#ad3a3a",';
                } else {
                    stop_freq_json += '"title": "' + old_stop_name + '",';
                    stop_freq_json += '"color": "' + bg_color + '",';

                }
            }
        } else {
            stop_freq_json += '"title": "' + old_stop_name + '",';
            stop_freq_json += '"color": "' + bg_color + '",';
        }

        var start_time = moment().day(day_number).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
        var end_time = moment().day(day_number).hours(freq_time_current_array[0]).minutes(min_array[0]).seconds(0).format();


        stop_freq_json += '"start": "' + start_time + '",';
        stop_freq_json += '"end": "' + end_time + '",';
        stop_freq_json += '"description": "' + old_stop_notes + '",';
        stop_freq_json += '"ncl": "' + old_ncl + '",';
        stop_freq_json += '"freq_id": "' + old_freq_id + '",';
        stop_freq_json += '"services": ['
        
        for (var i = 0; i < service_id_array.length; i++) {
            stop_freq_json += '{';
            stop_freq_json += '"customer_id": "' + old_customer_id_array[i] + '",';
            stop_freq_json += '"customer_zee": "' + old_customer_zee_array[i] + '",';
            stop_freq_json += '"customer_notes": "' + old_service_notes[i] + '",';
            if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                stop_freq_json += '"customer_text": "CLOSED - ' + old_customer_text_array[i] + '",';
            } else {
                stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
            }

            stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
            stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
            stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
            stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
            stop_freq_json += '},'
        }
        stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1); //to remove the last coma
        stop_freq_json += ']},'

        return stop_freq_json
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }
    
    return {
        onRequest: onRequest
    };

});