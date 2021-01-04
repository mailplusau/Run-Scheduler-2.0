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
        //To show loader while the page is laoding
        
        
        var table;
        /**
         * [pageInit description] - On page initialization, load the Dynatable CSS and sort the table based on the customer name and align the table to the center of the page. 
         */
        function pageInit() {
            $(window).load(function() {
                // Animate loader off screen
                $(".se-pre-con").fadeOut("slow");;
            });

            console.log(document.getElementsByClassName('instruction_button'));

            //Search: RP - Services
            var serviceSearch = search.load({
                id: 'customsearch_rp_services',
                type: 'customrecord_service'
            });
            
            var currRecord = currentRecord.get();
            var zeeVal = currRecord.getValue({
                fieldId: 'zee'
            });

            serviceSearch.filters.push(search.createFilter({
                name: 'custrecord_service_franchisee',
                operator: search.Operator.ANYOF,
                values: zeeVal
            }));

            
        
            var resultSetCustomer = serviceSearch.run();
            var old_customer_id;
            var old_service_id;
            var old_entity_id;
            var old_company_name;
        
            var count = 0;
            var customer_count = 0;
        
            var service_id_array = [];
            var service_name_array = [];
            var service_descp_array = [];
            var service_price_array = [];
            var service_freq_count_array = [];
            var service_leg_count_array = [];
            var service_no_of_legs_array = [];
        
            var reviewed = false;
        
            var dataSet = '{"data":[';

            
            resultSetCustomer.each(function(searchResult) {

                var custid = searchResult.getValue({ name: "custrecord_service_customer", join: null, summary: search.Summary.GROUP});
                
                var entityid = searchResult.getValue({ name: "entityid", join: "CUSTRECORD_SERVICE_CUSTOMER", summary: search.Summary.GROUP});
                
                var companyname = searchResult.getValue({ name: "companyname", join: "CUSTRECORD_SERVICE_CUSTOMER", summary: search.Summary.GROUP});
                
                var service_id = searchResult.getValue({ name: "internalid", join: null, summary: search.Summary.GROUP});
                
                var service_name = searchResult.getText({ name: "custrecord_service", join: null, summary: search.Summary.GROUP});
                
                var service_descp = searchResult.getValue({ name: "custrecord_service_description", join: null, summary: search.Summary.GROUP});
                
                var service_price = searchResult.getValue({ name: "custrecord_service_price", join: null, summary: search.Summary.GROUP});
                
                var service_leg_freq_count = searchResult.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_FREQ_SERVICE", summary: search.Summary.COUNT});
                
                var service_leg_count = searchResult.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_LEG_SERVICE", summary: search.Summary.COUNT});
                
                var no_of_legs = searchResult.getValue({ name: "custrecord_service_type_leg_no", join: "CUSTRECORD_SERVICE", summary: search.Summary.GROUP});
                
                if (count != 0 && old_customer_id != custid) {


                    dataSet += '{"cust_id":"' + old_customer_id + '", "entity_id":"' + old_entity_id + '", "company_name":"' + old_company_name + '","reviewed": "' + reviewed + '",'

                    dataSet += '"services": ['

                    for (var i = 0; i < service_id_array.length; i++) {


                        dataSet += '{';

                        dataSet += '"service_name": "' + service_name_array[i] + '", "service_descp": "' + service_descp_array[i] + '", "freq_count": "' + service_freq_count_array[i] + '", "leg_count": "' + service_leg_count_array[i] + '", "no_of_legs": "' + service_no_of_legs_array[i] + '", "service_price": "' + service_price_array[i] + '","service_id": "' + service_id_array[i] + '"'

                        dataSet += '},'
                    }
                    dataSet = dataSet.substring(0, dataSet.length - 1);
                    dataSet += ']},'

                    customer_count++;

                    service_id_array = [];
                    service_name_array = [];
                    service_descp_array = [];
                    service_price_array = [];
                    service_freq_count_array = [];
                    service_leg_count_array = [];
                    service_no_of_legs_array = [];

                    reivewed = false;

                    service_id_array[service_id_array.length] = service_id;
                    service_name_array[service_name_array.length] = service_name;
                    service_descp_array[service_descp_array.length] = service_descp;
                    service_price_array[service_price_array.length] = service_price;
                    service_freq_count_array[service_freq_count_array.length] = service_leg_freq_count;
                    service_leg_count_array[service_leg_count_array.length] = service_leg_count;
                    service_no_of_legs_array[service_no_of_legs_array.length] = no_of_legs;

                    if (service_leg_freq_count == service_leg_count && service_leg_count == no_of_legs) {
                        reviewed = true;
                    } else {
                        reviewed = false;
                    }
                } else {
                    service_id_array[service_id_array.length] = service_id;
                    service_name_array[service_name_array.length] = service_name;
                    service_descp_array[service_descp_array.length] = service_descp;
                    service_price_array[service_price_array.length] = service_price;
                    service_freq_count_array[service_freq_count_array.length] = service_leg_freq_count;
                    service_leg_count_array[service_leg_count_array.length] = service_leg_count;
                    service_no_of_legs_array[service_no_of_legs_array.length] = no_of_legs;
                    if (service_leg_freq_count == service_leg_count && service_leg_count == no_of_legs) {
                        reviewed = true;
                    } else {
                        reviewed = false;
                    }
                }

                old_customer_id = custid;
                old_service_id = service_id;
                old_entity_id = entityid;
                old_company_name = companyname;

                count++;
                return true;
            });

            if (count > 0) {
                dataSet += '{"cust_id":"' + old_customer_id + '", "entity_id":"' + old_entity_id + '", "company_name":"' + old_company_name + '","reviewed": "' + reviewed + '",'
        
                dataSet += '"services": ['
        
                for (var i = 0; i < service_id_array.length; i++) {
        
        
                    dataSet += '{';
        
                    dataSet += '"service_name": "' + service_name_array[i] + '", "service_descp": "' + service_descp_array[i] + '", "freq_count": "' + service_freq_count_array[i] + '", "leg_count": "' + service_leg_count_array[i] + '", "no_of_legs": "' + service_no_of_legs_array[i] + '", "service_price": "' + service_price_array[i] + '","service_id": "' + service_id_array[i] + '"'
        
                    dataSet += '},'
                }
                dataSet = dataSet.substring(0, dataSet.length - 1);
                dataSet += ']},'
            }
        
            dataSet = dataSet.substring(0, dataSet.length - 1);
            dataSet += ']}';
            var parsedData = JSON.parse(dataSet);
            console.log(parsedData.data);


            // AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');

            //JQuery to sort table based on click of header. Attached library  
            $(document).ready(function() {
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
                    }, ],
                    "columnDefs": [{

                        "render": function(data, type, row) {
                            if (data.reviewed == 'true') {
                                return '<img src="https://1048144.app.netsuite.com/core/media/media.nl?id=1990778&c=1048144&h=e7f4f60576de531265f7" height="25" width="25">';
                            }
                        },
                        "targets": [4]
                    }],
                    "order": [
                        [1, 'asc']
                    ],
                    "pageLength": 100
                });
            });
            var main_table = document.getElementsByClassName("uir-outside-fields-table");
            var main_table2 = document.getElementsByClassName("uir-inline-tag");


            for (var i = 0; i < main_table.length; i++) {
                main_table[i].style.width = "50%";
            }

            for (var i = 0; i < main_table2.length; i++) {
                main_table2[i].style.position = "absolute";
                main_table2[i].style.left = "10%";
                main_table2[i].style.width = "80%";
                main_table2[i].style.top = "275px";
            }

            jQuery();
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
                    deploymentId: 'customdeploy_sl_smc_main'
                });
                var upload_url = baseURL + output + '&unlayered=T&custparam_params=' + params;
                window.open(upload_url, "_blank", "height=750,width=650,modal=yes,alwaysRaised=yes");
            
            });
    
            $('.collapse').on('shown.bs.collapse', function() {
                $("#customer_wrapper").css({
                    "padding-top": "300px"
                });
                $(".admin_section").css({
                    "padding-top": "300px"
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
            });
    
            $(document).on('click', '.setup_service', function() {
                var service_id = $(this).attr('data-serviceid');
                var currRecord = currentRecord.get();
                zee = currRecord.getValue({
                    fieldId: 'zee'
                });
            
                var params = {
                    serviceid: service_id,
                    scriptid: 'customscript_sl_rp_customer_list_test',
                    deployid: 'customdeploy_sl_rp_customer_list_test',
                    zee: zee
                }
                params = JSON.stringify(params);
                var output = redirect.toSuitelet({
                    scriptId: 'customscript_sl_rp_create_stops_test',
                    deploymentId: 'customdeploy_sl_rp_create_stops_test',
                });
    
                var upload_url = baseURL + '&unlayered=T&custparam_params=' + params;
                window.open(upload_url, "_blank", "height=750,width=650,modal=yes,alwaysRaised=yes");
            });

             //On selecting zee, reload the SMC - Summary page with selected Zee parameter
            $(document).on("change", ".zee_dropdown", function(e) {

                var zee = $(this).val();

                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=921&deploy=1&compid=1048144";

                url += "&zee=" + zee + "";

                window.location.href = url;
            });
    
        }
        

       
        function onclick_back() {
            var params = {

            }
            params = JSON.stringify(params);

            var output = redirect.toSuitelet({
                scriptId: 'customscript_sl_full_calendar_test',
                deploymentId: 'customdeploy_sl_full_calendar_test',
            });

            var currRecord = currentRecord.get();
            var zeeVal = currRecord.getValue({
                fieldId: 'zee'
            });
            var upload_url = baseURL + output + '&unlayered=T&zee=' + parseInt(zeeVal) + '&custparam_params=' + params;
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
        }

        

        function format(index) {
            // var json_data = data[parseInt(index)];
            var html = '<table class="table table-responsive" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
        
            $.each(index.services, function(i, service) {
                if (i == 0) {
                    html += '<thead><tr style="color:white;background-color: grey;"><th style="text-align: center;">Service Name</th><th style="text-align: center;">Description</th><th style="text-align: center;">Price</th><th style="text-align: center;">Action</th></tr></thead>';
                }
                html += '<tr>';
                var no_of_legs;
                var service_leg_count;
                $.each(service, function(key, value) {
        
                    if (key == "leg_count") {
                        service_leg_count = parseInt(value);
                    }
        
                    if (key == "no_of_legs") {
                        no_of_legs = parseInt(value);
                    }
        
                    console.log(key)
        
                    if (key == "service_id") {
                        if (service_leg_count >= no_of_legs) {
                            html += '<td style="text-align: center;"><input type="button" class="form-control btn-xs btn-primary setup_service" data-serviceid="' + value + '" value="EDIT STOP" /></td>';
                        } else {
                            html += '<td style="text-align: center;"><input type="button" class="form-control btn-xs btn-danger setup_service" data-serviceid="' + value + '" value="SETUP STOP" /></td>';
                        }
        
                    } else if (key == "freq_count" || key == "leg_count" || key == "no_of_legs") {
        
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
            
        };  
    }

    
);