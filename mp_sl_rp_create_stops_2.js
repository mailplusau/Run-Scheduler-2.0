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
    var zee = 0;
    var role = runtime.getCurrentUser().role;

    if (role == 1000) {
        //Franchisee
        // if this doesn't work, try it without .id
        zee = runtime.getCurrentUser().id;
    } else if (role == 3) { //Administrator
        zee = 6; //test
    } else { // System Support
        zee = 425904; //test-AR
    }

    function onRequest(context) {  
        
        if (context.request.method === 'GET') {
            var script_id = null;
            var deploy_id = null;
            var entryParamsString = null;

            var commReg = null;
            var dateEffective = null;
            var editPage = 'F';

            var params = context.request.parameters.custparam_params;

            params = JSON.parse(params);

            if (!isNullorEmpty(params.zee)) {
                zee = params.zee
            }
            log.debug({
                title: 'zee',
                details: zee
            });

            var service_id = (params.serviceid);

            var service_record = record.load({
                type: 'customrecord_service',
                id: service_id,
            });

            var customer_id = service_record.getValue({
                fieldId: 'custrecord_service_customer'
            });

            var customer_text = service_record.getText({
                fieldId: 'custrecord_service_customer'
            });
            
            var service_type_id = service_record.getValue({
                fieldId: 'custrecord_service'
            });
            
            var service_name = service_record.getValue({
                fieldId: 'name'
            });
            
            var service_price = service_record.getValue({
                fieldId: 'custrecord_service_price'
            });

            var recCustomer = record.load({
                type: 'customer',
                id: customer_id,
            });

            var company_name = recCustomer.getValue({
                fieldId: 'companyname'
            });

            var entity_id = recCustomer.getValue({
                fieldId: 'entityid'
            });
            
            var service_type_record = record.load({
                type: 'customrecord_service_type',
                id: service_type_id,
            });

            var default_leg_names = service_type_record.getValue({
                fieldId: 'custrecord_service_type_leg_name'
            });

            var form = ui.createForm({
                title: 'Add / Edit Stops for Customer: ' + entity_id + ' ' + company_name
            });
            
            form.addField({
                id: 'custpage_customer_id',
                type: ui.FieldType.TEXT,
                label: 'Customer ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = customer_id;
            
            form.addField({
                id: 'custpage_service_leg_customer',
                type: ui.FieldType.TEXT,
                label: 'Customer ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = entity_id + ' ' + company_name;

            form.addField({
                id: 'custpage_service_id',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = service_id;

            form.addField({
                id: 'custpage_suitlet',
                type: ui.FieldType.TEXTAREA,
                label: 'Latitude'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = params.scriptid;

            form.addField({
                id: 'custpage_deploy',
                type: ui.FieldType.TEXTAREA,
                label: 'Latitude'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = params.deployid;

            form.addField({
                id: 'custpage_zee',
                type: ui.FieldType.TEXTAREA,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zee;

            form.addField({
                id: 'custpage_stored_zee',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'custpage_linked_zee',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });


            form.addField({
                id: 'custpage_deleted_stop',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'custpage_deleted_linked_zee',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'custpage_deleted_message',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'custpage_updated_stop',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'custpage_old_stop',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'custpage_updated_stop_zee',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'new_service_leg_id_string',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'transfer_string',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'transfer_zee_string',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'stop_string',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });    
            
            /**
             * Description - Get all the AP Lodgement locations for this franchisee
            */

            var searched_ncl = search.load({
                id: 'customsearch_smc_noncust_location',
                type: 'customrecord_ap_lodgment_location'
            })

            
            var pId = recCustomer.getValue({
                fieldId: 'partner'
            });
            var pRec = record.load({
                type: record.Type.PARTNER,
                id: pId
            });

            var pLocationValue = pRec.getValue({
                fieldId: 'location'
            });

            if (pLocationValue == 6) {
                searched_ncl.filters.push(search.createFilter({
                    name: 'custrecord_ap_lodgement_site_state',
                    operator: search.Operator.ANYOF,
                    values: [1, 6]
                }));
                newFilters[0] = new nlobjSearchFilter('custrecord_ap_lodgement_site_state', null, 'anyof', [1, 6]);

            } else {
                searched_ncl.filters.push(search.createFilter({
                    name: 'custrecord_ap_lodgement_site_state',
                    operator: search.Operator.IS,
                    values: pLocationValue
                }));

            }

            var resultSet_ncl = searched_ncl.run();

            /**
             * [searched_jobs description] - Load all the Addresses related to this customer
            */
            var searched_address = search.load({
                id: 'customsearch_smc_address',
                type: 'customer'
            });
            
            searched_address.filters.push(search.createFilter({
                name: 'internalid',
                operator: search.Operator.IS,
                values: customer_id
            }));

            var resultSet_addresses = searched_address.run();

            if (runtime.EnvType == "SANDBOX") {
                var serviceLegSearch = search.load({
                    id: 'customsearch_rp_serviceleg',
                    type: 'customrecord_service_leg'
                });
                
            } else {
                var serviceLegSearch = search.load({
                    id: 'customsearch_rp_serviceleg',
                    type: 'customrecord_service_leg'
                })
                
            }

            serviceLegSearch.filters.push(search.createFilter({
                name: 'custrecord_service_leg_service',
                operator: search.Operator.IS,
                values: service_id
            }));

            serviceLegSearch.filters.push(search.createFilter({
                name: 'isinactive',
                operator: search.Operator.IS,
                values: 'F'
            }));

            var resultSet = serviceLegSearch.run();

            var serviceLegResult = ResultSet.getRange({
                start: 0,
                end: 1
            });
            
            var searched_zee = search.load({
                id: 'customsearch_smc_franchisee',
                type: 'partner'
            });
                
            var resultSet_zee = searched_zee.run();

            /**
             * Description - To add all the API's to the begining of the page
            */

            
            var inlineQty = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script><link type="text/css"'; 
            inlineQty += 'rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><link href="https://1048144.app.netsuite.com/core/media/media.nl?id=2292066&c=1048144&h=c91c35bfd9670a7ee512&_xt=.css" rel="stylesheet"><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2292065&c=1048144&h=5c70d98090661029c8b2&_xt=.js"></script>';
            inlineQty += '<ol class="breadcrumb" style="margin-left: 0px !important;position: absolute;">';
            inlineQty += '<li>Run Scheduler</li>';
            inlineQty += '<li>Customer List</li>';
            inlineQty += '<li class="active">Add / Edit Stops</li>';
            inlineQty += '</ol>';

            inlineQty += '<div class="se-pre-con"></div><button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo" style="margin-top: 50px;position: absolute;">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute; margin-top:90px;" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b><ul><li>This page is used to Create / Add / Edit Stops for a particular service. The information required are the stop address, time spent at that stop & notes with respect to the stop</li><li><button class="btn btn-success btn-sm  glyphicon glyphicon-log-out" type="button"  title="Add Stop"></button>';
            inlineQty += ' - <b>ADD STOP</b><ul><li>Click to Add Stop Information</li></ul></li><li><button class="btn btn-warning btn-sm glyphicon glyphicon-pencil" type="button" title="Edit Stop" ></button> - <b>EDIT STOP</b> </li><ul><li>Click to Edit Stop Information.</li></ul><li><button class="btn btn-danger btn-sm  glyphicon glyphicon-trash" type="button"  title="Delete Stop" ></button> - <b>DELETE STOP</b></li><ul><li>Click to Delete the Stop</li></ul><li><button type="button" class="btn btn-sm glyphicon glyphicon-plus" value="+" style="color: green;" title="Add Row" ></button> - <b>CREATE STOP</b><ul><li>Click to create a New Stop</li></ul></li><ul></div>';

            inlineQty += '<div class="container" id="container" style="padding-top: 120px;">';

            inlineQty += '<div class="form-group container service_descp_row ">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-3 service_name_section"><div class="input-group"><span class="input-group-addon" id="descp_text">SERVICE NAME</span><input id="service_name" class="form-control service_name" readonly data-serviceid="' + service_id + '"value="' + service_name + '" /></div></div>';
            inlineQty += '<div class="col-xs-3 service_pprice_section"><div class="input-group"><span class="input-group-addon" id="descp_text">SERVICE PRICE | $</span><input id="descp" class="form-control service_price" readonly value="' + service_price + '" /></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group container transfer_type_row hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-6 transfer_type_section"><div class="input-group"><span class="input-group-addon" id="transfer_type_text">TRANSFER TYPE</span><select id="transfer_type" class="form-control transfer_type" ><option value="0"></option><option value="1">FACE-TO-FACE</option><option value="2">SWAP BOX</option></select></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group container zee_row hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-6 zee_section"><div class="input-group"><span class="input-group-addon" id="zee_text">SELECT FRANCHISEE</span><select id="zee" class="form-control zee" ><option value="0"></option>';
            
            resultSet_zee.each(function(searchResult_zee) {
                zee_id = searchResult_zee.getValue('internalid');
                zee_name = searchResult_zee.getValue('companyname');
    
                inlineQty += '<option value="' + zee_id + '">' + zee_name + '</option>'
                return true;
            });
            inlineQty += '</select></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';
    
    
            inlineQty += '<div class="form-group container address_type_row hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-6 address_type_section"><div class="input-group"><span class="input-group-addon" id="address_type_text">ADDRESS TYPE</span><select id="address_type" class="form-control address_type" ><option value="0"></option><option value="1">CUSTOMER ADDRESS</option><option value="2">NON-CUSTOMER LOCATION</option></select></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';
    
            inlineQty += '<div class="form-group container customer_address_row hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-6 customer_address_section"><div class="input-group"><span class="input-group-addon" id="customer_address_text">CUSTOMER ADDRESS</span><select id="customer_address_type" class="form-control customer_address_type" ><option value="0"></option>';
    
            resultSet_addresses.each(function(searchResult_address) {
                var id = searchResult_address.getValue({
                    name: 'addressinternalid',
                    join: 'Address'
                });
                var addr1 = searchResult_address.getValue({
                    name: 'address1',
                    join: 'Address'
                });
                var addr2 = searchResult_address.getValue({
                    name: 'address2',
                    join: 'Address'
                });
                var city = searchResult_address.getValue({
                    name: 'city',
                    join: 'Address'
                });
                var state = searchResult_address.getValue({
                    name: 'state',
                    join: 'Address'
                });
                var zip = searchResult_address.getValue({
                    name: 'zipcode',
                    join: 'Address'
                });
                var lat = searchResult_address.getValue({
                    name: 'custrecord_address_lat',
                    join: 'Address'
                });
                var lon = searchResult_address.getValue({
                    name: 'custrecord_address_lon',
                    join: 'Address'
                });
                var default_shipping = searchResult_address.getValue({
                    name: 'isdefaultshipping',
                    join: 'Address'
                });
                var default_billing = searchResult_address.getValue({
                    name: 'isdefaultbilling',
                    join: 'Address'
                });
                var default_residential = searchResult_address.getValue({
                    name: 'isresidential',
                    join: 'Address'
                });
                
                
                var post_outlet = searchResult_address.getValue({
                    name: 'custrecord_address_ncl',
                    join: 'Address'
                });
                var not_service_address = searchResult_address.getValue({
                    name: 'custrecord_not_a_service_address',
                    join: 'Address'
                });

                var post_outlet_text = searchResult_address.getText({
                    name: 'custrecord_address_ncl',
                    join: 'Address'
                });
                
                var customer_name = searchResult_address.getValue('companyname');
    
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

            inlineQty += '<div class="form-group container ncl_row hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-6 ncl_section"><div class="input-group"><span class="input-group-addon" id="ncl_text">NON-CUSTOMER LOCATION</span><select id="ncl_type" class="form-control ncl_type" ><option value="0"></option>';
            
            resultSet_ncl.each(function(searchResult_ncl) {

                var internal_id = searchResult_ncl.getValue('internalid');
                var name = searchResult_ncl.getValue('name');
                var post_code = searchResult_ncl.getValue('custrecord_ap_lodgement_postcode');
                var addr1 = searchResult_ncl.getValue('custrecord_ap_lodgement_addr1');
                var addr2 = searchResult_ncl.getValue('custrecord_ap_lodgement_addr2');
                var state = searchResult_ncl.getValue('custrecord_ap_lodgement_site_state');
                var city = searchResult_ncl.getValue('custrecord_ap_lodgement_suburb');
                var lat = searchResult_ncl.getValue('custrecord_ap_lodgement_lat');
                var lon = searchResult_ncl.getValue('custrecord_ap_lodgement_long');
    
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
            inlineQty += '<div class="col-xs-1 create_new_section has-success"><input type="button" id="create_new" class="form-control btn btn-default glyphicon glyphicon-plus create_new" value="+" style="color: green;" data-toggle="tooltip" data-placement="right" title="CREATE NEW LOCATION" /></div>';
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

            inlineQty += '<div class="form-group container transfer_row hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-6 transfer_section"><div class="input-group"><input type="text" readonly value="Is there a Transfer?" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="transfer_question" class=" transfer_question"/></span></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group container transfer_position_row hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-xs-6 transfer_position_section"><div class="input-group"><span class="input-group-addon" id="run_text">SELECT POSITION</span><select id="transfer_position" class="form-control transfer_position" ><option value="0"></option><option value="1">BEFORE</option><option value="2">AFTER</option></select></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group container row_button hide">'
            inlineQty += '<div class="row">';

            inlineQty += '<div class="add_new_stop_section col-xs-3"><input type="button" value="ADD / EDIT" class="form-control btn btn-primary" id="add_new_stop" data-rowid="" /></div><div class="edit_old_stop_section col-xs-3"><input type="button" value="ADD / EDIT" class="form-control btn btn-primary" id="edit_old_stop" data-rowid="" /></div><div class="clear_section col-xs-3"><input type="button" value="CANCEL" class="form-control btn btn-default" id="clear" /></div>';

            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<br><br><style>table#services {font-size:12px; text-align:center; border-color: #24385b}</style><form id="package_form" class="form-horizontal"><div class="form-group container-fluid"><div><div id="alert" class="alert alert-danger fade in"></div><div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document"><div class="modal-content" style="width: max-content;"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Information</h4><br> </div><div class="modal-body"></div>';
            inlineQty += '<div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div><table border="0" cellpadding="15" id="services" class="table table-responsive table-striped services tablesorter" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr class="text-center">';

            /**
             * ACTION ROW
             */
            inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>ACTION TEST</b></th>';
            /**
             * INFO ROW
             */
            inlineQty += '<th style="vertical-align: middle;text-align: center;"><b>STOP INFORMATION<span class="modal_display glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th><th style="vertical-align: middle;text-align: center;"><b>STOP DURATION (seconds)</b></th></tr></thead><tbody>';


            var count = 0;
            var transfer_stop_linked_array = [];

            if (serviceLegResult.length != 0) {
                resultSet.each(function(searchResult_serviceLeg) {
                    var service_leg_id = searchResult_serviceLeg.getValue("internalid");
                    var service_leg_name = searchResult_serviceLeg.getValue("name");
                    var service_leg_number = searchResult_serviceLeg.getValue("custrecord_service_leg_number");
                    var service_leg_transfer_type = searchResult_serviceLeg.getValue("custrecord_service_leg_trf_type");
                    var service_leg_transfer_type_text = searchResult_serviceLeg.getText("custrecord_service_leg_trf_type");
                    var service_leg_linked_zee = searchResult_serviceLeg.getValue("custrecord_service_leg_trf_franchisee");
                    var service_leg_ncl = searchResult_serviceLeg.getValue("custrecord_service_leg_non_cust_location");
                    var service_leg_addr_id = searchResult_serviceLeg.getValue("custrecord_service_leg_addr");
                    var service_leg_postal = searchResult_serviceLeg.getValue("custrecord_service_leg_addr_postal");
                    var service_leg_addr1 = searchResult_serviceLeg.getValue("custrecord_service_leg_addr_subdwelling");
                    var service_leg_addr2 = searchResult_serviceLeg.getValue("custrecord_service_leg_addr_st_num_name");
                    var service_leg_city = searchResult_serviceLeg.getValue("custrecord_service_leg_addr_suburb");
                    var service_leg_state = searchResult_serviceLeg.getValue("custrecord_service_leg_addr_state");
                    var service_leg_zip = searchResult_serviceLeg.getValue("custrecord_service_leg_addr_postcode");
                    var service_leg_lat = searchResult_serviceLeg.getValue("custrecord_service_leg_addr_lat");
                    var service_leg_lon = searchResult_serviceLeg.getValue("custrecord_service_leg_addr_lon");
                    var service_leg_type = searchResult_serviceLeg.getValue("custrecord_service_leg_type");
                    var service_leg_location_type = searchResult_serviceLeg.getValue("custrecord_service_leg_location_type");
                    var service_leg_location_type_text = searchResult_serviceLeg.getText("custrecord_service_leg_location_type");
                    var service_leg_duration = searchResult_serviceLeg.getValue("custrecord_service_leg_duration");
                    var service_leg_notes = searchResult_serviceLeg.getValue("custrecord_service_leg_notes");
                    var service_leg_transfer_stop_linked = searchResult_serviceLeg.getValue("custrecord_service_leg_trf_linked_stop");
                    var service_leg_trf_leg = searchResult_serviceLeg.getValue("custrecord_service_leg_trf_leg");
    
                    if (!isNullorEmpty(service_leg_transfer_stop_linked) && service_leg_trf_leg == 1) {
                        transfer_stop_linked_array[transfer_stop_linked_array.length] = service_leg_transfer_stop_linked;
                    }
    
                    inlineQty += '<tr>';
    
                    if (isNullorEmpty(service_leg_transfer_type)) {
    
                        inlineQty += '<td class="first_col"><button class="btn btn-warning btn-sm edit_stop glyphicon glyphicon-pencil" type="button" data-toggle="tooltip" data-placement="right" title="Edit Stop" data-newstop="' + (count + 1) + '" data-oldstop="' + service_leg_id + '"></button> <button class="btn btn-danger btn-sm delete_stop glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete Stop" data-oldstop="' + service_leg_id + '" data-newstop="' + (count + 1) + '"></button><input type="hidden" class="delete_stop_input" value="F" data-stopid="' + service_leg_id + '" /> <button class="btn btn-default btn-sm move_up glyphicon glyphicon-arrow-up" type="button" data-toggle="tooltip" data-placement="right" title="Move Up"></button><button class="btn btn-default btn-sm move_down glyphicon glyphicon-arrow-down" type="button" data-toggle="tooltip" data-placement="right" title="Move Down"></button></td>';
                    } else {
                        inlineQty += '<td class="first_col"><input class="btn btn-warning btn-sm edit_stop" type="hidden"';
                        inlineQty += ' data-newstop="' + (count + 1) + '"data-oldstop="' + service_leg_id + '"></button><button class="btn btn-warning ';
                        inlineQty += 'btn-sm edit_transfer_stop glyphicon glyphicon-transfer" type="button" data-toggle="tooltip" data-placement="right"'; 
                        inlineQty += 'title="Edit Transfer Stop" data-newstop="' + (count + 1) + '" data-oldstop="' + service_leg_id + '"></button> <button class="btn btn-danger btn-sm delete_stop glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete Stop" data-oldstop="' + service_leg_id + '" data-newstop="' + (count + 1) + '"></button><input type="hidden" class="delete_stop_input" value="F" data-stopid="' + service_leg_id + '" /> <button class="btn btn-default btn-sm move_up glyphicon glyphicon-arrow-up" type="button" data-toggle="tooltip" data-placement="right" title="Move Up"></button><button class="btn btn-default btn-sm move_down glyphicon glyphicon-arrow-down" type="button" data-toggle="tooltip" data-placement="right" title="Move Down"></button></td>';
                    }
    
                    var display_html = '';
    
                    display_html += 'Stop Name: ' + service_leg_name + '\n';
                    if (!isNullorEmpty(service_leg_transfer_type)) {
                        display_html += 'Transfer Type: ' + service_leg_transfer_type_text + '\n';
                    }
    
                    display_html += 'Notes: ' + service_leg_notes;
    
                    inlineQty += '<td><textarea type="text" readonly class="form-control table_info" data-addresstype="' + service_leg_location_type + '"data-oldstop="' + service_leg_id + '" value="' + service_leg_location_type_text + '">' + display_html + '</textarea>';
    
                    inlineQty += '<input type="hidden" readonly class="form-control table_stop_name" data-oldvalue="' + service_leg_name + '" value="' + service_leg_name + '" data-customeraddressid="' + service_leg_addr_id + '" data-postbox="' + service_leg_postal + '" data-addr1="' + service_leg_addr1 + '" data-addr2="' +
                        service_leg_addr2 + '" data-city="' + service_leg_city + '" data-state="' + service_leg_state + '" data-zip="' + service_leg_zip + '" data-lat="' + service_leg_lat + '" data-lng="' + service_leg_lon + '" data-transfertype="' + service_leg_transfer_type + '"  data-linkedzee="' + service_leg_linked_zee + '" data-linkedstop="' + service_leg_transfer_stop_linked + '" data-storedzee="' + service_leg_linked_zee + '" data-ncl="' + service_leg_ncl + '" data-notes="' + service_leg_notes + '"/></td>';
    
                    inlineQty += '<td><input type="text" readonly class="form-control table_duration" data-oldstop="' + service_leg_duration + '" value="' + service_leg_duration + '" /></td>'
    
                    inlineQty += '</tr>';
    
                    count++;
                    return true;
                });
            } else {
                var default_array = default_leg_names.split(',');
                var min_stops = default_array.length;
                for (var i = 0; i < default_array.length; i++) {
                    inlineQty += '<tr><td class="first_col"><button class="btn btn-success btn-sm add_stop glyphicon glyphicon-log-out" type="button" data-toggle="tooltip" data-placement="right" title="Add Stop" data-newstop="' + (i + 1) + '"></button> <button class="btn btn-danger btn-sm delete_stop glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete Stop" data-oldstop="" data-newstop="' + (i + 1) + '"></button><input type="hidden" class="delete_stop_input" value="F" data-stopid="" /></td><td><textarea readonly class="form-control table_info">' + default_array[i] + '</textarea><input type="hidden" readonly class="form-control table_stop_name" value="' + default_array[i] + '"/></td><td><input type="text" readonly class="form-control table_duration" data-oldstop="" value="" /></td></tr>'
                }
            }

            inlineQty += '<tr><td class="first_col"><button type="button" class="btn btn-sm add_row glyphicon glyphicon-plus" value="+" style="color: green;" data-toggle="tooltip" data-placement="right" title="Add Row" data-newstop="' + (i + 1) + '" ></button></td><td><textarea type="text" readonly class="form-control table_info"></textarea><input type="hidden" readonly class="form-control table_stop_name" value="" /></td><td><input type="text" readonly class="form-control table_duration" data-oldstop="" value="" /></td></tr>';
            inlineQty += '</tbody>';
            inlineQty += '</table></div></div></div></form><br/>';


            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlineQty;


            transfer_stop_linked_array = transfer_stop_linked_array.join();
            log.debug({
                title: 'transfer_stop_linked_array',
                details: transfer_stop_linked_array
            });

            form.addField({
                id: 'custpage_transfer_stop_linked',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = transfer_stop_linked_array;
            
            form.addSubmitButton({
                label : 'Submit & Next'
            });

            form.addButton({
                id : 'back',
                label : 'Back',
                functionName : 'onclick_back()'
            });

            form.addButton({
                id : 'back',
                label : 'Reset',
                functionName : 'onclick_reset()'
            });

            form.addButton({
                id : 'main_page',
                label : 'Back to Main Page',
                functionName : 'onclick_mainpage()'
            });


            /**
             * CREATE 2.0 CL SCRIPT AND SWITCH ID
             */
            form.clientScriptFileId = 2188514;
            context.response.writePage(form);


        } else {
            log.debug({
                title: 'SENT',
            });
            var status_id = context.request.parameters.status_id;

            var customer_id = context.request.parameters.custpage_customer_id;
            var service_id = context.request.parameters.custpage_service_id;
            var freq_edited = context.request.parameters.custpage_freq_edited;
            var stored_zee = context.request.parameters.custpage_stored_zee;
            var linked_zee = context.request.parameters.custpage_linked_zee;
            var freq_created = context.request.parameters.custpage_freq_created;
            var freq_created_zees = context.request.parameters.custpage_freq_created_zees;
            var deleted_stop_string = context.request.parameters.custpage_deleted_stop;
            var deleted_linked_zee_string = context.request.parameters.custpage_deleted_linked_zee;
            var deleted_message_string = context.request.parameters.custpage_deleted_message;
            var suitletid = context.request.parameters.custpage_suitlet;
            var deploy = context.request.parameters.custpage_deploy;
            var zee_response = context.request.parameters.custpage_zee;
    
            var updated_stop_string = request.getParameter('custpage_updated_stop');
            var old_stop_string = request.getParameter('custpage_old_stop');
            var updated_stop_zee_string = request.getParameter('custpage_updated_stop_zee');

            // var new_service_leg_id_string = request.getParameter('new_service_leg_id_string');
            // var zee = request.getParameter('custpage_zee');

            var transfer_string = context.request.parameters.transfer_string;
            var transfer_array = transfer_string.split(',');
            var transfer_zee_string = context.request.parameters.transfer_zee_string;
            var transfer_zee_array = transfer_zee_string.split(',');
            var stop_string = context.request.parameters.stop_string;
            var stop_array = stop_string.split(',');

            log.debug({
                title: 'deleted_stop_string',
                details: deleted_stop_string
            });

            log.debug({
                title: 'deleted_linked_zee_string',
                details: deleted_linked_zee_string
            });

            log.debug({
                title: 'updated_stop_string',
                details: updated_stop_string
            });

            log.debug({
                title: 'old_stop_string',
                details: old_stop_string
            });

            log.debug({
                title: 'updated_stop_zee_string',
                details: updated_stop_zee_string
            });


            log.debug({
                title: 'zee_response',
                details: zee_response
            });


            log.debug({
                title: 'stop_array',
                details: stop_array
            });


            log.debug({
                title: 'transfer_zee_array',
                details: transfer_zee_array
            });
            

            log.debug({
                title: 'transfer_array',
                details: transfer_array
            });
            
            if (!isNullorEmpty(updated_stop_zee_string) && !isNullorEmpty(updated_stop_string) && !isNullorEmpty(old_stop_string)) {

                var updated_stop_zee = updated_stop_zee_string.split(',');
                var updated_stop = updated_stop_string.split('|');
                var old_stop = old_stop_string.split('|');
    
                for (var i = 0; i < updated_stop_zee.length; i++) {
                    var zee_record = record.load({
                        type: record.Type.PARTNER,
                        id: updated_stop_zee[i],
                        isDynamic: true
                    });
                    
                    var zee_email = zee_record.getValue({
                        fieldId: 'email'
                    });
                    
                    log.debug({
                        title: 'zee_email',
                        details: zee_email
                    })

                    email.send({
                        author: 409635,
                        body: 'Old Stop: ' + old_stop[i] + ' New Stop: ' + updated_stop[i],
                        recipients: zee_email,
                        subject: 'Service Leg Stop Updation',
                    });
    
                }
    
            }

            if (!isNullorEmpty(deleted_stop_string) && !isNullorEmpty(deleted_linked_zee_string)) {

                var deleted_stop_array = deleted_stop_string.split(',');
                var deleted_linked_zee_email = deleted_linked_zee_string.split(',');
                var deleted_message = deleted_message_string.split(',');
    
                for (var i = 0; i < deleted_stop_array.length; i++) {
                    var service_leg_record = record.load({
                        type: 'customrecord_service_leg',
                        id: deleted_stop_array[i],
                    });

                    var deleted_stop_customer = service_leg_record.getValue({
                        fieldId: 'custrecord_service_leg_customer'
                    }); 
                    

                    var deleted_stop_customer_text = service_leg_record.getText({
                        fieldId: 'custrecord_service_leg_customer'
                    });
                    

                    var deleted_stop_service = service_leg_record.getValue({
                        fieldId: 'custrecord_service_leg_service'
                    }); 
                    

                    var deleted_stop_service_text = service_leg_record.getText({
                        fieldId: 'custrecord_service_leg_service'
                    }); 
                    

                    var deleted_stop_name = service_leg_record.getValue({
                        fieldId: 'name'
                    }); 
                    
    
                    var message = '';
                    message += "Customer:  <a href ='https://1048144.app.netsuite.com/app/common/entity/custjob.nl?id=" + deleted_stop_customer + "'>" + deleted_stop_customer_text + "</a></br>";
                    message += "----------------------------------------------------------------------------------</br>";
                    message += "Service: " + deleted_stop_service_text + "</br>";
                    message += "----------------------------------------------------------------------------------</br>";
                    message += 'The Transfer Stop has been deleted by the Owner Franchisee';
    
                    var zee_record = record.load({
                        type: record.Type.PARTNER,
                        id: deleted_linked_zee_email[i],
                        isDynamic: true,
                    });
                    
                    
                    var zee_email = zee_record.getValue({
                        fieldId: 'email'
                    }); 
    
                    log.debug({
                        title: 'zee_email',
                        details: zee_email
                    })
                    email.send({
                        author: 409635,
                        body: message,
                        recipients: zee_email,
                        subject: 'Service Leg Deletetion',
                    });

                }
            }

            
            for (i = 0; i < stop_array.length; i++) {
                var stop_id = stop_array[i];
                log.debug({
                    title: 'stop_id',
                    details: stop_id
                });

                log.debug({
                    title: 'parseInt(zee_response)',
                    details: parseInt(zee_response)
                })

                var leg_record = record.load({
                    type: 'customrecord_service_leg',
                    id: stop_id,
                    isDynamic: true,
                });
                
                leg_record.setValue({
                    fieldId: 'custrecord_service_leg_franchisee',
                    value: parseInt(zee_response),
                });
                
                leg_record.setValue({
                    fieldId: 'custrecord_service_leg_number',
                    value: (i + 1),
                });
                

                if (!isNullorEmpty(transfer_array)) {
                    for (var y = 0; y < transfer_array.length; y++) {
                        log.debug({
                            title: 'transfer_array[y] + 1',
                            details: parseInt(transfer_array[y]) + 1
                        });


                        if (i > parseInt(transfer_array[y])) {
                            log.debug({
                                title: 'after transfer',
                            });

                            leg_record.setValue({
                                fieldId: 'custrecord_service_leg_franchisee',
                                value: transfer_zee_array[y],
                            });
                            
                        }
                        var trfLinkStopVal = leg_record.getValue({
                            fieldId: 'custrecord_service_leg_trf_linked_stop'
                        });
                        if (!isNullorEmpty(trfLinkStopVal)) {
                            var linked_stop = leg_record.getValue({
                                fieldId: 'custrecord_service_leg_trf_linked_stop'
                            });
                            
                            var linked_stop_record = record.load({
                                type: 'customrecord_service_leg',
                                id: linked_stop,
                            });
                            

                            linked_stop_record.setValue({
                                fieldId: 'custrecord_service_leg_franchisee',
                                value: transfer_zee_array[y],
                            });
                            
                            linked_stop_record.setValue({
                                fieldId: 'custrecord_service_leg_trf_franchisee',
                                value: parseInt(zee_response),
                            });
                            

                            linked_stop_record.setValue({
                                fieldId: 'custrecord_service_leg_number',
                                value: (i + 1),
                            });
                            
                            leg_record.setValue({
                                fieldId: 'custrecord_service_leg_trf_franchisee',
                                value: transfer_zee_array[y],
                            });
                            
                            linked_stop_record.save({
                                enableSourcing: true,
                            });
                        }
                    }
                }

                leg_record.save({
                    enableSourcing: true,
                });
            }

            var params = {
                customerid: customer_id,
                serviceid: service_id,
                scriptid: 'customscript_sl_rp_create_stops',
                deployid: 'customdeploy_sl_rp_create_stops',
                zee: zee_response
            };
    
    
            log.debug({
                title: 'params',
                details: params
            });

            redirect.toSuitelet({
                scriptId: 'customscript_sl_schedule_service',
                deploymentId: 'customdeploy_sl_schedule_service',
                parameters: params
            });

        }
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }
    
    return {
        onRequest: onRequest
    };

});