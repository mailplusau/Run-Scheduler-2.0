/**
 * Module Description
 * 
 * NSVersion    Date                Author         
 * 1.00         2017-08-03 16:59:04 Ankith 
 *
 * Remarks: Page to show the list of all the customers based on the franchisee. To convert all the items listed in the financial tab into service records. Ability for the franchisee to cancel a customer as well.        
 * 
 * @Last Modified by:   ankith.ravindran
 * @Last Modified time: 2019-05-07 10:39:47
 *
 */


var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
    //Franchiseea
    zee = ctx.getUser();
} else if (role == 3) { //Administrator
    zee = 6; //test
} else if (role == 1032) { // System Support
    zee = 425904; //test-AR
}

var ctx = nlapiGetContext();

var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}



function main(request, response) {


    if (request.getMethod() == "GET") {

        var form = nlapiCreateForm('Run Scheduler - Customer List View');

        var inlineQty = '';
        var inlinehtml2 = '';

        inlinehtml2 += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2392606&c=1048144&h=a4ffdb532b0447664a84&_xt=.css"/><script type="text/javascript"  src="https://cdn.datatables.net/v/dt/dt-1.10.18/datatables.min.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';


        inlinehtml2 += '<div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Service Summary</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

        // inlineQty += '<ol class="breadcrumb" style="margin-left: 0px !important;position: absolute;">';
        // inlineQty += '<li>Run Scheduler</li>';
        // inlineQty += '<li class="active">Customer List</li>';
        // inlineQty += '</ol>';


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
            var searched_zee = nlapiLoadSearch('partner', 'customsearch_smc_franchisee');

            var resultSet_zee = searched_zee.runSearch();

            var count_zee = 0;

            var zee_id;

            inlinehtml2 += '<option value=""></option>'

            resultSet_zee.forEachResult(function(searchResult_zee) {
                zee_id = searchResult_zee.getValue('internalid');
                // WS Edit: Updated entityid to companyname
                zee_name = searchResult_zee.getValue('companyname');

                if (request.getParameter('zee') == zee_id) {
                    inlinehtml2 += '<option value="' + zee_id + '" selected="selected">' + zee_name + '</option>';
                } else {
                    inlinehtml2 += '<option value="' + zee_id + '">' + zee_name + '</option>';
                }

                return true;
            });

            inlinehtml2 += '</select></div>';
        }

        if (!isNullorEmpty(request.getParameter('zee'))) {
            zee = request.getParameter('zee');
        }

        form.addField('zee', 'text', 'zee').setDisplayType('hidden').setDefaultValue(parseInt(zee));

        form.addField('custpage_html2', 'inlinehtml').setPadding(1).setLayoutType('outsideabove').setDefaultValue(inlinehtml2);

        inlineQty += '<br><br><table border="0" cellpadding="15" id="customer" class="display tablesorter table table-striped" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th><b>SELECT</b></th><th><b>EDIT</b></th><th><b>ID</b></th><th><b>CUSTOMER NAME</b></th><th class=""><b>CUSTOMER SCHEDULED</b></th><th><b>SUSPENDED SERVICES</b></th></tr></thead>';



        /**
         * Description - Get the list of Customer that have Trial or Signed Status for a particular zee
         */

        // var zeeRecord = nlapiLoadRecord('partner', parseInt(zee));
        // var name = zeeRecord.getFieldValue('companyname');








        // inlineQty += '</tbody>';
        inlineQty += '</table><br/>';

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);
        form.addField('custpage_remove_service', 'text', 'Service ID').setDisplayType('hidden');
        form.addField('custpage_inactivate_service', 'text', 'Service ID').setDisplayType('hidden');

        form.addButton('back', 'Calendar View', 'onclick_back()');
        form.addSubmitButton('Save changes');
        form.setScript('customscript_cl_rp_customer_list');
        response.writePage(form);

    } else {
        var zee = request.getParameter('zee');
        var remove_id_string = request.getParameter('custpage_remove_service');
        var remove_id_array = remove_id_string.split(',');
        var inactivate_id_string = request.getParameter('custpage_inactivate_service');
        var inactivate_id_array = inactivate_id_string.split(',');

        nlapiLogExecution('DEBUG', 'remove_id_array', remove_id_array);
        nlapiLogExecution('DEBUG', 'inactivate_id_array', inactivate_id_array);
        nlapiLogExecution('DEBUG', 'remove_id_array.length', remove_id_array.length);
        nlapiLogExecution('DEBUG', 'inactivate_id_array.length', inactivate_id_array.length);


        for (y = 0; y < remove_id_array.length; y++) {
            var remove_service_id = remove_id_array[y];
            nlapiLogExecution('DEBUG', 'remove_service_id', remove_service_id);

            if (isNullorEmpty(remove_service_id)) {
                continue;
            }

            var serviceLegSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_leg_freq_all');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('internalid', 'custrecord_service_leg_service', 'anyof', remove_service_id);
            //newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_service_leg_franchisee', null, 'is', zee);
            newFilters[newFilters.length] = new nlobjSearchFilter('isinactive', null, 'is', 'F');

            serviceLegSearch.addFilters(newFilters);

            var resultSet = serviceLegSearch.runSearch();
            var leg_toinactivate = [];
            var freq_toinactivate = [];
            var count = 0;
            var customer_id;
            resultSet.forEachResult(function(searchResult) {
                if (count == 0) {
                    customer_id = searchResult.getValue("custrecord_service_leg_customer");
                }
                if (leg_toinactivate[leg_toinactivate.length - 1] != searchResult.getValue('internalid')) {
                    leg_toinactivate[leg_toinactivate.length] = searchResult.getValue('internalid');
                }
                freq_toinactivate[freq_toinactivate.length] = searchResult.getValue("internalid", "CUSTRECORD_SERVICE_FREQ_STOP", null);
                nlapiLogExecution('DEBUG', 'leg_toinactivate', leg_toinactivate);
                nlapiLogExecution('DEBUG', 'freq_toinactivate', freq_toinactivate);
                return true
            });

            for (i = 0; i < leg_toinactivate.length; i++) {
                var leg_id = leg_toinactivate[i];
                nlapiLogExecution('DEBUG', 'delete leg', leg_id);
                var legRecord = nlapiLoadRecord('customrecord_service_leg', leg_id);
                legRecord.setFieldValue('isinactive', 'T');
                legRecord.setFieldValue('custrecord_service_leg_trf_linked_stop', null);
                nlapiSubmitRecord(legRecord);
            }

            for (i = 0; i < freq_toinactivate.length; i++) {
                var freq_id = freq_toinactivate[i];
                nlapiLogExecution('DEBUG', 'delete freq', freq_id);
                var freqRecord = nlapiLoadRecord('customrecord_service_freq', freq_id);
                freqRecord.setFieldValue('isinactive', 'T');
                nlapiSubmitRecord(freqRecord);
            }

            var service_record = nlapiLoadRecord('customrecord_service', remove_service_id);
            service_record.setFieldValue('custrecord_service_run_scheduled', 2);
            nlapiSubmitRecord(service_record);

            var customer_record = nlapiLoadRecord('customer', customer_id);
            customer_record.setFieldValue('custentity_run_scheduled', 2);
            nlapiSubmitRecord(customer_record);
        }

        for (y = 0; y < inactivate_id_array.length; y++) {
            var inactivate_service_id = inactivate_id_array[y];
            if (isNullorEmpty(inactivate_service_id)) {
                continue;
            }
            var service_record = nlapiLoadRecord('customrecord_service', inactivate_service_id);
            var show_on_app = service_record.getFieldValue('custrecord_show_on_app');
            if (isNullorEmpty(show_on_app) || show_on_app == 1) {
                service_record.setFieldValue('custrecord_show_on_app', 2);
            } else if (show_on_app == 2) {
                service_record.setFieldValue('custrecord_show_on_app', 1);
            }
            nlapiSubmitRecord(service_record);
        }
        var params = {
            zee: parseInt(zee),
        }
        nlapiSetRedirectURL('SUITELET', 'customscript_sl_rp_customer_list', 'customdeploy_sl_rp_customer_list', null, params);
    }
}

/**
 * [getDate description] - Function to get the current date
 * @return {[String]} [description] - Return the current date
 */
function getDate() {
    var date = new Date();
    if (date.getHours() > 6) {
        date = nlapiAddDays(date, 1);
    }
    date = nlapiDateToString(date);
    return date;
}

function getStartDate() {
    var today = nlapiStringToDate(getDate());
    var startdate = nlapiAddDays(today, 2);
    if (startdate.getDay() == 0) {
        startdate = nlapiAddDays(startdate, 1)
    } else if (startdate.getDay() == 6) {
        startdate = nlapiAddDays(startdate, 2)
    }
    return nlapiDateToString(startdate);
}