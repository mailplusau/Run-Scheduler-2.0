/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
    function(error, runtime, search, url, record, format, email, currentRecord) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var role = runtime.getCurrentUser().role;
        

        var table;
        var inactivate_id_array = [];
        var remove_id_array = [];

        /**
         * [pageInit description] - On page initialization, load the Dynatable CSS and sort the table based on the customer name and align the table to the center of the page. 
         */
        function pageInit() {
            //To show loader while the page is laoding
            console.log("1");
            $(window).load(function() {
                // Animate loader off screen
                $(".se-pre-con").fadeOut("slow");;
            });
            //Search: RP - Services
            var serviceSearch = search.load({
                id: 'customsearch_rp_services',
                type: 'customrecord_service'
            });
            var currRecord = currentRecord.get();
            var zeeVal = currRecord.getValue({
                fieldId: 'zee'
            });
            console.log(JSON.stringify(zeeVal));
            serviceSearch.filters.push(search.createFilter({
                name: 'custrecord_service_franchisee',
                operator: search.Operator.ANYOF,
                values: zeeVal
            }));
            console.log("2");


            var resultSetCustomer = serviceSearch.run();
            var old_customer_id;
            var old_service_id;
            var old_entity_id;
            var old_company_name;
            var old_scheduled;
            console.log("3");

            var count = 0;
            var customer_count = 0;

            var service_id_array = [];
            var service_name_array = [];
            var service_descp_array = [];
            var service_price_array = [];
            var service_scheduled_array = [];
            var service_freq_count_array = [];
            var service_leg_count_array = [];
            var service_no_of_legs_array = [];
            var show_on_app_array = [];
            var services_suspended = 0;

            var dataSet = '{"data":[';

            
            resultSetCustomer.each(function(searchResult) {
                console.log("4");

                var custid = searchResult.getValue({ name: "custrecord_service_customer", join: null, summary: search.Summary.GROUP});
                
                var entityid = searchResult.getValue({ name: "entityid", join: "CUSTRECORD_SERVICE_CUSTOMER", summary: search.Summary.GROUP});
                
                var companyname = searchResult.getValue({ name: "companyname", join: "CUSTRECORD_SERVICE_CUSTOMER", summary: search.Summary.GROUP});
                
                var scheduled = searchResult.getValue({ name: "custentity_run_scheduled", join: "CUSTRECORD_SERVICE_CUSTOMER", summary: search.Summary.GROUP});
                
                var service_id = searchResult.getValue({ name: "internalid", join: null, summary: search.Summary.GROUP});
                
                var service_name = searchResult.getValue({ name: "custrecord_service", join: null, summary: search.Summary.GROUP});
                
                var service_descp = searchResult.getValue({ name: "custrecord_service_description", join: null, summary: search.Summary.GROUP});
                
                var service_price = searchResult.getValue({ name: "custrecord_service_price", join: null, summary: search.Summary.GROUP});
                
                var service_scheduled = searchResult.getValue({ name: "custrecord_service_run_scheduled", join: null, summary: search.Summary.GROUP});
                
                var service_leg_freq_count = searchResult.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_FREQ_SERVICE", summary: search.Summary.COUNT});
                
                var service_leg_count = searchResult.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_LEG_SERVICE", summary: search.Summary.COUNT});
                
                var no_of_legs = searchResult.getValue({ name: "custrecord_service_type_leg_no", join: "CUSTRECORD_SERVICE", summary: search.Summary.GROUP});
                
                var show_on_app = searchResult.getValue({ name: "custrecord_show_on_app", join: null, summary: search.Summary.GROUP});
                
                if (service_price == '.00'){
                    console.log('MPEX Pickup service_price', service_price);
                    service_price = 0;
                }

                if (count != 0 && old_customer_id != custid) {
                    //count the number of suspended services
                    for (k = 0; k < show_on_app_array.length; k++) {
                        if (!isNullorEmpty(show_on_app_array[k]) && show_on_app_array[k] == 2) {
                            services_suspended++;
                        }
                    }

                    dataSet += '{"cust_id":"' + old_customer_id + '", "entity_id":"' + old_entity_id + '", "company_name":"' + old_company_name + '","scheduled": "' + old_scheduled + '","services_suspended": "' + services_suspended + '",'

                    dataSet += '"services": ['

                    for (var i = 0; i < service_id_array.length; i++) {


                        dataSet += '{';

                        dataSet += '"service_name": "' + service_name_array[i] + '", "service_descp": "' + service_descp_array[i] + '", "freq_count": "' + service_freq_count_array[i] + '", "leg_count": "' + service_leg_count_array[i] + '", "no_of_legs": "' + service_no_of_legs_array[i] + '", "service_price": "' + service_price_array[i] + '", "service_scheduled": "' + service_scheduled_array[i] + '", "show_on_app":"' + show_on_app_array[i] + '","service_id": "' + service_id_array[i] + '"';

                        dataSet += '},'
                    }
                    dataSet = dataSet.substring(0, dataSet.length - 1);
                    dataSet += ']},'

                    customer_count++;

                    service_id_array = [];
                    service_name_array = [];
                    service_descp_array = [];
                    service_price_array = [];
                    service_scheduled_array = [];
                    service_freq_count_array = [];
                    service_leg_count_array = [];
                    service_no_of_legs_array = [];
                    show_on_app_array = [];
                    services_suspended = 0;

                    service_id_array[service_id_array.length] = service_id;
                    service_name_array[service_name_array.length] = service_name;
                    service_descp_array[service_descp_array.length] = service_descp;
                    service_price_array[service_price_array.length] = service_price;
                    service_scheduled_array[service_scheduled_array.length] = service_scheduled;
                    service_freq_count_array[service_freq_count_array.length] = service_leg_freq_count;
                    service_leg_count_array[service_leg_count_array.length] = service_leg_count;
                    service_no_of_legs_array[service_no_of_legs_array.length] = no_of_legs;
                    show_on_app_array[show_on_app_array.length] = show_on_app;

                } else {
                    service_id_array[service_id_array.length] = service_id;
                    service_name_array[service_name_array.length] = service_name;
                    service_descp_array[service_descp_array.length] = service_descp;
                    service_price_array[service_price_array.length] = service_price;
                    service_scheduled_array[service_scheduled_array.length] = service_scheduled;
                    service_freq_count_array[service_freq_count_array.length] = service_leg_freq_count;
                    service_leg_count_array[service_leg_count_array.length] = service_leg_count;
                    service_no_of_legs_array[service_no_of_legs_array.length] = no_of_legs;
                    show_on_app_array[show_on_app_array.length] = show_on_app;

                }

                old_customer_id = custid;
                old_service_id = service_id;
                old_entity_id = entityid;
                old_company_name = companyname;
                old_scheduled = scheduled;

                count++;
                return true;
            });
            console.log("5");

            if (count > 0) {
                dataSet += '{"cust_id":"' + old_customer_id + '", "entity_id":"' + old_entity_id + '", "company_name":"' + old_company_name + '","scheduled": "' + old_scheduled + '","services_suspended": "' + services_suspended + '",'
        
                dataSet += '"services": ['
        
                for (var i = 0; i < service_id_array.length; i++) {
        
        
                    dataSet += '{';
        
                    dataSet += '"service_name": "' + service_name_array[i] + '", "service_descp": "' + service_descp_array[i] + '", "freq_count": "' + service_freq_count_array[i] + '", "leg_count": "' + service_leg_count_array[i] + '", "no_of_legs": "' + service_no_of_legs_array[i] + '", "service_price": "' + service_price_array[i] + '", "service_scheduled": "' + service_scheduled_array[i] + '", "show_on_app":"' + show_on_app_array[i] + '","service_id": "' + service_id_array[i] + '"';
        
                    dataSet += '},'
                }
                dataSet = dataSet.substring(0, dataSet.length - 1);
                dataSet += ']},'
            }
            console.log("6");

            dataSet = dataSet.substring(0, dataSet.length - 1);
            dataSet += ']}';
            console.log(dataSet);
            var parsedData = JSON.parse(dataSet);
            console.log(parsedData.data);
            console.log("7");

            
            // AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');

            //JQuery to sort table based on click of header. Attached library  
            $(document).ready(function() {
                console.log("8");

                table = $("#customer").DataTable({
                    "data": parsedData.data,
                    "columns": [{
                        "orderable": false,
                        "data": null,
                        "defaultContent": '<button type="button" class="details-control form-control btn-xs btn-success " ><span class="span_class glyphicon glyphicon-plus"></span></button>'
                    }, {
                        "data": null,
                        "render": function(data, type, row) {
                            return '<button type="button" data-custid="' + data.cust_id + '" class="edit_customer form-control btn-xs btn-warning " ><span class="span_class glyphicon glyphicon-pencil"></span></button>';
                        }
                    }, {
                        "data": "entity_id"
                    }, {
                        "data": "company_name"
                    }, {
                        "data": null,
                        "defaultContent": ''
                    }, {
                        "data": null,
                        "defaultContent": ''

                    }],
                    "columnDefs": [{

                        "render": function(data, type, row) {
                            if (data.scheduled == 1) {
                                return '<img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25">';
                            }
                        },
                        "targets": [4]
                    }, {
                        "render": function(data, type, row) {
                            if (data.services_suspended == 1) {
                                //return 'All services appear on the app'
                                return '<button type="button" class="form-control btn-xs btn-info" disabled><span style="font-size: large;">' + data.services_suspended + '</span> SUSPENDED SERVICE</button>';
                            } else if (data.services_suspended > 1) {
                                return '<button type="button" class="form-control btn-xs btn-info" disabled><span style="font-size: large;">' + data.services_suspended + '</span> SUSPENDED SERVICES</button>';
                            }
                        },
                        "targets": [5]

                    }],
                    "order": [
                        [1, 'asc']
                    ],
                    "pageLength": 100
                });
            });
            var main_table = document.getElementsByClassName("uir-outside-fields-table");
            var main_table2 = document.getElementsByClassName("uir-inline-tag");

            console.log("9");

            for (var i = 0; i < main_table.length; i++) {
                main_table[i].style.width = "50%";
            }

            for (var i = 0; i < main_table2.length; i++) {
                main_table2[i].style.position = "absolute";
                main_table2[i].style.left = "10%";
                main_table2[i].style.width = "80%";
                main_table2[i].style.top = "275px";
            }
            console.log("10");

            jQuery();
            console.log("11");

        }

        function jQuery() {
            $(document).on('click', '.edit_customer', function() {

                var custid = $(this).attr('data-custid')
                console.log(custid);
                var params = {
                    custid: custid,
                }
                params = JSON.stringify(params);
                var output = redirect.toSuitelet({
                    scriptId: 'customscript_sl_smc_main',
                    deploymentId: 'customdeploy_sl_smc_main',
                });
                var upload_url = baseURL + output + '&unlayered=T&custparam_params=' + params;
                window.open(upload_url, "_blank", "height=750,width=650,modal=yes,alwaysRaised=yes");
            
            });
    
            $('.collapse').on('shown.bs.collapse', function() {
                $("#customer_wrapper").css({
                    "padding-top": "500px"
                });
                $(".admin_section").css({
                    "padding-top": "500px"
                });
            })
            
            $('.collapse').on('hide.bs.collapse', function() {
                $("#customer_wrapper").css({
                    "padding-top": "0px"
                });
                $(".admin_section").css({
                    "padding-top": "0px"
                });
            })
            
            $(document).on('click', '.details-control', function() {
                var tr = $(this).closest('tr');
                var row = table.row(tr);

                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    $(this).removeClass('btn-danger');
                    $(this).addClass('btn-success');
                    $(this).find('.span_class').removeClass('glyphicon-minus');
                    $(this).find('.span_class').addClass('glyphicon-plus');

                } else {
                    // Open this row
                    console.log(row.data());
                    row.child(format(row.data())).show();
                    $(this).addClass('btn-danger');
                    $(this).removeClass('btn-success');
                    $(this).find('.span_class').removeClass('glyphicon-plus');
                    $(this).find('.span_class').addClass('glyphicon-minus');
                }


                $(".row_service").each(function() {
                    if ($(this).find(".setup_service").val() == 'SETUP STOP') {
                        $(this).find(".service_summary").prop('disabled', true);
                    }
                });

                $(function() {
                    $('[data-toggle="tooltip"]').tooltip()
                });
            });


            $(document).on('click', '.setup_service', function() {
                var service_id = $(this).attr('data-serviceid');
                var currentScript = currentRecord.get();
                zee = currentScript.getValue({
                    fieldId: 'zee',
                });
                        
                var params = {
                    serviceid: service_id,
                    scriptid: 'customscript_sl_rp_customer_list',
                    deployid: 'customdeploy_sl_rp_customer_list',
                    zee: zee
                }
                params = JSON.stringify(params);
            
                var output = redirect.toSuitelet({
                    scriptId: 'customscript_sl_rp_create_stops',
                    deploymentId: 'customdeploy_sl_rp_create_stops',
                });
                var upload_url = baseURL + output + '&unlayered=T&custparam_params=' + params;
                window.open(upload_url, "_blank", "height=750,width=650,modal=yes,alwaysRaised=yes");
            });
            
            
            $(document).on('click', '.service_summary', function() {
                console.log('click');

                var header = '<div><h3><label class="control-label">Summary Page</label></h3></div>';
                var body = '';
                var bodyService = '<div /*class="col-sm-4"*/ id="servicedetails"><h3 style="color: rgb(50, 122, 183);">Service Details</h3>'
                var bodyStop = '<div /*class="col col-sm-8"*/ id="stopsdetails"><h3 style="color: rgb(50, 122, 183);">Stops Details</h3>';

                var service_id = $(this).attr('data-serviceid');

                // BodyStop
                var serviceLegSearch = search.load({
                    id: 'customsearch_rp_leg_freq_all',
                    type: 'customrecord_service_leg'
                });

                serviceLegSearch.filters.push(search.createFilter({
                    name: 'internalid',
                    join: 'custrecord_service_leg_service',
                    operator: search.Operator.IS,
                    values: service_id
                }));

                serviceLegSearch.filters.push(search.createFilter({
                    name: 'partner',
                    join: 'CUSTRECORD_SERVICE_LEG_CUSTOMER',
                    operator: search.Operator.IS,
                    values: zee
                }));

                serviceLegSearch.filters.push(search.createFilter({
                    name: 'isinactive',
                    operator: search.Operator.IS,
                    values: 'F'
                }));

                var resultSet = serviceLegSearch.run();
                var old_stop_id;
                var old_freq_id;

                var stop_count = 0;
                var freq_id_count = 0;
                var freq_count = 0;
                var stop_freq_json = '{ "data": [';
                resultSet.each(function(searchResult) {
                    var customer_name = searchResult.getText('custrecord_service_leg_customer');
                    var service = searchResult.getText('custrecord_service_leg_service');
                    var stop_id = searchResult.getValue('internalid');
                    var stop_name = searchResult.getValue('name');
                    var stop_duration = searchResult.getValue('custrecord_service_leg_duration');
                    var stop_notes = searchResult.getValue('custrecord_service_leg_notes');
                    var service_leg_ncl = searchResult.getValue("custrecord_service_leg_non_cust_location");
                    var service_leg_addr_id = searchResult.getValue("custrecord_service_leg_addr");
                    var transfer_type = searchResult.getValue("custrecord_service_leg_trf_type");
                    var transfer_zee = searchResult.getValue("custrecord_service_leg_trf_franchisee");

                    
                    var freq_id = searchResult.getValue({
                        name: 'internalid',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    

                    var operation_zee = searchResult.getValue("custrecord_service_leg_franchisee");
                    var operation_zee_name = searchResult.getText("custrecord_service_leg_franchisee");

                    var freq_mon = searchResult.getValue({
                        name: 'custrecord_service_freq_day_mon',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    
                    var freq_tue = searchResult.getValue({
                        name: 'custrecord_service_freq_day_tue',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    
                    var freq_wed = searchResult.getValue({
                        name: 'custrecord_service_freq_day_wed',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    
                    var freq_thu = searchResult.getValue({
                        name: 'custrecord_service_freq_day_thu',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    
                    var freq_fri = searchResult.getValue({
                        name: 'custrecord_service_freq_day_fri',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    
                    var freq_adhoc = searchResult.getValue({
                        name: 'custrecord_service_freq_day_adhoc',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    
                    var freq_time_current = searchResult.getValue({
                        name: 'custrecord_service_freq_time_current',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    
                    var freq_time_start = searchResult.getValue({
                        name: 'custrecord_service_freq_time_start',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    
                    var freq_time_end = searchResult.getValue({
                        name: 'custrecord_service_freq_time_end',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    
                    var freq_run_plan = searchResult.getText({
                        name: 'custrecord_service_freq_run_plan',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    

                    if (stop_count == 0) {
                        stop_freq_json += '{"customer_name": "' + customer_name + '",';
                        stop_freq_json += '"service": "' + service + '",';
                        stop_freq_json += '"stop_id": "' + stop_id + '",';
                        stop_freq_json += '"stop_name": "' + stop_name + '",';
                        stop_freq_json += '"stop_duration": "' + stop_duration + '",';
                        stop_freq_json += '"stop_notes": "' + stop_notes + '",';
                        stop_freq_json += '"stop_ncl_id": "' + service_leg_ncl + '",';
                        stop_freq_json += '"stop_addr_id": "' + service_leg_addr_id + '",';
                        stop_freq_json += '"transfer_type": "' + transfer_type + '",';
                        stop_freq_json += '"transfer_zee": "' + transfer_zee + '",';
                        stop_freq_json += '"operation_zee": "' + operation_zee + '",';
                        stop_freq_json += '"operation_zee_name": "' + operation_zee_name + '",';
                        stop_freq_json += '"stop_freq": [';
                        stop_freq_json += '{"freq_id": "' + freq_id + '",';
                        stop_freq_json += '"freq_mon": "' + freq_mon + '",';
                        stop_freq_json += '"freq_tue": "' + freq_tue + '",';
                        stop_freq_json += '"freq_wed": "' + freq_wed + '",';
                        stop_freq_json += '"freq_thu": "' + freq_thu + '",';
                        stop_freq_json += '"freq_fri": "' + freq_fri + '",';
                        stop_freq_json += '"freq_adhoc": "' + freq_adhoc + '",';
                        stop_freq_json += '"freq_time_current": "' + freq_time_current + '",';
                        stop_freq_json += '"freq_time_start": "' + freq_time_start + '",';
                        stop_freq_json += '"freq_time_end": "' + freq_time_end + '",';
                        stop_freq_json += '"freq_run_plan": "' + freq_run_plan + '"},';
                    } else {
                        if (old_stop_id == stop_id && old_freq_id == freq_id) {
                            stop_freq_json += '{"freq_id": "' + freq_id + '",';
                            stop_freq_json += '"freq_mon": "' + freq_mon + '",';
                            stop_freq_json += '"freq_tue": "' + freq_tue + '",';
                            stop_freq_json += '"freq_wed": "' + freq_wed + '",';
                            stop_freq_json += '"freq_thu": "' + freq_thu + '",';
                            stop_freq_json += '"freq_fri": "' + freq_fri + '",';
                            stop_freq_json += '"freq_adhoc": "' + freq_adhoc + '",';
                            stop_freq_json += '"freq_time_current": "' + freq_time_current + '",';
                            stop_freq_json += '"freq_time_start": "' + freq_time_start + '",';
                            stop_freq_json += '"freq_time_end": "' + freq_time_end + '",';
                            stop_freq_json += '"freq_run_plan": "' + freq_run_plan + '"},';
                        } else if (old_stop_id == stop_id && old_freq_id != freq_id) {
                            stop_freq_json += '{"freq_id": "' + freq_id + '",';
                            stop_freq_json += '"freq_mon": "' + freq_mon + '",';
                            stop_freq_json += '"freq_tue": "' + freq_tue + '",';
                            stop_freq_json += '"freq_wed": "' + freq_wed + '",';
                            stop_freq_json += '"freq_thu": "' + freq_thu + '",';
                            stop_freq_json += '"freq_fri": "' + freq_fri + '",';
                            stop_freq_json += '"freq_adhoc": "' + freq_adhoc + '",';
                            stop_freq_json += '"freq_time_current": "' + freq_time_current + '",';
                            stop_freq_json += '"freq_time_start": "' + freq_time_start + '",';
                            stop_freq_json += '"freq_time_end": "' + freq_time_end + '",';
                            stop_freq_json += '"freq_run_plan": "' + freq_run_plan + '"},';

                        } else if (old_stop_id != stop_id) {
                            stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                            stop_freq_json += ']},';

                            freq_id_count = 0;

                            stop_freq_json += '{"customer_name": "' + customer_name + '",';
                            stop_freq_json += '"service": "' + service + '",';
                            stop_freq_json += '"stop_id": "' + stop_id + '",';
                            stop_freq_json += '"stop_name": "' + stop_name + '",';
                            stop_freq_json += '"stop_duration": "' + stop_duration + '",';
                            stop_freq_json += '"stop_notes": "' + stop_notes + '",';
                            stop_freq_json += '"stop_ncl_id": "' + service_leg_ncl + '",';
                            stop_freq_json += '"stop_addr_id": "' + service_leg_addr_id + '",';
                            stop_freq_json += '"transfer_type": "' + transfer_type + '",';
                            stop_freq_json += '"transfer_zee": "' + transfer_zee + '",';
                            stop_freq_json += '"operation_zee": "' + operation_zee + '",';
                            stop_freq_json += '"operation_zee_name": "' + operation_zee_name + '",';
                            stop_freq_json += '"stop_freq": [';
                            stop_freq_json += '{"freq_id": "' + freq_id + '",';
                            stop_freq_json += '"freq_mon": "' + freq_mon + '",';
                            stop_freq_json += '"freq_tue": "' + freq_tue + '",';
                            stop_freq_json += '"freq_wed": "' + freq_wed + '",';
                            stop_freq_json += '"freq_thu": "' + freq_thu + '",';
                            stop_freq_json += '"freq_fri": "' + freq_fri + '",';
                            stop_freq_json += '"freq_adhoc": "' + freq_adhoc + '",';
                            stop_freq_json += '"freq_time_current": "' + freq_time_current + '",';
                            stop_freq_json += '"freq_time_start": "' + freq_time_start + '",';
                            stop_freq_json += '"freq_time_end": "' + freq_time_end + '",';
                            stop_freq_json += '"freq_run_plan": "' + freq_run_plan + '"},';

                        }
                    }

                    //console.log('stop_freq_json', stop_freq_json);

                    old_stop_id = stop_id;
                    old_freq_id = freq_id;
                    stop_count++;
                    freq_id_count++;
                    return true;
                });

                if (freq_id_count > 0) {
                    stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                    stop_freq_json += ']}';
                    stop_freq_json += ']}';
                } else {
                    stop_freq_json += ']}';
                }

                console.log('stop_freq_json', stop_freq_json);
                var parsedStopFreq = JSON.parse(stop_freq_json);
                var obj = parsedStopFreq.data[0];
                console.log('obj', obj);
                var frequency = '';

                bodyStop += '<ol class="list-group">';
                console.log('parsedStopFreq.data.length', parsedStopFreq.data.length);
                for (var i = 0; i < parsedStopFreq.data.length; i++) {
                    var freq_array = [null, null, null, null, null, null];
                    var obj = parsedStopFreq.data[i];
                    //console.log('obj_i', obj);
                    bodyStop += '<li><h5>' + obj['stop_name'] + '<span style="font-style:oblique; color:gray; font-size: x-small;"> ' + obj['operation_zee_name'] + '</span></h5>';
                    var obj_freq = obj['stop_freq'];
                    for (y = 0; y < obj_freq.length; y++) {
                        if (obj_freq[y]['freq_mon'] == 'T') {
                            var warning = '';
                            if (!isNullorEmpty(freq_array[0])) {
                                warning = '<em style="color: red;">WARNING : Duplicates</em>';
                            }
                            freq_array[0] = '<strong>Mon : </strong>' + obj_freq[y]['freq_time_current'] + ' - ' + obj_freq[y]['freq_run_plan'] + ' ' + warning + '</br>';

                        }
                        if (obj_freq[y]['freq_tue'] == 'T') {
                            var warning = '';
                            if (!isNullorEmpty(freq_array[1])) {
                                warning = '<em style="color: red;">WARNING : Duplicates</em>';
                            }
                            freq_array[1] = '<strong>Tue : </strong>' + obj_freq[y]['freq_time_current'] + ' - ' + obj_freq[y]['freq_run_plan'] + ' ' + warning + '</br>';
                        }
                        if (obj_freq[y]['freq_wed'] == 'T') {
                            var warning = '';
                            if (!isNullorEmpty(freq_array[2])) {
                                warning = '<em style="color: red;">WARNING : Duplicates</em>';
                            }
                            freq_array[2] = '<strong>Wed : </strong>' + obj_freq[y]['freq_time_current'] + ' - ' + obj_freq[y]['freq_run_plan'] + ' ' + warning + '</br>';
                        }
                        if (obj_freq[y]['freq_thu'] == 'T') {
                            var warning = '';
                            if (!isNullorEmpty(freq_array[3])) {
                                warning = '<em style="color: red;">WARNING : Duplicates</em>';
                            }
                            freq_array[3] = '<strong>Thu : </strong>' + obj_freq[y]['freq_time_current'] + ' - ' + obj_freq[y]['freq_run_plan'] + ' ' + warning + '</br>';
                        }
                        if (obj_freq[y]['freq_fri'] == 'T') {
                            var warning = '';
                            if (!isNullorEmpty(freq_array[4])) {
                                warning = '<em style="color: red;">WARNING : Duplicates</em>';
                            }
                            freq_array[4] = '<strong>Fri : </strong>' + obj_freq[y]['freq_time_current'] + ' - ' + obj_freq[y]['freq_run_plan'] + ' ' + warning + '</br>';
                        }
                        if (obj_freq[y]['freq_adhoc'] == 'T') {
                            var warning = '';
                            if (!isNullorEmpty(freq_array[5])) {
                                warning = '<em style="color: red;">WARNING : Duplicates</em>';
                            }
                            freq_array[5] = '<strong>ADHOC : </strong>' + obj_freq[y]['freq_time_current'] + ' - ' + obj_freq[y]['freq_run_plan'] + ' ' + warning + '</br>';
                        }
                    }
                    for (k = 0; k < 6; k++) {
                        if (!isNullorEmpty(freq_array[k])) {
                            bodyStop += freq_array[k];
                        }
                    }
                    bodyStop += '<div class="stopinfo" style="color: gray;padding-top: 5px;">';
                    bodyStop += '<div><strong>Stop duration : </strong>' + obj['stop_duration'] + 's<div>';
                    if (!isNullorEmpty(obj['stop_notes'])) {
                        bodyStop += '<div style="word-break: normal;"><strong> Notes :</strong> ' + obj['stop_notes'] + '</div>';
                    }
                    bodyStop += '</div>';
                    bodyStop += '</li>';


                }
                bodyStop += '</ol>';
                bodyStop += '</div>';

                bodyService += '<div style="font-size: medium;"><ul style="list-style: none;"><li style="padding-top: 5px;"><span class="glyphicon glyphicon-user"></span>  ' + obj['customer_name'] + '</li><li style="padding-top: 5px;"><span class="glyphicon glyphicon-list-alt"></span>  ' + obj['service'] + '</li><li style="padding-top: 5px;">'

                bodyService += '</div></div>';

                body += bodyService;
                body += bodyStop;


                $('#myModal .modal-header').html(header);
                $('#myModal .modal-body').html("");
                $('#myModal .modal-body').html(body);
                $('#myModal').modal("show");

            });

            $(document).on("click", ".show_app", function(e) {
                var service_id = $(this).attr('data-serviceid');
                inactivate_id_array[inactivate_id_array.length] = service_id;
                console.log('inactivate service_id', service_id);
                $(this).prop('disabled', true);
            });
    
            
            //On selecting zee, reload the SMC - Summary page with selected Zee parameter
            $(document).on("change", ".zee_dropdown", function(e) {
    
                var zee = $(this).val();
    
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=735&deploy=1&compid=1048144";
                if (runtime.EnvType == "SANDBOX") {
                    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=735&deploy=1";
    
                }
                console.log('baseURL', baseURL);
                console.log('url', url);
    
                url += "&zee=" + zee + "";
                console.log('url', url);
                window.location.href = url;
            });
    
    
            $(document).on("click", ".remove_service", function(e) {
                if (confirm('Are you sure you want to remove this service from run?\n\nThis action cannot be undone.')) {
                    var service_id = $(this).attr('data-serviceid');
                    remove_id_array[remove_id_array.length] = service_id;
                    console.log('remove service_id', service_id);
                    $(this).prop('disabled', true);
                }
            
            
            });

        }
        

        
        function onclick_back() {
            var params = {

            }
            params = JSON.stringify(params);
            var currentScript = currentRecord.get();
            var zeeVal = currentScript.getValue({
                fieldId: 'zee',
            });
            var output = redirect.toSuitelet({
                scriptId: 'customscript_sl_full_calendar',
                deploymentId: 'customdeploy_sl_full_calender',
            });
            var upload_url = baseURL + output + '&unlayered=T&zee=' + parseInt(zeeVal) + '&custparam_params=' + params;
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
        }


        function saveRecord(context) {
            var currentScript = currentRecord.get();

            console.log('remove_id_array', remove_id_array);
            console.log('inactivate_id_array', inactivate_id_array);
            var remove_id_string = remove_id_array.join();
            var inactivate_id_string = inactivate_id_array.join();
            currentScript.setValue({
                fieldId: 'custpage_remove_service',
                value: remove_id_string,
            });

            currentScript.setValue({
                fieldId: 'custpage_inactivate_service',
                value: inactivate_id_string,
            });
            console.log("12");

            return true;
        }

        

        function format(index) {
            console.log('index.cust_id', index.cust_id);
            var html = '<table class="table table-responsive" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
        
            $.each(index.services, function(i, service) {
                console.log('service', service);
                if (i == 0) {
                    html += '<thead><tr style="color:white;background-color: grey;" data-custid = "' + index.cust_id + '"><th style="text-align: center;"></th><th style="text-align: center;">Service Name</th><th style="text-align: center;">Description</th><th style="text-align: center;">Price</th><th class="col-sm-4" style="text-align: center;">Action</th></tr></thead>';
                }
                html += '<tr class="row_service">'
                html += '<td><button type="button" class="form-control btn-xs btn-secondary service_summary" data-toggle="modal" data-target="#myModal" data-serviceid="' + service.service_id + '"><span class="glyphicon glyphicon-eye-open"></span></button></td>';
                var no_of_legs;
                var service_leg_count;
                var service_leg_count_active;
                var service_freq_count;
                var service_freq_count_active;
                var count = 0;
                var service_scheduled;
                var show_on_app;
                $.each(service, function(key, value) {
                    if (key == "leg_count") {
                        service_leg_count = parseInt(value);
                    }
        
                    if (key == "freq_count") {
                        service_freq_count = parseInt(value);
                    }
        
                    if (key == "no_of_legs") {
                        no_of_legs = parseInt(value);
                    }
        
                    if (key == "service_scheduled") {
                        service_scheduled = value;
                        console.log('service_scheduled', service_scheduled);
                    }
        
                    if (key == "show_on_app") {
                        show_on_app = value;
                        console.log('show_on_app', show_on_app);
                    }
        
                    console.log(key)
        
                    service_leg_count_active = service_leg_count;
                    service_freq_count_active = service_freq_count;
        
                    if (key == "service_id") {
                        //html += '<td><button type="button" class="form-control btn-xs btn-secondary service_summary" data-toggle="modal" data-target="#myModal" data-serviceid="' + value + '"><span class="glyphicon glyphicon-eye-open"></span></button></td>';
                        if (service_scheduled == 1) {
                            html += '<td style="text-align: center;"><div class="col-sm-4"><input type="button" class="form-control btn-xs btn-primary setup_service" data-serviceid="' + value + '" value="EDIT STOP" /></div><div class="col-sm-4"><input type="button" class="form-control btn-xs btn-danger remove_service" data-serviceid="' + value + '" style="white-space: normal;" value="DELETE STOP" /></div>';
                            if (show_on_app == 2) {
                                html += '<div class="col-sm-4"><input type="button" data-toggle="tooltip" data-placement="right" title="If you activate that service it will appear on the app" class="form-control btn-xs btn-secondary show_app" data-serviceid="' + value + '" value="ACTIVATE" /></div></td>';
                            } else {
                                html += '<div class="col-sm-4"><input type="button" data-toggle="tooltip" data-placement="right" title="If you inactivate that service it will no longer appear on the app" class="form-control btn-xs btn-secondary show_app" data-serviceid="' + value + '" value="INACTIVATE" /></div></td>';
                            }
        
                        } else if (service_scheduled == 2) {
                            html += '<td style="text-align: center;"><div class="col-sm-3"></div><div class="col-sm-6"><input type="button" class="form-control btn-xs btn-danger setup_service" data-serviceid="' + value + '" value="SETUP STOP" /></div></td>';
                        } else {
                            html += '<td style="text-align: center;"><div class="col-sm-3"></div><div class="col-sm-6"><input type="button" class="form-control btn-xs btn-danger setup_service" data-serviceid="' + value + '" value="SETUP STOP" /></div></td>';
                        }
                    } else if (key == "freq_count" || key == "leg_count" || key == "no_of_legs" || key == "service_scheduled" || key == "show_on_app") {
        
                    } else {
                        html += '<td style="text-align: center;">' + value + '</td>';
                    }
        
                });
                html += '</tr>';
        
        
            });
        
        
            html += '</table>';
        
            return html;
        
        }
        
        
        
        
        
        /**
         * [AddJavascript description] - Add the JS to the postion specified in the page.
         * @param {[type]} jsname [description]
         * @param {[type]} pos    [description]
         */
        function AddJavascript(jsname, pos) {
            var tag = document.getElementsByTagName(pos)[0];
            var addScript = document.createElement('script');
            addScript.setAttribute('type', 'text/javascript');
            addScript.setAttribute('src', jsname);
            tag.appendChild(addScript);
        }

        /**
         * [AddStyle description] - Add the CSS to the position specified in the page
         * @param {[type]} cssLink [description]
         * @param {[type]} pos     [description]
         */
        function AddStyle(cssLink, pos) {
            var tag = document.getElementsByTagName(pos)[0];
            var addLink = document.createElement('link');
            addLink.setAttribute('type', 'text/css');
            addLink.setAttribute('rel', 'stylesheet');
            addLink.setAttribute('href', cssLink);
            tag.appendChild(addLink);
        }

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            
        };  
    }

    
);