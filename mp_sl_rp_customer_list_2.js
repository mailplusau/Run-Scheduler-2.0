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
        zee = runtime.getCurrentUser();
    }  else if (role == 3) { //Administrator
        zee = 6; //test
    } else if (role == 1032) { // System Support
        zee = 425904; //test-AR
    }

    function onRequest(context) {  
        
        if (context.request.method === 'GET') {
            var form = ui.createForm({
                title: 'Run Scheduler - Customer List View'
            });

            var inlineQty = '';
            var inlinehtml2 = '';

            inlinehtml2 += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://1048144.app.netsuite.com/core/media/media.nl?id=23926';
            inlinehtml2 += '06&c=1048144&h=a4ffdb532b0447664a84&_xt=.css"/><script type="text/javascript"  src="https://cdn.datatables.net/v/dt/dt-1.10.18/datatables.min.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

            inlinehtml2 += '<div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Service Summary</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

            inlinehtml2 += '<div class="se-pre-con"></div><button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
            inlinehtml2 += '<ul><li><input type="button" class="btn-xs" style="background-color: #337ab7; color: white;" disabled value="Save changes" /> - <ul><li>Click to save changes if you delete, inactivate or activate any Service.</li></ul></li>'
            inlinehtml2 += '<li>Functionalities available on the Customer listing/table:<ul><li><b>Sort</b><ul><li>Click on column headers to sort customer list according to the values in the columns. This is default to "Customer Name".</li><li>Hold "Shift" and click another column to sort according to multiple columns.</li></ul></li><li><b>Search</b><ul><li>You can search for specific customer by typing into the "Search" field</li></ul></li></ul></li><li>Clickable Actions available per customer:</li>';
            inlinehtml2 += '<ul><li><button type="button" class="btn-xs btn-success " disabled ><span class="span_class glyphicon glyphicon-plus"></span></button> - <ul><li>Click to outline the Service(s) and Price(s) for each customer.</li></ul></li>';
            inlinehtml2 += '<li><input type="button" class="btn-xs btn-info" disabled value="2 SUSPENDED SERVICES" /> - <ul><li>Gives the number of Services that are temporarily suspended, if the Customer has any.</li></ul></li>';
            inlinehtml2 += '<li><button type="button" class="btn-xs btn-secondary" disabled><span class="glyphicon glyphicon-eye-open"></span></button> - <ul><li>Click to see the Schedule of the Service : stop names, frequencies, times, run, notes...</li></ul></li>';
            inlinehtml2 += '<li><input type="button" class="btn-xs btn-danger" disabled value="SETUP STOP" /> - <ul><li>The Service for the Customer has not been scheduled. Click to Schedule the Service.</li></ul></li>';
            inlinehtml2 += '<li><input type="button" class="btn-xs btn-primary" disabled value="EDIT STOP" /> - <ul><li>Click to Edit the Schedule of the Service.</li></ul></li>';
            inlinehtml2 += '<li><input type="button" class="btn-xs btn-danger" disabled value="DELETE STOP" /> - <ul><li>Click to delete the Service from your run. It will no longer appear on the calendar and app.</li></ul></li>';
            inlinehtml2 += '<li><input type="button" class="btn-xs btn-secondary" disabled value="INACTIVATE" />/<input type="button" class="btn-xs btn-secondary" disabled value="ACTIVATE" /> - <ul><li>Shows INACTIVATE if the Service is currently performed and ACTIVATE if the Service is currently suspended</li><li>Click INACTIVATE to suspend the Service temporarily. It will no longer appear on the calendar and app.</li><li>Click ACTIVATE to set it back to the run as it was before the suspension</li></ul></li></li></ul></div>';

            

            //If role is Admin or System Support, dropdown to select zee
            if (role != 1000) {

                inlinehtml2 += '<div class="col-xs-4 admin_section" style="width: 20%;left: 40%;position: absolute;"><b>Select Zee</b> <select class="form-control zee_dropdown" >';

                //WS Edit: Updated Search to SMC Franchisee (exc Old/Inactives)
                //Search: SMC - Franchisees
                var searched_zee = search.load({
                    id: 'customsearch_smc_franchisee',
                    type: 'partner'
                });
                
                var resultSet_zee = searched_zee.run();

                var count_zee = 0;

                var zee_id;

                inlinehtml2 += '<option value=""></option>'

                resultSet_zee.each(function(searchResult_zee) {
                    zee_id = searchResult_zee.getValue('internalid');
                    // WS Edit: Updated entityid to companyname
                    zee_name = searchResult_zee.getValue('companyname');

                    if (context.request.parameters.zee == zee_id) {
                        inlinehtml2 += '<option value="' + zee_id + '" selected="selected">' + zee_name + '</option>';
                    } else {
                        inlinehtml2 += '<option value="' + zee_id + '">' + zee_name + '</option>';
                    }

                    return true;
                });

                inlinehtml2 += '</select></div>';
            }

            if (!isNullorEmpty(context.request.parameters.zee)) {
                zee = context.request.parameters.zee;
            }

            form.addField({
                id: 'zee',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = parseInt(zee);

    
            form.addField({
                id: 'custpage_html2',
                type: ui.FieldType.INLINEHTML,
                label: 'custpage_html2'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEABOVE
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlinehtml2;
            
            
            // form.addField('custpage_html2', 'inlinehtml').setPadding(1).setLayoutType('outsideabove').setDefaultValue(inlinehtml2);
    
            inlineQty += '<br><br><table border="0" cellpadding="15" id="customer" class="display tablesorter table table-striped" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th><b>SELECT</b></th><th><b>EDIT</b></th><th><b>ID</b></th><th><b>CUSTOMER NAME</b></th><th class=""><b>CUSTOMER SCHEDULED</b></th><th><b>SUSPENDED SERVICES</b></th></tr></thead>';
    
    
    
            /**
             * Description - Get the list of Customer that have Trial or Signed Status for a particular zee
             */

            inlineQty += '</table><br/>';

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlineQty;
            
            form.addField({
                id: 'custpage_remove_service',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });
                        
            form.addField({
                id: 'custpage_inactivate_service',
                type: ui.FieldType.TEXT,
                label: 'Service ID'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addButton({
                id : 'back',
                label : 'Calendar View',
                functionName : 'onclick_back()'
            });

            form.addSubmitButton({
                label : 'Save changes'
            });

            form.clientScriptFileId = 4597166; // SB = 2188375; PROD = 4597166
            context.response.writePage(form);
    

        } else {

            var zee = context.request.parameters.zee;
            var remove_id_string = context.request.parameters.custpage_remove_service;
            var remove_id_array = remove_id_string.split(',');
            var inactivate_id_string = context.request.parameters.custpage_inactivate_service;
            var inactivate_id_array = inactivate_id_string.split(',');

            log.debug({
                title: 'remove_id_array',
                details: remove_id_array
            });

            log.debug({
                title: 'inactivate_id_array',
                details: inactivate_id_array
            });

            log.debug({
                title: 'remove_id_array.length',
                details: remove_id_array.length
            });

            log.debug({
                title: 'inactivate_id_array.length',
                details: inactivate_id_array.length
            });


            for (y = 0; y < remove_id_array.length; y++) {
                var remove_service_id = remove_id_array[y];
                log.debug({
                    title: 'remove_service_id',
                    details: remove_service_id
                });

                if (isNullorEmpty(remove_service_id)) {
                    continue;
                }

                var serviceLegSearch = search.load({
                    id: 'customsearch_rp_leg_freq_all',
                    type: 'customrecord_service_leg'
                });


                serviceLegSearch.filters.push(search.createFilter({
                    name: 'internalid',
                    join: 'custrecord_service_leg_service',
                    operator: search.Operator.ANYOF,
                    values: remove_service_id
                }));
                
                serviceLegSearch.filters.push(search.createFilter({
                    name: 'isinactive',
                    operator: search.Operator.IS,
                    values: 'F'
                }));

                var resultSet = serviceLegSearch.run();
                var leg_toinactivate = [];
                var freq_toinactivate = [];
                var count = 0;
                var customer_id;
                resultSet.each(function(searchResult) {
                    if (count == 0) {
                        customer_id = searchResult.getValue("custrecord_service_leg_customer");
                    }
                    if (leg_toinactivate[leg_toinactivate.length - 1] != searchResult.getValue('internalid')) {
                        leg_toinactivate[leg_toinactivate.length] = searchResult.getValue('internalid');
                    }
                    freq_toinactivate[freq_toinactivate.length] = searchResult.getValue({
                        name: 'internalid',
                        join: 'CUSTRECORD_SERVICE_FREQ_STOP'
                    });
                    log.debug({
                        title: 'leg_toinactivate',
                        details: leg_toinactivate
                    });

                    log.debug({
                        title: 'freq_toinactivate',
                        details: freq_toinactivate
                    });

                    return true
                });

                for (i = 0; i < leg_toinactivate.length; i++) {
                    var leg_id = leg_toinactivate[i];
                    log.debug({
                        title: 'delete leg',
                        details: leg_id
                    });

                    var legRecord = record.load({
                        type: 'customrecord_service_leg',
                        id: leg_id,
                        isDynamic: true,
                    });
                    
                    legRecord.setValue({ fieldId: 'isinactive', value: 'T'});
                    legRecord.setValue({ fieldId: 'custrecord_service_leg_trf_linked_stop', value: null});
                    
                    legRecord.save({
                        enableSourcing: true,
                    });
                }

                for (i = 0; i < freq_toinactivate.length; i++) {
                    var freq_id = freq_toinactivate[i];
                    log.debug({
                        title: 'delete freq',
                        details: freq_id
                    });

                    var freqRecord = record.load({
                        type: 'customrecord_service_freq',
                        id: freq_id,
                    });
                    
                    freqRecord.setValue({ fieldId: 'isinactive', value: 'T' });
                    freqRecord.save({
                        enableSourcing: true,
                    });
                }

                var service_record = record.load({
                    type: 'customrecord_service',
                    id: remove_service_id,
                });
                
                service_record.setValue({ fieldId: 'custrecord_service_run_scheduled', value: 2 });

                service_record.save({
                    enableSourcing: true,
                });

                var customer_record = record.load({
                    type: record.Type.CUSTOMER,
                    id: customer_id,
                });
                
                customer_record.setValue({ fieldId: 'custentity_run_scheduled', value: 2 });
                customer_record.save({
                    enableSourcing: true,
                });

            }

            for (y = 0; y < inactivate_id_array.length; y++) {
                var inactivate_service_id = inactivate_id_array[y];
                if (isNullorEmpty(inactivate_service_id)) {
                    continue;
                }
                var service_record = record.load({
                    type: 'customrecord_service',
                    id: inactivate_service_id,
                });
                
                var show_on_app = service_record.getValue({ fieldId: 'custrecord_show_on_app' });
                if (isNullorEmpty(show_on_app) || show_on_app == 1) {
                    service_record.setValue({ fieldId: 'custrecord_show_on_app', value: 2 });
                } else if (show_on_app == 2) {
                    service_record.setValue({ fieldId: 'custrecord_show_on_app', value: 1 });
                }

                service_record.save({
                    enableSourcing: true,
                });
            }
            var params = {
                zee: parseInt(zee),
            }
            redirect.toSuitelet({
                scriptId: 'customscript_sl_rp_customer_list_2',
                deploymentId: 'customdeploy_sl_rp_customer_list_2',
                parameters: params
            })
        
        }
    }

    /**
     * [getDate description] - Function to get the current date
     * @return {[String]} [description] - Return the current date
     */
    // function getDate() {
    //     var date = new Date();
    //     if (date.getHours() > 6) {
    //         date = nlapiAddDays(date, 1);
    //     }
    //     date = nlapiDateToString(date);
    //     return date;
    // }

    function getDate() {
        var date = new Date();
        if (date.getHours() > 6) {
            date.setDate(date.getDate() + 1); 
        }

        format.format({
            value: date,
            type: format.Type.DATE,
            timezone: format.Timezone.AUSTRALIA_SYDNEY
        })

        return date;
    }

    function getStartDate() {
        var today = format.parse({value:getDate(), type: format.Type.DATE})

        var startdate = today.setDate(today.getDate() + 2);
        
        if (startdate.getDay() == 0) {
            startdate = startdate.setDate(startdate.getDate() + 1); 
        } else if (startdate.getDay() == 6) {
            startdate = startdate.setDate(startdate.getDate() + 2);
        }
        return format.format({
            value: startdate,
            type: format.Type.DATE,
            timezone: format.Timezone.AUSTRALIA_SYDNEY
        });
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }
    
    return {
        onRequest: onRequest
    };

});