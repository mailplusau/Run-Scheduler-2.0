/**
 
 *@NApiVersion 2.0
 *@NScriptType Suitelet

 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
function(ui, email, runtime, search, record, http, log, redirect, format) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var role = runtime.getCurrentUser().role;
    
    function onRequest(context) {  
        
        if (context.request.method === 'GET') {
            zee = 404079;

            var serviceLegSearch = search.load({
                id: 'customsearch_rp_leg_freq_all_2',
                type: 'customrecord_service_leg'
            });

            serviceLegSearch.filters.push(search.createFilter({
                name: 'custrecord_service_leg_franchisee',
                operator: search.Operator.IS,
                values: zee
            }));
        
            var resultSet = serviceLegSearch.run();
        
            var stop_count = 0;
            var freq_count = 0;

            var old_stop_name = null;
            var service_id_array = [];
            var service_name_array = [];
            var service_descp_array = [];
            var old_customer_id_array = [];
            var old_customer_text_array = [];
            var old_run_plan_array = [];
            var old_run_plan_text_array = [];

            var stop_id;
            var stop_name;
            var stop_duration;
            var stop_notes;
            var service_id;
            var service_text;
            var customer_id;
            var customer_text;
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
            var old_stop_duration;
            var old_stop_notes = '';
            var old_service_id;
            var old_service_text;
            var old_customer_id;
            var old_customer_text;
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

            var stop_freq_json = '{ "data": [';

            resultSet.each(function(searchResult) {
                stop_id = searchResult.getValue({
                    name: 'internalid',
                    summary: search.Summary.GROUP,
                });

                stop_name = searchResult.getValue({
                    name: 'name',
                    summary: search.Summary.GROUP,
                });
                stop_duration = searchResult.getValue({
                    name: 'custrecord_service_leg_duration',
                    summary: search.Summary.GROUP,
                });
                stop_duration = parseInt(stop_duration);
                stop_notes = searchResult.getValue({
                    name: 'custrecord_service_leg_notes',
                    summary: search.Summary.GROUP,
                });
                service_id = searchResult.getValue({
                    name: 'custrecord_service_leg_service',
                    summary: search.Summary.GROUP,
                });
                service_text = searchResult.getText({
                    name: 'custrecord_service_leg_service',
                    summary: search.Summary.GROUP,
                });
                customer_id = searchResult.getValue({
                    name: 'custreco-rd_service_leg_customer',
                    summary: search.Summary.GROUP,
                });
                customer_text = searchResult.getText({
                    name: 'custrecord_service_leg_customer',
                    summary: search.Summary.GROUP,
                });
                ncl = searchResult.getValue({
                    name: 'custrecord_service_leg_non_cust_location',
                    summary: search.Summary.GROUP,
                });
            
                if (!isNullorEmpty(stop_notes)) {
                    stop_notes = customer_text + ' - ' + stop_notes + '</br>';
                } else {
                    stop_notes = '';
                }

                freq_id = searchResult.getValue({
                    name: 'internalid',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP"
                });
			    freq_mon = searchResult.getValue({
                    name: 'custrecord_service_freq_day_mon',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });
			    freq_tue = searchResult.getValue({
                    name: 'custrecord_service_freq_day_tue',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });
			    freq_wed = searchResult.getValue({
                    name: 'custrecord_service_freq_day_wed',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });
			    freq_thu = searchResult.getValue({
                    name: 'custrecord_service_freq_day_thu',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });
			    freq_fri = searchResult.getValue({
                    name: 'custrecord_service_freq_day_fri',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });
			    freq_adhoc = searchResult.getValue({
                    name: 'custrecord_service_freq_day_adhoc',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });
        
			    freq_time_current = searchResult.getValue({
                    name: 'custrecord_service_freq_time_current',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });

                freq_time_current = convertTo24Hour(freq_time_current);

			    freq_time_start = searchResult.getValue({
                    name: 'custrecord_service_freq_time_start',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });

                freq_time_start = convertTo24Hour(freq_time_start);

			    freq_time_end = searchResult.getValue({
                    name: 'custrecord_service_freq_time_end',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });
                
                freq_time_end = convertTo24Hour(freq_time_end);

                freq_run_plan = searchResult.getValue({
                    name: 'custrecord_service_freq_run_plan',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });

			    freq_run_plan_text = searchResult.getText({
                    name: 'custrecord_service_freq_run_plan',
                    join: 'CUSTRECORD_SERVICE_FREQ_STOP',
                    summary: "GROUP",
                });

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
                    stop_name = customer_text + ' - ' + stop_name;
                }

                if (stop_count != 0 && old_stop_name != stop_name) {
                    if (!isNullorEmpty(old_freq_id.length)) {
                        var freq_time_current_array = old_freq_time_current.split(':');
    
                        var min_array = convertSecondsToMinutes(old_stop_duration);
    
                        min_array[0] = min_array[0] + parseInt(freq_time_current_array[1]);
    
                        if (isNullorEmpty(old_ncl)) {
                            var bg_color = '#3a87ad';
                        } else {
                            var bg_color = '#ad3a3a';
                        }
                        if (old_freq_mon == 'T') {
    
                            stop_freq_json += '{"id": "' + old_stop_id + '",';
                            stop_freq_json += '"title": "' + old_stop_name + '",';
    
                            var start_time = moment().day(1).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                            var end_time = moment().add({
                                seconds: min_array[1]
                            }).day(1).hours(freq_time_current_array[0]).minutes(min_array[0]).format();
    
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
                                stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                stop_freq_json += '},'
                            }
                            stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                            stop_freq_json += ']},'
    
    
                        }
                        if (old_freq_tue == 'T') {
                            stop_freq_json += '{"id": "' + old_stop_id + '",';
                            stop_freq_json += '"title": "' + old_stop_name + '",';
    
                            var start_time = moment().day(2).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                            var end_time = moment().add({
                                seconds: min_array[1]
                            }).day(2).hours(freq_time_current_array[0]).minutes(min_array[0]).format();
    
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
                                stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                stop_freq_json += '},'
                            }
                            stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                            stop_freq_json += ']},'
                        }
                        if (old_freq_wed == 'T') {
                            stop_freq_json += '{"id": "' + old_stop_id + '",';
                            stop_freq_json += '"title": "' + old_stop_name + '",';
    
                            var start_time = moment().day(3).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                            var end_time = moment().add({
                                seconds: min_array[1]
                            }).day(3).hours(freq_time_current_array[0]).minutes(min_array[0]).format();
    
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
                                stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                stop_freq_json += '},'
                            }
                            stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                            stop_freq_json += ']},'
                        }
                        if (old_freq_thu == 'T') {
                            stop_freq_json += '{"id": "' + old_stop_id + '",';
                            stop_freq_json += '"title": "' + old_stop_name + '",';
    
                            var start_time = moment().day(4).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                            var end_time = moment().add({
                                seconds: min_array[1]
                            }).day(4).hours(freq_time_current_array[0]).minutes(min_array[0]).format();
    
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
                                stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                stop_freq_json += '},'
                            }
                            stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                            stop_freq_json += ']},'
                        }
                        if (old_freq_fri == 'T') {
                            stop_freq_json += '{"id": "' + old_stop_id + '",';
                            stop_freq_json += '"title": "' + old_stop_name + '",';
    
                            var start_time = moment().day(5).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                            var end_time = moment().add({
                                seconds: min_array[1]
                            }).day(5).hours(freq_time_current_array[0]).minutes(min_array[0]).format();
    
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
                                stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                stop_freq_json += '},'
                            }
                            stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                            stop_freq_json += ']},'
                        }
    
                        if (old_freq_mon == 'F' && old_freq_tue == 'F' && old_freq_wed == 'F' && old_freq_thu == 'F' && old_freq_fri == 'F') {
                            stop_freq_json += '{"id": "' + old_stop_id + '",';
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
                                stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                stop_freq_json += '},'
                            }
                            stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                            stop_freq_json += ']},'
                        }
    
                        old_stop_name = null;
                        old_stop_id = [];
                        service_id_array = [];
                        service_name_array = [];
                        old_customer_id_array = [];
                        old_customer_text_array = [];
                        old_freq_id = [];
                        old_run_plan_array = [];
                        old_run_plan_text_array = [];
                        old_stop_notes = '';
    
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
                        service_name_array[service_name_array.length] = service_text;
                        old_customer_id_array[old_customer_id_array.length] = customer_id;
                        old_customer_text_array[old_customer_text_array.length] = customer_text;
                        old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                        old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                        // stop_count++;
                    }
                } else {
                    var result = arraysEqual(freq, old_freq);

                    if (result == false && stop_count != 0) {
                        if (!isNullorEmpty(old_freq_id.length)) {
                            var freq_time_current_array = old_freq_time_current.split(':');

                            var min_array = convertSecondsToMinutes(old_stop_duration);

                            min_array[0] = min_array[0] + parseInt(freq_time_current_array[1]);

                            if (isNullorEmpty(old_ncl)) {
                                var bg_color = '#3a87ad';
                            } else {
                                var bg_color = '#ad3a3a';
                            }
                            if (old_freq_mon == 'T') {

                                stop_freq_json += '{"id": "' + old_stop_id + '",';
                                stop_freq_json += '"title": "' + old_stop_name + '",';

                                var start_time = moment().day(1).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                                var end_time = moment().add({
                                    seconds: min_array[1]
                                }).day(1).hours(freq_time_current_array[0]).minutes(min_array[0]).format();

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
                                    stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                    stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                    stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                    stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                    stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                    stop_freq_json += '},'
                                }
                                stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                                stop_freq_json += ']},'


                            }
                            if (old_freq_tue == 'T') {
                                stop_freq_json += '{"id": "' + old_stop_id + '",';
                                stop_freq_json += '"title": "' + old_stop_name + '",';

                                var start_time = moment().day(2).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                                var end_time = moment().add({
                                    seconds: min_array[1]
                                }).day(2).hours(freq_time_current_array[0]).minutes(min_array[0]).format();

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
                                    stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                    stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                    stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                    stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                    stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                    stop_freq_json += '},'
                                }
                                stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                                stop_freq_json += ']},'
                            }
                            if (old_freq_wed == 'T') {
                                stop_freq_json += '{"id": "' + old_stop_id + '",';
                                stop_freq_json += '"title": "' + old_stop_name + '",';

                                var start_time = moment().day(3).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                                var end_time = moment().add({
                                    seconds: min_array[1]
                                }).day(3).hours(freq_time_current_array[0]).minutes(min_array[0]).format();

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
                                    stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                    stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                    stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                    stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                    stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                    stop_freq_json += '},'
                                }
                                stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                                stop_freq_json += ']},'
                            }
                            if (old_freq_thu == 'T') {
                                stop_freq_json += '{"id": "' + old_stop_id + '",';
                                stop_freq_json += '"title": "' + old_stop_name + '",';

                                var start_time = moment().day(4).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                                var end_time = moment().add({
                                    seconds: min_array[1]
                                }).day(4).hours(freq_time_current_array[0]).minutes(min_array[0]).format();

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
                                    stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                    stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                    stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                    stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                    stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                    stop_freq_json += '},'
                                }
                                stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                                stop_freq_json += ']},'
                            }
                            if (old_freq_fri == 'T') {
                                stop_freq_json += '{"id": "' + old_stop_id + '",';
                                stop_freq_json += '"title": "' + old_stop_name + '",';

                                var start_time = moment().day(5).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                                var end_time = moment().add({
                                    seconds: min_array[1]
                                }).day(5).hours(freq_time_current_array[0]).minutes(min_array[0]).format();

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
                                    stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                    stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                    stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                    stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                    stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                    stop_freq_json += '},'
                                }
                                stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                                stop_freq_json += ']},'
                            }

                            if (old_freq_mon == 'F' && old_freq_tue == 'F' && old_freq_wed == 'F' && old_freq_thu == 'F' && old_freq_fri == 'F') {
                                stop_freq_json += '{"id": "' + old_stop_id + '",';
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
                                    stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                                    stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                                    stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                                    stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                                    stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                                    stop_freq_json += '},'
                                }
                                stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                                stop_freq_json += ']},'
                            }

                            old_stop_name = null;
                            old_stop_id = [];
                            service_id_array = [];
                            service_name_array = [];
                            old_customer_id_array = [];
                            old_customer_text_array = [];
                            old_run_plan_array = [];
                            old_run_plan_text_array = [];
                            old_freq_id = [];
                            old_freq = [];
                            freq = [];
                            old_stop_notes = '';

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
                            service_name_array[service_name_array.length] = service_text;
                            old_customer_id_array[old_customer_id_array.length] = customer_id;
                            old_customer_text_array[old_customer_text_array.length] = customer_text;
                            old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                            old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                        }
                    } else {
                        service_id_array[service_id_array.length] = service_id;
                        service_name_array[service_name_array.length] = service_text;
                        old_customer_id_array[old_customer_id_array.length] = customer_id;
                        old_customer_text_array[old_customer_text_array.length] = customer_text;
                        old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                        old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                    }
                }

                old_stop_name = stop_name;
                old_stop_id[old_stop_id.length] = stop_id;

                old_stop_duration = stop_duration;
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
                var freq_time_current_array = old_freq_time_current.split(':');
    
                var min_array = convertSecondsToMinutes(old_stop_duration);
    
                min_array[0] = min_array[0] + parseInt(freq_time_current_array[1]);
    
                if (isNullorEmpty(old_ncl)) {
                    var bg_color = '#3a87ad';
                } else {
                    var bg_color = '#ad3a3a';
                }
    
                if (old_freq_mon == 'T') {
                    stop_freq_json += '{"id": "' + old_stop_id + '",';
                    stop_freq_json += '"title": "' + old_stop_name + '",';
    
                    var start_time = moment().day(1).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                    var end_time = moment().add({
                        seconds: min_array[1]
                    }).day(1).hours(freq_time_current_array[0]).minutes(min_array[0]).format();
    
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
                        stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                        stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                        stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                        stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                        stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                        stop_freq_json += '},'
                    }
                    stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                    stop_freq_json += ']},'
    
    
                }
                if (old_freq_tue == 'T') {
                    stop_freq_json += '{"id": "' + old_stop_id + '",';
                    stop_freq_json += '"title": "' + old_stop_name + '",';
                    var start_time = moment().day(2).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                    var end_time = moment().add({
                        seconds: min_array[1]
                    }).day(2).hours(freq_time_current_array[0]).minutes(min_array[0]).format();
    
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
                        stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                        stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                        stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                        stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                        stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                        stop_freq_json += '},';
                    }
                    stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                    stop_freq_json += ']},';
                }
                if (old_freq_wed == 'T') {
                    stop_freq_json += '{"id": "' + old_stop_id + '",';
                    stop_freq_json += '"title": "' + old_stop_name + '",';
    
                    var start_time = moment().day(3).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                    var end_time = moment().add({
                        seconds: min_array[1]
                    }).day(3).hours(freq_time_current_array[0]).minutes(min_array[0]).format();
    
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
                        stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                        stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                        stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                        stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                        stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                        stop_freq_json += '},'
                    }
                    stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                    stop_freq_json += ']},';
                }
                if (old_freq_thu == 'T') {
                    stop_freq_json += '{"id": "' + old_stop_id + '",';
                    stop_freq_json += '"title": "' + old_stop_name + '",';
    
                    var start_time = moment().day(4).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                    var end_time = moment().add({
                        seconds: min_array[1]
                    }).day(4).hours(freq_time_current_array[0]).minutes(min_array[0]).format();
    
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
                        stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                        stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                        stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                        stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                        stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                        stop_freq_json += '},'
                    }
                    stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                    stop_freq_json += ']},'
                }
                if (old_freq_fri == 'T') {
                    stop_freq_json += '{"id": "' + old_stop_id + '",';
                    stop_freq_json += '"title": "' + old_stop_name + '",';
    
                    var start_time = moment().day(5).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                    var end_time = moment().add({
                        seconds: min_array[1]
                    }).day(5).hours(freq_time_current_array[0]).minutes(min_array[0]).format();
    
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
                        stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                        stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                        stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                        stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                        stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                        stop_freq_json += '},'
                    }
                    stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                    stop_freq_json += ']},'
                }
    
                if (old_freq_mon == 'F' && old_freq_tue == 'F' && old_freq_wed == 'F' && old_freq_thu == 'F' && old_freq_fri == 'F') {
                    stop_freq_json += '{"id": "' + old_stop_id + '",';
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
                        stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                        stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                        stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                        stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                        stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                        stop_freq_json += '},'
                    }
                    stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                    stop_freq_json += ']},'
                }
                stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
            }
            stop_freq_json += ']}';

            log.debug({
                title: 'Stop Freq JSON',
                details: stop_freq_json
            });

            var zeeRecord = record.load({
                type: record.Type.PARTNER,
                id: zee,
                isDynamic: true
            });

            zeeRecord.setValue({
                fieldId: 'custentity_zee_run',
                value: stop_freq_json
            });

            zeeRecord.save({
                ignoreMandatoryFields: true
            });

            var parsedStopFreq = JSON.parse(stop_freq_json);

            log.debug({
                title: 'JSON Parsed Freq',
                details: parsedStopFreq
            });

        } else {

        }
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
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

    function convertSecondsToMinutes(seconds) {
        var min = Math.floor(seconds / 60);
        var sec = seconds % 60;
    
        var minutes_array = [];
    
        minutes_array[0] = min;
        minutes_array[1] = sec;
    
        return minutes_array;
    }

    return {
        onRequest: onRequest
    };

});