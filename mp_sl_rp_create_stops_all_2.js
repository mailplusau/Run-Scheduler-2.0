/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 * Module Description
 * 
 * NSVersion    Date            			Author         
 * 1.00       	2019-03-04 16:53:48   		ankith.ravindran
 *
 * Description: Ability to setup a stop and link all customers per service to that stop.          
 * 
 * @Last Modified by:   ankith.ravindran
 * @Last Modified time: 2019-05-07 10:56:51
 *
 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
function(ui, email, runtime, search, record, http, log, redirect, format) {
    var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        var ctx = runtime.getCurrentScript();

        var zee = 0;
        var role = runtime.getCurrentUser().role;

        var deleted_service_ids = [];
        var deleted_job_ids = [];
        var add_row = false;

        var service_time_array = [];

        if (role == 1000) {
            // Franchisee
            zee = runtime.getCurrentUser();
        } else if (role == 3) { //Administrator
            zee = 6; //test
        } else { // System Support
            zee = 425904; //test-AR
        }

        function createStops(context){
            if (context.request.method === 'GET') {
                var script_id = null;
                var deploy_id = null;
                var entryParamsString = null;

                var commReg = null;
                var dateEffective = null;
                var editPage = 'F';

                var customer_id = null;
                var legid = null;
                var servicetime = null;
                var run = null;
                var serviceLegName;

                var form = ui.createForm({
                    title: 'Add / Edit Stops for Customer'
                });

                if (!isNullorEmpty(context.request.parameters.custparam_params)) {
                    var params = context.request.parameters.custparam_params;

                    params = JSON.parse(params);

                    if (!isNullorEmpty(params.zee)) {
                        zee = params.zee
                    }

                    if (!isNullorEmpty(params.legid)) {
                        legid = params.legid;
                        // var legRecord = nlapiLoadRecord('customrecord_service_leg', legid);
                        // serviceLegName = legRecord.getFieldValue('name');
                        var legRecord = record.load({ type: 'customrecord_service_leg', id: legid})
                        serviceLegName = legRecord.getValue({ fieldId: 'name'});
                    }

                    if (!isNullorEmpty(params.servicetime)) {
                        servicetime = params.servicetime
                    }

                    if (!isNullorEmpty(params.run)) {
                        run = params.run
                    }

                    customer_id = params.custid;

                    // var serviceSetupSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch2971');

                    // var addFilterExpression = new Array();
                    // addFilterExpression[addFilterExpression.length] = new nlobjSearchFilter('custrecord_service_leg_franchisee', null, 'anyof', zee);
                    // addFilterExpression[addFilterExpression.length] = new nlobjSearchFilter('name', null, 'is', serviceLegName);
                    // addFilterExpression[addFilterExpression.length] = new nlobjSearchFilter('custrecord_service_freq_time_current', 'CUSTRECORD_SERVICE_FREQ_STOP', 'equalto', servicetime);
                    // serviceSetupSearch.addFilters(addFilterExpression);

                    // var resultSetStops = serviceSetupSearch.runSearch();

                    // var packageResult = resultSetStops.getResults(0, 1);

                    // if (packageResult.length != 0) {
                    // 	var count = 0;
                    // 	resultSetStops.forEachResult(function(searchResult) {

                    // 		count++;
                    // 		return true;
                    // 	});

                    // 	nlapiLogExecution('DEBUG', 'count', count);
                    // }
                }

                // var serviceLegSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_serviceleg');

                // var newFilters = new Array();
                // // newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_service_leg_service', null, 'is', service_id);
                // newFilters[newFilters.length] = new nlobjSearchFilter('isinactive', null, 'is', 'F');

                // serviceLegSearch.addFilters(newFilters);

                // var resultSet = serviceLegSearch.runSearch();

                // var serviceLegResult = resultSet.getResults(0, 1);

                // var searched_zee = nlapiLoadSearch('partner', 'customsearch_smc_franchisee');

                // var resultSet_zee = searched_zee.runSearch();


                /**
                * Description - To add all the API's to the begining of the page
                */
                var inlineQty = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://ajax.go';
                inlineQty += 'ogleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><link href="https://1048144.app.netsuite.com/core/media/media.nl?id=2292066&c=1048144&h=c91c35bfd9670a7ee512&_xt=.css" rel="stylesheet"><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2292065&c=1048144&h=5c70d98090661029c8b2&_xt=.js"></script>';

                inlineQty += '<ol class="breadcrumb" style="margin-left: 0px !important;position: absolute;">';
                inlineQty += '<li>Run Scheduler</li>';
                inlineQty += '<li>Customer List</li>';
                inlineQty += '<li class="active">Add / Edit Stops</li>';
                inlineQty += '</ol>';

                //inlineQty += '<div class="se-pre-con"></div>
                inlineQty += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo" style="margin-top: 50px;position: absolute;">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b><ul><li>This page is used to Create / Add / Edit Stops for a particular service. The information required are the stop address, time spent at that stop & notes with respect to the stop</li><li><button class="btn btn-success btn-sm  glyphicon glyphicon-log-out" type="button"  title="Add Stop"></button> - <b>ADD STOP</b><ul><li>Click to Add Stop Information</li></ul></li><li><button class="btn btn-warning btn-sm glyphicon glyphicon-pencil" type="button" title="Edit St';
                inlineQty += 'op" ></button> - <b>EDIT STOP</b> </li><ul><li>Click to Edit Stop Information.</li></ul><li><button class="btn btn-danger btn-sm  glyphicon glyphicon-trash" type="button"  title="Delete Stop" ></button> - <b>DELETE STOP</b></li><ul><li>Click to Delete the Stop</li></ul><li><button type="button" class="btn btn-sm glyphicon glyphicon-plus" value="+" style="color: green;" title="Add Row" ></button> - <b>CREATE STOP</b><ul><li>Click to create a New Stop</li></ul></li><ul></div>';

                inlineQty += '<br><br><style>table#services {font-size:12px; text-align:center; border-color: #24385b}</style><form id="package_form" class="form-horizontal"><div class="form-group container-fluid"><div><div id="alert" class="alert alert-danger fade in"></div><div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document"><div class="modal-content" style="width: max-content;"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Information</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

                //If role is Admin or System Support, dropdown to select zee
                if (role != 1000) {

                    inlineQty += '<div class="col-xs-4 admin_section" style="width: 20%;left: 40%;position: absolute;"><b>Select Zee</b> <select class="form-control zee_dropdown" >';

                    //WS Edit: Updated Search to SMC Franchisee (exc Old/Inactives)
                    //Search: SMC - Franchisees
                    // var searched_zee = nlapiLoadSearch('partner', 'customsearch_smc_franchisee');
                    // var resultSet_zee = searched_zee.runSearch();
                    var searched_zee = search.load({ type: 'partner', id: 'customsearch_smc_franchisee'});
                    var resultSet_zee = searched_zee.run();
                    
                    var count_zee = 0;
                    var zee_id;

                    inlineQty += '<option value=""></option>'

                    resultSet_zee.each(function(searchResult_zee) {
                        zee_id = searchResult_zee.getValue({ name: 'internalid'});
                        // WS Edit: Updated entityid to companyname
                        zee_name = searchResult_zee.getValue({ name: 'companyname'});

                        if (context.request.parameters.zee == zee_id) {
                            inlineQty += '<option value="' + zee_id + '" selected="selected">' + zee_name + '</option>';
                        } else {
                            inlineQty += '<option value="' + zee_id + '">' + zee_name + '</option>';
                        }

                        return true;
                    });

                    inlineQty += '</select></div>';
                }

                if (!isNullorEmpty(context.request.parameters.zee)) {
                    zee = context.request.parameters.zee;
                }
                // form.addField('custpage_zee', 'textarea', 'zee').setDisplayType('hidden').setDefaultValue(zee);
                form.addField({
                    id: 'custpage_zee',
                    label: 'zee',
                    type: ui.FieldType.TEXTAREA
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = zee;

               form.addField({
                    id: 'custpage_customer_id',
                    label: 'Customer ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = customer_id;

                
                form.addField({
                    id: 'custpage_freq_created',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = zee;
                form.addField({
                    id: 'custpage_freq_created_zees',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                form.addField({
                    id: 'custpage_freq_edited',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                form.addField({
                    id: 'custpage_stored_zee',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                form.addField({
                    id: 'custpage_linked_zee',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                form.addField({
                    id: 'custpage_deleted_stop',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                form.addField({
                    id: 'custpage_deleted_linked_zee',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                form.addField({
                    id: 'custpage_deleted_message',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                form.addField({
                    id: 'custpage_updated_stop',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                form.addField({
                    id: 'custpage_old_stop',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                form.addField({
                    id: 'custpage_updated_stop_zee',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
                form.addField({
                    id: 'new_service_leg_id_string',
                    label: 'Service ID',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                /**
                * Description - Get all the AP Lodgement locations for this franchisee
                */
                // var searched_ncl = nlapiLoadSearch('customrecord_ap_lodgment_location', 'customsearch_smc_noncust_location');
                // var zee_record = nlapiLoadRecord('partner', zee);
                var searched_ncl = search.load({ type: 'customrecord_ap_lodgment_location', id: 'customsearch_smc_noncust_location'})
                var zee_record = record.load({ type: 'partner', id: zee});

                // var newFilters = new Array();
                if (zee_record.getValue({ fieldId: 'location'}) == 6) {
                    // newFilters[0] = new nlobjSearchFilter('custrecord_ap_lodgement_site_state', null, 'anyof', [1, 6]);
                    var newFilters = search.createFilter({
                        name: 'custrecord_ap_lodgement_site_state',
                        join: null,
                        operator: search.Operator.ANYOF,
                        values: [1, 6]
                    })
                } else {
                    // newFilters[0] = new nlobjSearchFilter('custrecord_ap_lodgement_site_state', null, 'is', zee_record.getFieldValue('location'));
                    var newFilters = search.createFilter({
                        name: 'custrecord_ap_lodgement_site_state',
                        join: null,
                        operator: search.Operator.ANYOF,
                        values: zee_record.getValue({ fieldId: 'location'})
                    })
                }
                //NCL Type: AusPost(1), Toll(2), StarTrack(7)
                // newFilters[1] = new nlobjSearchFilter('custrecord_noncust_location_type', null, 'anyof', [1, 2, 7]);

                searched_ncl.filters.push(newFilters);
                var resultSet_ncl = searched_ncl.run();

                //Search: SMC - Customer
                // var customerSearch = nlapiLoadSearch('customer', 'customsearch_smc_customer');
                // var addFilterExpression = new nlobjSearchFilter('partner', null, 'anyof', zee);
                // customerSearch.addFilter(addFilterExpression);
                // var resultSetCustomer = customerSearch.runSearch();
                var customerSearch = search.load({ type: 'customer', id: 'customsearch_smc_customer'});
                var addFilterExpression = search.createFilter({
                    name: 'partner',
                    join: null,
                    operator: search.Operator.ANYOF,
                    values: zee
                });
                customerSearch.filters.push(addFilterExpression);
                var resultSetCustomer = customerSearch.run();

                // var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');
                // var newFilters_runPlan = new Array();
                // newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'is', zee);
                // runPlanSearch.addFilters(newFilters_runPlan);
                // var resultSet_runPlan = runPlanSearch.runSearch();
                var runPlanSearch = search.load({ type: 'customrecord_run_plan', id: 'customsearch_app_run_plan_active'});
                var newFilters_runPlan = search.createFilter({
                    name: 'custrecord_run_franchisee',
                    join: null,
                    operator: search.Operator.IS,
                    values: zee
                });
                runPlanSearch.filters.push(newFilters_runPlan);
                var resultSet_runPlan = runPlanSearch.run();

                if (!isNullorEmpty(customer_id)) {
                    /**
                    * [searched_jobs description] - Load all the Addresses related to this customer
                    */
                    // var searched_address = nlapiLoadSearch('customer', 'customsearch_smc_address');
                    // var newFilters_addresses = new Array();
                    // newFilters_addresses[0] = new nlobjSearchFilter('internalid', null, 'is', customer_id);
                    // searched_address.addFilters(newFilters_addresses);
                    // var resultSet_addresses = searched_address.runSearch();
                    var searched_address = search.load({ type: 'customer', id: 'customsearch_smc_address'});
                    newFilters_addresses = search.createFilter({
                        name: 'internalid',
                        join: null,
                        operator: search.Operator.IS,
                        values: customer_id
                    });
                    searched_address.filters.push(newFilters_addresses);
                    var resultSet_addresses = searched_address.run();
                }

                inlineQty += '<div class="container" style="padding-top: 10%;">';

                // inlineQty += '<div class="form-group container service_descp_row ">';
                // inlineQty += '<div class="row">';
                // inlineQty += '<div class="col-xs-3 service_name_section"><div class="input-group"><span class="input-group-addon" id="descp_text">SERVICE NAME</span><input id="service_name" class="form-control service_name" readonly data-serviceid="' + service_id + '"value="' + service_name + '" /></div></div>';
                // inlineQty += '<div class="col-xs-3 service_pprice_section"><div class="input-group"><span class="input-group-addon" id="descp_text">SERVICE PRICE | $</span><input id="descp" class="form-control service_price" readonly value="' + service_price + '" /></div></div>';
                // inlineQty += '</div>';
                // inlineQty += '</div>';

                // inlineQty += '<div class="form-group container transfer_type_row hide">';
                // inlineQty += '<div class="row">';
                // inlineQty += '<div class="col-xs-6 transfer_type_section"><div class="input-group"><span class="input-group-addon" id="transfer_type_text">TRANSFER TYPE</span><select id="transfer_type" class="form-control transfer_type" ><option value="0"></option><option value="1">FACE-TO-FACE</option><option value="2">SWAP BOX</option></select></div></div>';
                // inlineQty += '</div>';
                // inlineQty += '</div>';

                // inlineQty += '<div class="form-group container zee_row hide">';
                // inlineQty += '<div class="row">';
                // inlineQty += '<div class="col-xs-6 zee_section"><div class="input-group"><span class="input-group-addon" id="zee_text">SELECT FRANCHISEE</span><select id="zee" class="form-control zee" ><option value="0"></option>';
                // resultSet_zee.forEachResult(function(searchResult_zee) {
                // 	zee_id = searchResult_zee.getValue('internalid');
                // 	zee_name = searchResult_zee.getValue('companyname');

                // 	inlineQty += '<option value="' + zee_id + '">' + zee_name + '</option>'
                // 	return true;
                // });
                // inlineQty += '</select></div></div>';
                // inlineQty += '</div>';
                // inlineQty += '</div>';

                if (!isNullorEmpty(customer_id)) {
                    inlineQty += '<div class="form-group container address_type_row">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 address_type_section"><div class="input-group"><span class="input-group-addon" id="address_type_text">ADDRESS TYPE</span><select id="address_type" class="form-control address_type" ><option value="0"></option><option value="1" selected>CUSTOMER ADDRESS</option><option value="2">NON-CUSTOMER LOCATION</option></select></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<div class="form-group container customer_row">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 customer_section"><div class="input-group"><span class="input-group-addon" id="customer_address_text">CUSTOMER LIST</span><select id="customer_list" class="form-control customer_list" ><option value="0"></option>';

                    resultSetCustomer.each(function(searchResult) {

                        var custid = searchResult.getValue({ name: 'internalid', join: null, summary: search.Summary.GROUP});
                        var entityid = searchResult.getValue({ name: 'entityid', join: null, summary: search.Summary.GROUP});
                        var companyname = searchResult.getValue({ name: 'companyname', join: null, summary: search.Summary.GROUP});

                        if (custid == customer_id) {
                            inlineQty += '<option value="' + custid + '" selected>' + entityid + ' ' + companyname + '</option>';
                        } else {
                            inlineQty += '<option value="' + custid + '">' + entityid + ' ' + companyname + '</option>';
                        }


                        return true;
                    });

                    inlineQty += '</select></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<div class="form-group container customer_address_row ">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 customer_address_section"><div class="input-group"><span class="input-group-addon" id="customer_address_text">CUSTOMER ADDRESS</span><select id="customer_address_type" class="form-control customer_address_type" ><option value="0"></option>';

                    resultSet_addresses.each(function(searchResult_address) {

                        var id = searchResult_address.getValue({ name: 'addressinternalid', join: 'Address'});
                        var addr1 = searchResult_address.getValue({ name: 'address1', join: 'Address'});
                        var addr2 = searchResult_address.getValue({ name: 'address2', join: 'Address'});
                        var city = searchResult_address.getValue({ name: 'city', join: 'Address'});
                        var state = searchResult_address.getValue({ name: 'state', join: 'Address'});
                        var zip = searchResult_address.getValue({ name: 'zipcode', join: 'Address'});
                        var lat = searchResult_address.getValue({ name: 'custrecord_address_lat', join: 'Address'});
                        var lon = searchResult_address.getValue({ name: 'custrecord_address_lon', join: 'Address'});
                        var default_shipping = searchResult_address.getValue({ name: 'isdefaultshipping', join: 'Address'});
                        var default_billing = searchResult_address.getValue({ name: 'isdefaultbilling', join: 'Address'});
                        var default_residential = searchResult_address.getValue({ name: 'isresidential', join: 'Address'});
                        var post_outlet = searchResult_address.getValue({ name: 'custrecord_address_ncl', join: 'Address'});
                        var not_service_address = searchResult_address.getValue({ name: 'custrecord_not_a_service_address', join: "Address"});
                        var post_outlet_text = searchResult_address.getText({ name: 'custrecord_address_ncl', join: 'Address'});
                        var customer_name = searchResult_address.getValue({ name: 'companyname'});

                        var street_no_name = null;

                        if (isNullorEmpty(addr1) && isNullorEmpty(addr2)) {
                            var full_address = city + ', ' + state + ' - ' + zip;
                        } else if (isNullorEmpty(addr1) && !isNullorEmpty(addr2)) {
                            var full_address = addr2 + ', ' + city + ', ' + state + ' - ' + zip;
                            street_no_name = addr2;
                        } else if (!isNullorEmpty(addr1) && isNullorEmpty(addr2)) {
                            var full_address = addr1 + ', ' + city + ', ' + state + ' - ' + zip;
                            street_no_name = addr1;
                        } else {
                            var full_address = addr1 + ', ' + addr2 + ', ' + city + ', ' + state + ' - ' + zip;
                            street_no_name = addr1 + ', ' + addr2;
                        }

                        inlineQty += '<option value="' + id + '" data-addr1="' + addr1 + '" data-addr2="' + addr2 + '" data-city="' + city + '" data-state="' + state + '" data-postcode="' + zip + '" data-residential="' + default_residential + '" data-ncl="' + post_outlet + '" data-ncltext="' + post_outlet_text + '" data-lat="' + lat + '" data-lng="' + lon + '" data-compname="' + customer_name + '" data-streetnoname="' + street_no_name + '">' + full_address + '</option>';

                        return true;
                    });

                    inlineQty += '</select></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';


                    inlineQty += '<div class="form-group container stop_name_row ">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 stop_name_section"><div class="input-group"><span class="input-group-addon" id="stop_name_text">STOP NAME</span><input id="stop_name" class="form-control stop_name" readonly /></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<div class="form-group container stop_duration_row ">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 stop_duration_section"><div class="input-group"><span class="input-group-addon" id="stop_duration_text">STOP DURATION (minutes)</span></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<input type="text" id="duration" name="duration" class="">';

                    inlineQty += '<div class="form-group container stop_notes_row ">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 stop_notes_section"><div class="input-group"><span class="input-group-addon" id="stop_notes_text">STOP NOTES </span><textarea id="stop_notes" class="form-control stop_notes"  ></textarea></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<div class="form-group container service_time_row">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 service_time_section"><div class="input-group"><span class="input-group-addon" id="service_time_text">SERVICE TIME</span><input id="service_time" class="form-control service_time" type="time" data-stopid="" data-oldtime="" value="" data-stopno=""/></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '<div class="form-group container time_row ">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-12 previous_service_time_section"><div class="col-xs-2"><button class="btn btn-sm btn-info" disabled>PREVIOUS TIMES</button></div>';
                    inlineQty += '<div class="col-xs-10">';
                    // if (!isNullorEmpty(obj['stop_ncl_id']) || !isNullorEmpty(obj['stop_addr_id'])) {
                    // 	var serviceLegTimeSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_freq_time');

                    // 	var newFiltersTime = new Array();
                    // 	if (!isNullorEmpty(obj['stop_ncl_id'])) {
                    // 		newFiltersTime[newFiltersTime.length] = new nlobjSearchFilter('custrecord_service_leg_non_cust_location', null, 'is', obj['stop_ncl_id']);
                    // 	}
                    // 	if (!isNullorEmpty(obj['stop_addr_id'])) {
                    // 		newFiltersTime[newFiltersTime.length] = new nlobjSearchFilter('custrecord_service_leg_addr', null, 'is', obj['stop_addr_id']);
                    // 	}


                    // 	serviceLegTimeSearch.addFilters(newFiltersTime);

                    // 	var resultSetTime = serviceLegTimeSearch.runSearch();

                    // 	resultSetTime.forEachResult(function(searchResultTime) {

                    // 		inlineQty += '<div class="col-xs-1 service_time_section"><button type="button"  class="btn btn-sm btn-default service_time_button" data-stopid="' + obj['stop_id'] + '" data-time="' + convertTo24Hour(searchResultTime.getValue("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP")) + '" >' + convertTo24Hour(searchResultTime.getValue("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP")) + '</button></div>';
                    // 		return true;
                    // 	});

                    // }


                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';


                    inlineQty += '<div class="form-group container time_window_row">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-3 earliest_time_section"><div class="input-group"><span class="input-group-addon" id="earliest_time_text">EARLIEST TIME</span><input id="earliest_time" class="form-control earliest_time" type="time" data-stopid="" data-oldearliesttime="" value="" data-stopno=""/></div></div>';
                    inlineQty += '<div class="col-xs-3 latest_time_section"><div class="input-group"><span class="input-group-addon" id="latest_time_text">LATEST TIME</span><input id="latest_time" class="form-control latest_time" type="time" data-stopid="" data-oldlatesttime="" value="" data-stopno=""/></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '<div class="form-group container time_window_row">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-12 previous_time_window_section"><div class="col-xs-2"><span class="btn btn-sm btn-info" disabled>PREVIOUS TIME WINDOWS</span></div>';
                    inlineQty += '<div class="col-xs-10">';
                    // if (!isNullorEmpty(obj['stop_ncl_id']) || !isNullorEmpty(obj['stop_addr_id'])) {
                    // 	var serviceLegTimeWindowSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_freq_timewindows');

                    // 	var newFiltersTimeWindow = new Array();
                    // 	if (!isNullorEmpty(obj['stop_ncl_id'])) {
                    // 		newFiltersTimeWindow[newFiltersTimeWindow.length] = new nlobjSearchFilter('custrecord_service_leg_non_cust_location', null, 'is', obj['stop_ncl_id']);
                    // 	}
                    // 	if (!isNullorEmpty(obj['stop_addr_id'])) {
                    // 		newFiltersTimeWindow[newFiltersTimeWindow.length] = new nlobjSearchFilter('custrecord_service_leg_addr', null, 'is', obj['stop_addr_id']);
                    // 	}


                    // 	serviceLegTimeWindowSearch.addFilters(newFiltersTimeWindow);

                    // 	var resultSetTimeWindow = serviceLegTimeWindowSearch.runSearch();

                    // 	resultSetTimeWindow.forEachResult(function(searchResultTimeWindow) {

                    // 		inlineQty += '<div class="col-xs-2"><button type="button"  class="btn btn-sm btn-default service_time_window_button" data-stopid="' + obj['stop_id'] + '" data-timewindow="' + searchResultTimeWindow.getValue("formulatext", null, "GROUP") + '">' + searchResultTimeWindow.getValue("formulatext", null, "GROUP") + '</button></div>';
                    // 		return true;
                    // 	});

                    // }

                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<div class="form-group container table_row">';
                    inlineQty += '<div class="row">';

                    inlineQty += '<table border="0" cellpadding="15" id="services" class="table table-responsive table-striped services tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr class="text-center">';

                    /**
                    * ACTION ROW
                    */
                    inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>ACTION</b></th><th class="col-sm-1"><b>SEQUENCE</b></th>';
                    /**
                    * INFO ROW
                    */
                    inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>SERVICE</b></th><th style="vertical-align: middle;text-align: center;"><b>SERVICE LEG</b></th><th colspan=7 style="vertical-align: middle;text-align: center;"><b>FREQUENCY</b></th><th style="vertical-align: middle;text-align: center;"><b>RUN PLAN</b></th></tr><th></th><th></th></th><th></th><th></th><th>DAILY</th><th>M</th><th>T</th><th>W</th><th>TH</th><th>F</th><th>ADHOC</th><th></th></tr></thead><tbody>';

                    inlineQty += '<tr><td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" type="button" data-toggle="tooltip" data-placement="right" title="Add New Package" data-stopid="" data-freqid=""></button><input type="hidden" class="delete_package" value="F" /></td><td><input type="text" value="1" class="form-control sequence" readonly /></td>';

                    inlineQty += '<td><select class="form-control service_selected_class" name="service_selected"><option value=0></option>';

                    // var serviceSearch = nlapiLoadSearch('customrecord_service', 'customsearch_rp_services');
                    // var addFilterExpression = new Array();
                    // addFilterExpression[addFilterExpression.length] = new nlobjSearchFilter('custrecord_service_customer', null, 'is', customer_id);
                    // addFilterExpression[addFilterExpression.length] = new nlobjSearchFilter('custrecord_service_franchisee', null, 'is', zee);
                    // serviceSearch.addFilters(addFilterExpression);
                    // var resultSetCustomer = serviceSearch.runSearch();
                    var serviceSearch = search.load({ type: 'customrecord_service', id: 'customsearch_rp_services'});
                    var addFilterExpression_1 = search.createFilter({
                        name: 'custrecord_service_customer',
                        join: null,
                        operator: search.Operator.IS,
                        values: customer_id
                    });
                    search.createFilter({
                        name: 'custrecord_service_franchisee',
                        join: null,
                        operator: search.Operator.IS,
                        values: zee
                    });
                    serviceSearch.filters.push(addFilterExpression_1);
                    serviceSearch.filters.push(addFilterExpression_2);
                    var resultSetCustomer = serviceSearch.run();
                    

                    resultSetCustomer.each(function(searchResult_service) {
                        var service_id = searchResult_service.getValue({ name: "internalid", join: null, summary: search.Summary.GROUP});
                        var service_name = searchResult_service.getText({ name: 'custrecord_service', join: null, summary: search.Summary.GROUP});
                        var service_leg_freq_count = searchResult_service.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_FREQ_SERVICE", summary: search.Summary.GROUP});
                        var service_leg_count = searchResult_service.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_LEG_SERVICE", summary: search.Summary.GROUP});

                        if (service_leg_count == 0) {
                            inlineQty += '<option value="' + service_id + '">' + service_name + '</option>';
                        }

                        return true;
                    });

                    inlineQty += '</select></td>';
                    inlineQty += '<td><select class="form-control service_leg"><option value=0></option><option value=1>Pick Up</option><option value=2>Delivery</option></td>';
                    inlineQty += '<td><input type="checkbox" id="daily" ng-model="daily_checkbox" class="daily" /></td>';
                    inlineQty += '<td><input type="checkbox" id="monday" ng-model="monday_checkbox" class="monday" /></td>';
                    inlineQty += '<td><input type="checkbox" id="tuesday" ng-model="tuesday_checkbox" class="tuesday" /></td>';
                    inlineQty += '<td><input type="checkbox" id="wednesday" ng-model="wednesday_checkbox" class="wednesday" /></td>';
                    inlineQty += '<td><input type="checkbox" id="thursday" ng-model="thursday_checkbox" class="thursday" /></td>';
                    inlineQty += '<td><input type="checkbox" id="friday" ng-model="friday_checkbox" class="friday" /></td>';
                    inlineQty += '<td><input type="checkbox" id="adhoc" ng-model="adhoc_checkbox" class="adhoc" /></td>';
                    inlineQty += '<td><select class="form-control run_selected_class" name="run_selected"><option value="0"></option>';
                    resultSet_runPlan.each(function(searchResult_runPlan) {

                        inlineQty += '<option value="' + searchResult_runPlan.getValue({ name: 'internalid'}) + '">' + searchResult_runPlan.getValue({ name: 'name'}) + '</option>';

                        return true;
                    });
                    inlineQty += '</select></td>';

                    inlineQty += '</tbody>';
                    inlineQty += '</table></div></div><br/>';


                } else {
                    inlineQty += '<div class="form-group container address_type_row">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 address_type_section"><div class="input-group"><span class="input-group-addon" id="address_type_text">ADDRESS TYPE</span><select id="address_type" class="form-control address_type" ><option value="0"></option><option value="1">CUSTOMER ADDRESS</option><option value="2">NON-CUSTOMER LOCATION</option></select></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<div class="form-group container customer_row hide">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 customer_section"><div class="input-group"><span class="input-group-addon" id="customer_address_text">CUSTOMER LIST</span><select id="customer_list" class="form-control customer_list" ><option value="0"></option>';
                    resultSetCustomer.each(function(searchResult) {

                        var custid = searchResult.getValue({ name:'internalid', join: null, summary: search.Summary.GROUP });
                        var entityid = searchResult.getValue({ name:'entityid', join: null, summary: search.Summary.GROUP });
                        var companyname = searchResult.getValue({ name:'companyname', join: null, summary: search.Summary.GROUP });

                        if (custid == customer_id) {
                            inlineQty += '<option value="' + custid + '" selected>' + entityid + ' ' + companyname + '</option>';
                        } else {
                            inlineQty += '<option value="' + custid + '">' + entityid + ' ' + companyname + '</option>';
                        }

                        return true;
                    });
                    inlineQty += '</select></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';


                    inlineQty += '<div class="form-group container ncl_row hide">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 ncl_section"><div class="input-group"><span class="input-group-addon" id="ncl_text">NON-CUSTOMER LOCATION</span><select id="ncl_type" class="form-control ncl_type" ><option value="0"></option>';
                    resultSet_ncl.each(function(searchResult_ncl) {

                        var internal_id = searchResult_ncl.getValue({ name: 'internalid'});
                        var name = searchResult_ncl.getValue({ name: 'name'});
                        var post_code = searchResult_ncl.getValue({ name: 'custrecord_ap_lodgement_postcode'});
                        var addr1 = searchResult_ncl.getValue({ name: 'custrecord_ap_lodgement_addr1'});
                        var addr2 = searchResult_ncl.getValue({ name: 'custrecord_ap_lodgement_addr2'});
                        var state = searchResult_ncl.getValue({ name: 'custrecord_ap_lodgement_site_state'});
                        var city = searchResult_ncl.getValue({ name: 'custrecord_ap_lodgement_suburb'});
                        var lat = searchResult_ncl.getValue({ name: 'custrecord_ap_lodgement_lat'});
                        var lon = searchResult_ncl.getValue({ name: 'custrecord_ap_lodgement_long'});

                        var state_id;
                        switch (state) {
                            case '1':
                                state_id = 'NSW';
                                break;
                            case '2':
                                state_id = 'QLD';
                                break;
                            case '3':
                                state_id = 'VIC';
                                break;
                            case '4':
                                state_id = 'SA';
                                break;
                            case '5':
                                state_id = 'TAS';
                                break;
                            case '6':
                                state_id = 'ACT';
                                break;
                            case '7':
                                state_id = 'WA';
                                break;
                            case '8':
                                state_id = 'NT';
                                break;
                            case '9':
                                state_id = 'NZ';
                                break;
                        }


                        inlineQty += '<option value="' + internal_id + '" data-addr1="' + addr1 + '" data-addr2="' + addr2 + '" data-city="' + city + '" data-state="' + state_id + '" data-postcode="' + post_code + '" data-lat="' + lat + '" data-lng="' + lon + '" data-ncl="' + internal_id + '" data-ncltext="' + name + '" >' + name + '</option>';


                        return true;
                    });
                    inlineQty += '</select></div></div>';
                    // inlineQty += '<div class="col-xs-1 create_new_section has-success"><input type="button" id="create_new" class="form-control btn btn-default glyphicon glyphicon-plus create_new" value="+" style="color: green;" data-toggle="tooltip" data-placement="right" title="CREATE NEW LOCATION" /></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<div class="form-group container stop_name_row hide">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 stop_name_section"><div class="input-group"><span class="input-group-addon" id="stop_name_text">STOP NAME</span><input id="stop_name" class="form-control stop_name" readonly /></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<div class="form-group container stop_duration_row hide">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 stop_duration_section"><div class="input-group"><span class="input-group-addon" id="stop_duration_text">STOP DURATION (minutes)</span></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<input type="text" id="duration" name="duration" class="hide">';

                    inlineQty += '<div class="form-group container stop_notes_row hide">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 stop_notes_section"><div class="input-group"><span class="input-group-addon" id="stop_notes_text">STOP NOTES </span><textarea id="stop_notes" class="form-control stop_notes"  ></textarea></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';


                    inlineQty += '<div class="form-group container service_time_row hide">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-6 service_time_section"><div class="input-group"><span class="input-group-addon" id="service_time_text">SERVICE TIME</span><input id="service_time" class="form-control service_time" type="time" data-stopid="" data-oldtime="" value="" data-stopno=""/></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '<div class="form-group container service_time_row hide">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-12 previous_service_time_section"><div class="col-xs-2"><button class="btn btn-sm btn-info" disabled>PREVIOUS TIMES</button></div>';
                    inlineQty += '<div class="col-xs-10">';
                    // if (!isNullorEmpty(obj['stop_ncl_id']) || !isNullorEmpty(obj['stop_addr_id'])) {
                    // 	var serviceLegTimeSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_freq_time');

                    // 	var newFiltersTime = new Array();
                    // 	if (!isNullorEmpty(obj['stop_ncl_id'])) {
                    // 		newFiltersTime[newFiltersTime.length] = new nlobjSearchFilter('custrecord_service_leg_non_cust_location', null, 'is', obj['stop_ncl_id']);
                    // 	}
                    // 	if (!isNullorEmpty(obj['stop_addr_id'])) {
                    // 		newFiltersTime[newFiltersTime.length] = new nlobjSearchFilter('custrecord_service_leg_addr', null, 'is', obj['stop_addr_id']);
                    // 	}


                    // 	serviceLegTimeSearch.addFilters(newFiltersTime);

                    // 	var resultSetTime = serviceLegTimeSearch.runSearch();

                    // 	resultSetTime.forEachResult(function(searchResultTime) {

                    // 		inlineQty += '<div class="col-xs-1 service_time_section"><button type="button"  class="btn btn-sm btn-default service_time_button" data-stopid="' + obj['stop_id'] + '" data-time="' + convertTo24Hour(searchResultTime.getValue("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP")) + '" >' + convertTo24Hour(searchResultTime.getValue("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP")) + '</button></div>';
                    // 		return true;
                    // 	});

                    // }


                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';


                    inlineQty += '<div class="form-group container time_window_row hide">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-3 earliest_time_section"><div class="input-group"><span class="input-group-addon" id="earliest_time_text">EARLIEST TIME</span><input id="earliest_time" class="form-control earliest_time" type="time" data-stopid="" data-oldearliesttime="" value="" data-stopno=""/></div></div>';
                    inlineQty += '<div class="col-xs-3 latest_time_section"><div class="input-group"><span class="input-group-addon" id="latest_time_text">LATEST TIME</span><input id="latest_time" class="form-control latest_time" type="time" data-stopid="" data-oldlatesttime="" value="" data-stopno=""/></div></div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '<div class="form-group container time_window_row hide">';
                    inlineQty += '<div class="row">';
                    inlineQty += '<div class="col-xs-12 previous_time_window_section"><div class="col-xs-2"><span class="btn btn-sm btn-info" disabled>PREVIOUS TIME WINDOWS</span></div>';
                    inlineQty += '<div class="col-xs-10">';
                    // if (!isNullorEmpty(obj['stop_ncl_id']) || !isNullorEmpty(obj['stop_addr_id'])) {
                    // 	var serviceLegTimeWindowSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_freq_timewindows');

                    // 	var newFiltersTimeWindow = new Array();
                    // 	if (!isNullorEmpty(obj['stop_ncl_id'])) {
                    // 		newFiltersTimeWindow[newFiltersTimeWindow.length] = new nlobjSearchFilter('custrecord_service_leg_non_cust_location', null, 'is', obj['stop_ncl_id']);
                    // 	}
                    // 	if (!isNullorEmpty(obj['stop_addr_id'])) {
                    // 		newFiltersTimeWindow[newFiltersTimeWindow.length] = new nlobjSearchFilter('custrecord_service_leg_addr', null, 'is', obj['stop_addr_id']);
                    // 	}


                    // 	serviceLegTimeWindowSearch.addFilters(newFiltersTimeWindow);

                    // 	var resultSetTimeWindow = serviceLegTimeWindowSearch.runSearch();

                    // 	resultSetTimeWindow.forEachResult(function(searchResultTimeWindow) {

                    // 		inlineQty += '<div class="col-xs-2"><button type="button"  class="btn btn-sm btn-default service_time_window_button" data-stopid="' + obj['stop_id'] + '" data-timewindow="' + searchResultTimeWindow.getValue("formulatext", null, "GROUP") + '">' + searchResultTimeWindow.getValue("formulatext", null, "GROUP") + '</button></div>';
                    // 		return true;
                    // 	});

                    // }

                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';
                    inlineQty += '</div>';

                    inlineQty += '<div class="form-group container table_row hide">';
                    inlineQty += '<div class="row">';

                    inlineQty += '<table border="0" cellpadding="15" id="services" class="table table-responsive table-striped services tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr class="text-center">';

                    /**
                    * ACTION ROW
                    */
                    inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>ACTION</b></th><th class="col-sm-1"><b>SEQUENCE</b></th>';
                    /**
                    * INFO ROW
                    */
                    inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>CUSTOMER</b></th><th style="vertical-align: middle;text-align: center;"><b>SERVICE</b></th><th  style="vertical-align: middle;text-align: center;"><b>SERVICE LEG</b></th><th colspan=7 style="vertical-align: middle;text-align: center;"><b>FREQUENCY</b></th><th style="vertical-align: middle;text-align: center;"><b>RUN PLAN</b></th></tr><tr><th></th><th></th><th></th><th></th><th></th><th>DAILY</th><th>M</th><th>T</th><th>W</th><th>TH</th><th>F</th><th>ADHOC</th><th></th></tr></thead><tbody>';

                    inlineQty += '<tr><td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" type="button" data-toggle="tooltip" data-placement="right" title="Add New Package" data-stopid="" data-freqid=""></button><input type="hidden" class="delete_package" value="F" /></td><td><input type="text" value="1" class="form-control sequence" readonly /></td>';
                    inlineQty += '<td><select class="form-control customer_selected_class" name="customer_selected"><option value="0"></option>';
                    resultSetCustomer.each(function(searchResult) {

                        var custid = searchResult.getValue({ name: 'internalid', join: null, summary: search.Summary.GROUP });
                        var entityid = searchResult.getValue({ name: 'entityid', join: null, summary: search.Summary.GROUP });
                        var companyname = searchResult.getValue({ name: 'companyname', join: null, summary: search.Summary.GROUP });

                        if (custid == customer_id) {
                            inlineQty += '<option value="' + custid + '" selected>' + entityid + ' ' + companyname + '</option>';
                        } else {
                            inlineQty += '<option value="' + custid + '">' + entityid + ' ' + companyname + '</option>';
                        }


                        return true;
                    });
                    inlineQty += '</select></td>';
                    inlineQty += '<td><select class="form-control service_selected_class" name="service_selected">';

                    inlineQty += '</select></td>';
                    inlineQty += '<td><select class="form-control service_leg"><option value=0></option><option value=1>Pick Up</option><option value=2>Delivery</option></td>';
                    inlineQty += '<td><input type="checkbox" id="daily" ng-model="daily_checkbox" class="daily" /></td>';
                    inlineQty += '<td><input type="checkbox" id="monday" ng-model="monday_checkbox" class="monday" /></td>';
                    inlineQty += '<td><input type="checkbox" id="tuesday" ng-model="tuesday_checkbox" class="tuesday" /></td>';
                    inlineQty += '<td><input type="checkbox" id="wednesday" ng-model="wednesday_checkbox" class="wednesday" /></td>';
                    inlineQty += '<td><input type="checkbox" id="thursday" ng-model="thursday_checkbox" class="thursday" /></td>';
                    inlineQty += '<td><input type="checkbox" id="friday" ng-model="friday_checkbox" class="friday" /></td>';
                    inlineQty += '<td><input type="checkbox" id="adhoc" ng-model="adhoc_checkbox" class="adhoc" /></td>';
                    inlineQty += '<td><select class="form-control run_selected_class" name="run_selected"><option value="0"></option>';
                    resultSet_runPlan.each(function(searchResult_runPlan) {

                        inlineQty += '<option value="' + searchResult_runPlan.getValue({ name: 'internalid'}) + '">' + searchResult_runPlan.getValue({ name: 'name'}) + '</option>';

                        return true;
                    });
                    inlineQty += '</select></td>';
                    inlineQty += '</tbody>';
                    inlineQty += '</table></div></div><br/>';



                }

                // form.addField('preview_table', 'inlinehtml', '').setLayoutType('startrow').setDefaultValue(inlineQty);
                // form.addSubmitButton('Submit');
                // form.addButton('back', 'Back', 'onclick_back()');
                // form.addButton('back', 'Reset', 'onclick_reset()');
                // form.addButton('main_page', 'Back to Main Page', 'onclick_mainpage()');
                
                form.addField({
                    id: 'preview_table',
                    label: 'inlinehtml',
                    type: 'inlinehtml'
                }).updateLayoutType({
                    layoutType: ui.FieldLayoutType.STARTROW
                }).defaultValue = inlineQty;
                
                form.addButton({
                    id: 'back',
                    label: 'Back',
                    functionName: 'onclick_back()'
                });
                form.addButton({
                    id: 'back',
                    label: 'Reset',
                    functionName: 'onclick_reset()'
                });
                form.addButton({
                    id: 'back',
                    label: 'Back to Main Page',
                    functionName: 'onclick_mainpage()'
                });

                form.clientScriptFileId = 4604808; // PROD = 4604808, SB = ??

                context.response.writePage(form);
            } else {
                // nlapiSetRedirectURL('SUITELET', 'customscript_sl_setup_stops', 'customdeploy_sl_setup_stops', null, null);
                redirect.toSuitelet({
                    scriptId: 'customscript_sl_setup_stops',
                    deploymentId: 'customdeploy_sl_setup_stops'
                });
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
            onRequest: createStops
        }
});