/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * 
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2017-08-03 16:59:04 Ankith 
 *
 * Remarks: Page to show the list of all the customers based on the franchisee. To convert all the items listed in the financial tab into service records. Ability for the franchisee to cancel a customer as well.        
 * 
 * @Last Modified by:   ankith.ravindran
 * @Last Modified time: 2019-05-07 10:55:07
 *
 */

 define(['require', 'dependency'], 
    function(require, factory) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (nlapiGetContext().getEnvironment() == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        var table;

        var currRecord = currentRecord.get();

        function pageInit(){
            //Search: RP - Service Setup
            var serviceSetupSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch2971');

            var addFilterExpression = new nlobjSearchFilter('custrecord_service_leg_franchisee', null, 'anyof', nlapiGetFieldValue('zee'));
            serviceSetupSearch.addFilter(addFilterExpression);

            var resultSetStops = serviceSetupSearch.runSearch();

            var serviceSetupSearch = search.load({
                id: 'customsearch2971',
                type: 'customrecord_service_leg'
            });
            var addFilterExpression = search.createFilter({
                name: 'custrecord_service_leg_franchisee',
                join: null,
                operator: search.Operator.ANYOF,
                values: currRecord.getValue({
                    fieldId: zee
                })
            });
            serviceSetupSearch.filters.push(serviceSetupSearch);
            var serviceSetupSearch = serviceSetupSearch.run();

            var old_service_leg_id;
            var old_service_leg_name;
            var old_service_time;
            var old_run_plan;
            var old_run_plan_id;

            var count = 0;

            var reviewed = false;

            var dataSet = '{"data":[';

            resultSetStops.each(function(searchResult) {
                // var service_leg_id = searchResult.getValue("internalid", null, "GROUP");
                // var service_leg_name = searchResult.getValue("name", null, "GROUP");
                // var service_freq_service_time = searchResult.getValue("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                // var service_freq_run_plan = searchResult.getText("custrecord_service_freq_run_plan", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                // var service_freq_run_plan_id = searchResult.getValue("custrecord_service_freq_run_plan", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
                var service_leg_id = searchResult.getValue({ name: 'internalid', summary: search.Summary.GROUP})
                var service_leg_name = searchResult.getValue({ name: 'name', summary: search.Summary.GROUP})
                var service_freq_service_time = searchResult.getValue({ name: "custrecord_service_freq_time_current", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP})
                var service_freq_run_plan = searchResult.getText({ name: "custrecord_service_freq_run_plan", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP})
                var service_freq_run_plan_id = searchResult.getValue({ name: "custrecord_service_freq_run_plan", join: "CUSTRECORD_SERVICE_FREQ_STOP", summary: search.Summary.GROUP})

                if (count != 0 && old_service_leg_name != service_leg_name) {
                    dataSet += '{"service_leg_id":"' + old_service_leg_id + '","service_leg_name":"' + old_service_leg_name + '", "service_time":"' + old_service_time + '","run_plan": "' + old_run_plan + '","run_plan_id": "' + old_run_plan_id + '"},';
                } else {
                    if (count != 0 && old_service_time != service_freq_service_time) {
                        dataSet += '{"service_leg_id":"' + old_service_leg_id + '","service_leg_name":"' + old_service_leg_name + '", "service_time":"' + old_service_time + '","run_plan": "' + old_run_plan + '","run_plan_id": "' + old_run_plan_id + '"},';
                    } else if (count != 0 && old_run_plan != service_freq_run_plan) {
                        dataSet += '{"service_leg_id":"' + old_service_leg_id + '","service_leg_name":"' + old_service_leg_name + '", "service_time":"' + old_service_time + '","run_plan": "' + old_run_plan + '","run_plan_id": "' + old_run_plan_id + '"},';
                    }
                }

                old_service_leg_id = service_leg_id;
                old_service_leg_name = service_leg_name;
                old_service_time = service_freq_service_time;
                old_run_plan = service_freq_run_plan;
                old_run_plan_id = service_freq_run_plan_id;

                count++;
                return true;
            });

            if (count > 0) {
                dataSet += '{"service_leg_id":"' + old_service_leg_id + '","service_leg_name":"' + old_service_leg_name + '", "service_time":"' + old_service_time + '","run_plan": "' + old_run_plan + '"},';
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
                        "data": null,
                        "render": function(data, type, row) {
                            return '<button type="button" data-legid="' + data.service_leg_id + '" data-legname="' + data.service_leg_name + '" data-servicetime="' + data.service_time + '" data-run="' + data.run_plan_id + '" class="edit_customer form-control btn-xs btn-warning " ><span class="span_class glyphicon glyphicon-pencil"></span></button>';
                        }
                    }, {
                        "data": "service_leg_name"
                    }, {
                        "data": "service_time"
                    }, {
                        "data": "run_plan"
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

        function jQuery(){
            //To show loader while the page is laoding
            $(window).load(function() {
                // Animate loader off screen
                $(".se-pre-con").fadeOut("slow");;
            });

            $(document).on('click', '.edit_customer', function() {
                var zee = parseInt(nlapiGetFieldValue('zee'))
                var legid = $(this).attr('data-legid');
                var legname = $(this).attr('data-legname');
                var servicetime = $(this).attr('data-servicetime');
                var run = $(this).attr('data-run');
            
                var params = {
                    legid: legid,
                    servicetime: servicetime,
                    run: run,
                    zee: zee
                }
                params = JSON.stringify(params);
            
                var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_setup_stops', 'customdeploy_sl_setup_stops') + '&unlayered=T&custparam_params=' + params;
                window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
            
            });
            
            $(document).on('click', '.instruction_button', function() {
                $("#customer_wrapper").css({
                    "padding-top": "400px"
                });
                $(".admin_section").css({
                    "padding-top": "400px"
                });
            });

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
            
                zee = nlapiGetFieldValue('zee');
            
                var params = {
                    serviceid: service_id,
                    scriptid: 'customscript_sl_rp_customer_list',
                    deployid: 'customdeploy_sl_rp_customer_list',
                    zee: zee
                }
                params = JSON.stringify(params);
            
                var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_rp_create_stops', 'customdeploy_sl_rp_create_stops') + '&unlayered=T&custparam_params=' + params;
                window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
            });

            //On selecting zee, reload the SMC - Summary page with selected Zee parameter
            $(document).on("change", ".zee_dropdown", function(e) {

                var zee = $(this).val();

                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=846&deploy=1";

                url += "&zee=" + zee + "";

                window.location.href = url;
            });
        }

        function onclick_back() {
            var params = {}
            params = JSON.stringify(params);
            // var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar', 'customdeploy_sl_full_calender') + '&unlayered=T&zee=' + parseInt(nlapiGetFieldValue('zee')) + '&custparam_params=' + params;
            // window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
            
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_sl_full_calender',
                scriptId: 'customscript_sl_full_calendar'
            }) + '&unlayered=T&zee=' + parseInt(currRecord.getValue({fieldId: 'zee'})) + '&custparam_params=' + params;
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
                        service_leg_count = value;
                    }
        
                    if (key == "no_of_legs") {
                        no_of_legs = value;
                    }
        
                    console.log(key);
        
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

        return {
            pageInit: pageInit
        }
});