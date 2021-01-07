/**
 * Module Description
 * 
 * NSVersion    Date                    Author         
 * 1.00         2018-03-08 17:07:24         Ankith 
 *
 * Description: Create a schedule for the service selected for each stop. Enter the frequency for the service as well as the service time, earliest time, latest tiome and the operator that performs the run.          
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2019-12-05 16:41:44
 *
 */
var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var ctx = nlapiGetContext();

var zee = 0;
var role = ctx.getRole();

if (role == 1000) {
    //Franchisee
    zee = ctx.getUser();
}

var service_time_array = [];
var earliest_time_array = [];
var latest_time_array = [];

function scheduleRun(request, response) {
    if (request.getMethod() == "GET") {

        var customer_id = request.getParameter('customerid');
        var service_id = request.getParameter('serviceid');
        zee = request.getParameter('zee');

        var custRecord = nlapiLoadRecord('customer', customer_id);
        var company_id = custRecord.getFieldValue('entityid');
        var company_name = custRecord.getFieldValue('companyname');

        var form = nlapiCreateForm('Schedule Service for ' + company_id + ' ' + company_name);


        var service_record = nlapiLoadRecord('customrecord_service', service_id);

        var service_name = service_record.getFieldValue('name');
        var service_price = service_record.getFieldValue('custrecord_service_price');

        var customerAddressSearch = nlapiLoadSearch('customer', 'customsearch_smc_address');

        var newFilters = new Array();
        newFilters[newFilters.length] = new nlobjSearchFilter('internalid', null, 'is', customer_id);

        customerAddressSearch.addFilters(newFilters);

        var resultSet_customerAddress = customerAddressSearch.runSearch();

        var serviceLegSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_leg_freq_all');

        var newFilters = new Array();
        newFilters[newFilters.length] = new nlobjSearchFilter('internalid', 'custrecord_service_leg_service', 'is', service_id);
        //newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_service_leg_franchisee', null, 'is', zee);
        newFilters[newFilters.length] = new nlobjSearchFilter('isinactive', null, 'is', 'F');

        serviceLegSearch.addFilters(newFilters);

        var resultSet = serviceLegSearch.runSearch();

        var old_stop_id;
        var old_freq_id;

        var stop_count = 0;
        var freq_id_count = 0;
        var freq_count = 0;
        var stop_freq_json = '{ "data": [';

        var transfer_stop_linked_array = [];
        var transfer_type_array = [];
        resultSet.forEachResult(function(searchResult) {
            var stop_id = searchResult.getValue('internalid');
            var stop_name = searchResult.getValue('name');
            var stop_duration = searchResult.getValue('custrecord_service_leg_duration');
            var stop_notes = searchResult.getValue('custrecord_service_leg_notes');
            var service_leg_ncl = searchResult.getValue("custrecord_service_leg_non_cust_location");
            var service_leg_addr_id = searchResult.getValue("custrecord_service_leg_addr");
            var transfer_type = searchResult.getValue("custrecord_service_leg_trf_type");
            var transfer_zee = searchResult.getValue("custrecord_service_leg_trf_franchisee");
            var transfer_stop_linked = searchResult.getValue("custrecord_service_leg_trf_linked_stop");
            var transfer_app_service_leg_no = searchResult.getValue("custrecord_service_leg_trf_leg");
            var operation_zee = searchResult.getValue("custrecord_service_leg_franchisee");
            var operation_zee_name = searchResult.getText("custrecord_service_leg_franchisee");
            var freq_id = searchResult.getValue("internalid", "CUSTRECORD_SERVICE_FREQ_STOP", null);
            var freq_mon = searchResult.getValue("custrecord_service_freq_day_mon", "CUSTRECORD_SERVICE_FREQ_STOP", null);
            var freq_tue = searchResult.getValue("custrecord_service_freq_day_tue", "CUSTRECORD_SERVICE_FREQ_STOP", null);
            var freq_wed = searchResult.getValue("custrecord_service_freq_day_wed", "CUSTRECORD_SERVICE_FREQ_STOP", null);
            var freq_thu = searchResult.getValue("custrecord_service_freq_day_thu", "CUSTRECORD_SERVICE_FREQ_STOP", null);
            var freq_fri = searchResult.getValue("custrecord_service_freq_day_fri", "CUSTRECORD_SERVICE_FREQ_STOP", null);
            var freq_adhoc = searchResult.getValue("custrecord_service_freq_day_adhoc", "CUSTRECORD_SERVICE_FREQ_STOP", null);
            var freq_time_current = searchResult.getValue("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", null);
            var freq_time_start = searchResult.getValue("custrecord_service_freq_time_start", "CUSTRECORD_SERVICE_FREQ_STOP", null);
            var freq_time_end = searchResult.getValue("custrecord_service_freq_time_end", "CUSTRECORD_SERVICE_FREQ_STOP", null);
            var freq_run_plan = searchResult.getValue("custrecord_service_freq_run_plan", "CUSTRECORD_SERVICE_FREQ_STOP", null);

            nlapiLogExecution('DEBUG', 'transfer_app_service_leg_no', transfer_app_service_leg_no);

            if (!isNullorEmpty(transfer_stop_linked) && transfer_app_service_leg_no == 1) {
                transfer_stop_linked_array[transfer_stop_linked_array.length] = transfer_stop_linked;
                transfer_type_array[transfer_type_array.length] = transfer_type;
            }

            if (stop_count == 0) {
                stop_freq_json += '{"stop_id": "' + stop_id + '",';
                stop_freq_json += '"stop_name": "' + stop_name + '",';
                stop_freq_json += '"stop_duration": "' + stop_duration + '",';
                stop_freq_json += '"stop_notes": "' + stop_notes + '",';
                stop_freq_json += '"stop_ncl_id": "' + service_leg_ncl + '",';
                stop_freq_json += '"stop_addr_id": "' + service_leg_addr_id + '",';
                stop_freq_json += '"transfer_type": "' + transfer_type + '",';
                stop_freq_json += '"transfer_stop_linked": "' + transfer_stop_linked + '",';
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
                    // stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                    // stop_freq_json += ']},';

                    // stop_freq_json += '{"stop_id": "' + stop_id + '_' + freq_id_count + '",';
                    // stop_freq_json += '"stop_name": "' + stop_name + '",';
                    // stop_freq_json += '"stop_duration": "' + stop_duration + '",';
                    // stop_freq_json += '"stop_notes": "' + stop_notes + '",';
                    // stop_freq_json += '"stop_ncl_id": "' + service_leg_ncl + '",';
                    // stop_freq_json += '"stop_addr_id": "' + service_leg_addr_id + '",';
                    // stop_freq_json += '"stop_freq": [';
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

                    stop_freq_json += '{"stop_id": "' + stop_id + '",';
                    stop_freq_json += '"stop_name": "' + stop_name + '",';
                    stop_freq_json += '"stop_duration": "' + stop_duration + '",';
                    stop_freq_json += '"stop_notes": "' + stop_notes + '",';
                    stop_freq_json += '"stop_ncl_id": "' + service_leg_ncl + '",';
                    stop_freq_json += '"stop_addr_id": "' + service_leg_addr_id + '",';
                    stop_freq_json += '"transfer_type": "' + transfer_type + '",';
                    stop_freq_json += '"transfer_stop_linked": "' + transfer_stop_linked + '",';
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

            nlapiLogExecution('DEBUG', 'stop_freq_json', stop_freq_json)

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

        nlapiLogExecution('DEBUG', 'stop_freq_json', stop_freq_json);

        var parsedStopFreq = JSON.parse(stop_freq_json);

        /*        var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');

                var newFilters_runPlan = new Array();
                newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'is', zee);*/




        var inlineQty = '';

        inlineQty += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.1/jquery.min.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script>';

        inlineQty += ' <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.css"><link rel="stylesheet" type="text/css" media="print" href="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.print.css"><script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js"></script><script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.9.0/fullcalendar.min.js"></script>';


        inlineQty += '<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/qtip2/3.0.3/jquery.qtip.min.css"><script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/qtip2/3.0.3/jquery.qtip.min.js"></script>'

        inlineQty += '<div class="se-pre-con"></div><div id="alert" class="alert alert-danger fade in"></div><div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document"><div class="modal-content" style="width: max-content;"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Information</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

        inlineQty += '<ol class="breadcrumb" style="margin-left: 0px !important;position: absolute;">';
        inlineQty += '<li>Run Scheduler</li>';
        inlineQty += '<li>Customer List</li>';
        inlineQty += '<li>Add / Edit Stops</li>';
        inlineQty += '<li class="active">Schedule Service</li>';
        inlineQty += '</ol>';


        inlineQty += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo" style ="margin-top: 40px;position: absolute">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute; margin-top:80px" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b><ul><li>This page is used to Schedule the Service for each Stop. Information required to be entered are <ul><li>Frequency of the Service</li><li>Time at which the Service is being performed currently</li><li>The Earliest and Latest time for each Stop</li><li>Select the Run associated with each stop</li></ul></li><ul></div>';


        inlineQty += '<div class="container" id="container" style="padding-top: 80px;" ng-app="">';


        inlineQty += '<div class="form-group container">';
        inlineQty += '<div class="row">';
        inlineQty += '<h4><span class="label label-primary">SERVICE DESCRIPTION</span></h4>';
        inlineQty += '</div>';
        inlineQty += '</div>';
        inlineQty += '<div class="form-group container service_descp_row ">';
        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-5 service_name_section"><div class="input-group"><span class="input-group-addon" id="descp_text">SERVICE NAME</span><input id="service_name" class="form-control service_name" readonly data-serviceid="' + service_id + '"value="' + service_name + '" /></div></div>';
        inlineQty += '<div class="col-xs-5 service_pprice_section"><div class="input-group"><span class="input-group-addon" id="descp_text">SERVICE PRICE | $</span><input id="descp" class="form-control service_price" readonly value="' + service_price + '" /></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container">';
        inlineQty += '<div class="row">';
        inlineQty += '<h4><span class="label label-primary">FREQUENCY</span></h4>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container daily_adhoc_info ">';
        var obj = parsedStopFreq.data[0];
        if (isNullorEmpty(obj)) {
            nlapiLogExecution('DEBUG', 'obj', obj)
            var freq_length = 0;
            var obj_freq = null;
        } else {
            nlapiLogExecution('DEBUG', 'obj', obj)
            var freq_length = obj['stop_freq'].length;
            var obj_freq = obj['stop_freq'];
        }

        var daily_checkbox = null;
        var monday_checkbox = null;
        var tuesday_checkbox = null;
        var wednesday_checkbox = null;
        var thursday_checkbox = null;
        var friday_checkbox = null;
        var adhoc_checkbox = null;

        nlapiLogExecution('DEBUG', 'freq_length', freq_length)

        if (freq_length == 5) {
            daily_checkbox = 'checked';
            monday_checkbox = 'checked';
            tuesday_checkbox = 'checked';
            wednesday_checkbox = 'checked';
            thursday_checkbox = 'checked';
            friday_checkbox = 'checked';
        } else {
            for (var y = 0; y < freq_length; y++) {
                if (obj_freq[y]['freq_mon'] == 'T') {
                    monday_checkbox = 'checked';
                }
                if (obj_freq[y]['freq_tue'] == 'T') {
                    tuesday_checkbox = 'checked';
                }
                if (obj_freq[y]['freq_wed'] == 'T') {
                    wednesday_checkbox = 'checked';
                }
                if (obj_freq[y]['freq_thu'] == 'T') {
                    thursday_checkbox = 'checked';
                }
                if (obj_freq[y]['freq_fri'] == 'T') {
                    friday_checkbox = 'checked';
                }

                if (monday_checkbox == 'checked' && tuesday_checkbox == 'checked' && wednesday_checkbox == 'checked' && thursday_checkbox == 'checked' && friday_checkbox == 'checked') {
                    daily_checkbox = 'checked';
                }

                if (obj_freq[y]['freq_adhoc'] == 'T') {
                    adhoc_checkbox = 'checked';
                }
            }
        }



        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-2 daily_section"><div class="input-group"><input type="text" readonly value="DAILY" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="daily" class=" daily" ' + daily_checkbox + ' /></span></div></div>';
        inlineQty += '<div class="col-xs-2 adhoc_section"><div class="input-group"><input type="text" readonly value="ADHOC" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox" id="adhoc" class=" adhoc" ' + adhoc_checkbox + '/></span></div></div>';
        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="form-group container frequency_info ">'

        inlineQty += '<div class="row">';
        inlineQty += '<div class="col-xs-2 monday_section"><div class="input-group"><input type="text" readonly value="M" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox"  id="monday" class=" monday" ' + monday_checkbox + '/></span></div></div>';
        inlineQty += '<div class="col-xs-2 tuesday_section"><div class="input-group"><input type="text" readonly value="T" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox"  id="tuesday" class=" tuesday" ' + tuesday_checkbox + '/></span></div></div>';
        inlineQty += '<div class="col-xs-2 wednesday_section"><div class="input-group"><input type="text" readonly value="W" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox"  id="wednesday" class=" wednesday" ' + wednesday_checkbox + '/></span></div></div>';
        inlineQty += '<div class="col-xs-2 thursday_section"><div class="input-group"><input type="text" readonly value="Th" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox"  id="thursday" class=" thursday" ' + thursday_checkbox + '/></span></div></div>';
        inlineQty += '<div class="col-xs-2 friday_section"><div class="input-group"><input type="text" readonly value="F" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="checkbox"  id="friday" class=" friday" ' + friday_checkbox + '/></span></div></div>';


        inlineQty += '</div>';
        inlineQty += '</div>';

        inlineQty += '<div class="tabs" ><ul class="nav nav-tabs nav-justified" style="padding-top: 3%;">';
        var count = 0;

        var tab_content = '';

        var active_class = '';
        var stop_ids = [];

        nlapiLogExecution('DEBUG', 'parsedStopFreq', parsedStopFreq);
        nlapiLogExecution('DEBUG', 'parsedStopFreq.data.length', parsedStopFreq.data.length);

        for (var i = 0; i < parsedStopFreq.data.length; i++) {
            var obj = parsedStopFreq.data[i];

            if (i == 0) {
                /*                if (obj['stop_freq'].length > 1 && !isNullorEmpty(obj['transfer_type'])) {
                                    var obj_freq = obj['stop_freq'];
                                    //if (!isNullorEmpty(obj['transfer_type'])) {
                                    for (var y = 0; y < obj['stop_freq'].length; y++) {
                                        inlineQty += '<li role="presentation" class="active"><a href="#' + obj['stop_id'] + '" data-freq="' + obj_freq[y]['freq_id'] + '"  data-stopno="' + (y + (i + 1)) + '"><b>Stop ' + (i + 1) + ':</b> ' + obj['stop_name'] + '</a></li>';
                                    }
                                                        } else {
                                                            inlineQty += '<li role="presentation" class="active"><a href="#' + obj['stop_id'] + '" data-freq="" data-stopno="' + (i + 1) + '"><b>Stop ' + (i + 1) + ':</b> ' + obj['stop_name'] + '</a></li>';
                                                        }

                                } else {
                                    inlineQty += '<li role="presentation" class="active"><a href="#' + obj['stop_id'] + '" data-freq="" data-stopno="' + (i + 1) + '" style="background-color: rgb(50, 122, 183); color: white;"><b>Stop ' + (i + 1) + ':</b> ' + obj['stop_name'] + '</a></li>';
                                }*/
                inlineQty += '<li role="presentation" class="active"><a href="#' + obj['stop_id'] + '" data-freq="" data-stopno="' + (i + 1) + '" data-operationzee="' + obj['operation_zee'] + '" style="background-color: rgb(50, 122, 183); color: white;"><b>Stop ' + (i + 1) + ':</b> ' + obj['stop_name'] + '<span style="font-style: italic;"> (' + obj['operation_zee_name'] + ')</span></a></li>';
                active_class = 'active';
                nlapiLogExecution('DEBUG', 'active_class', active_class);
            } else {
                // inlineQty += '<li class="add_stop_li hide"><a href="#" class="add_stop_link hide" data-addstop="true">+ Add Stop</a></li>';
                /*                if (obj['stop_freq'].length > 1 && !isNullorEmpty(obj['transfer_type'])) {
                                    var obj_freq = obj['stop_freq'];
                                    nlapiLogExecution('DEBUG', 'obj[stop_freq]', obj['stop_freq']);
                                    //if (!isNullorEmpty(obj['transfer_type'])) {
                                    for (var y = 0; y < obj['stop_freq'].length; y++) {
                                        inlineQty += '<li role="presentation" class=""><a href="#' + obj['stop_id'] + '" data-freq="' + obj_freq[y]['freq_id'] + '"  data-stopno="' + (y + (i + 1)) + '"><b>Stop ' + (i + 1) + ':</b> ' + obj['stop_name'] + '</a></li>';
                                    }
                                    /*
                                                        } else {
                                                            inlineQty += '<li role="presentation" class="active"><a href="#' + obj['stop_id'] + '" data-freq="" data-stopno="' + (i + 1) + '"><b>Stop ' + (i + 1) + ':</b> ' + obj['stop_name'] + '</a></li>';
                                                        }
                                } else {
                                    inlineQty += '<li role="presentation" class=""><a href="#' + obj['stop_id'] + '" data-freq=""  data-stopno="' + (i + 1) + '"><b>Stop ' + (i + 1) + ':</b> ' + obj['stop_name'] + '</a></li>';
                                }*/
                inlineQty += '<li role="presentation" class=""><a href="#' + obj['stop_id'] + '" data-freq="" data-stopno="' + (i + 1) + '" data-operationzee="' + obj['operation_zee'] + '"><b>Stop ' + (i + 1) + ':</b> ' + obj['stop_name'] + '<span style="font-style: italic;"> (' + obj['operation_zee_name'] + ')</span></a></li>';
                active_class = '';
                nlapiLogExecution('DEBUG', 'active_class', active_class);

            }

            tab_content += '<div role="tabpanel" class="tab-pane ' + active_class + '" id="' + obj['stop_id'] + '">';

            tab_content += '<div class="form-group container stop_name_row ">';
            tab_content += '<div class="row">';
            tab_content += '<div class="col-xs-6 stop_name_section"><div class="input-group"><span class="input-group-addon" id="descp_text">STOP NAME</span>';


            tab_content += '<input id="stop_name" class="form-control stop_name" readonly data-stopid="' + obj['stop_id'] + '" type="text" value="' + obj['stop_name'] + '"/></div></div>';


            tab_content += '</div>';
            tab_content += '</div>';

            tab_content += '<div class="form-group container duration_row ">';
            tab_content += '<div class="row">';
            tab_content += '<div class="col-xs-6 duration_section"><div class="input-group"><span class="input-group-addon" id="descp_text">DURATION (seconds)</span><input id="duration" class="form-control duration" readonly value="' + obj['stop_duration'] + '" data-stopid="' + obj['stop_id'] + '"/></div></div>';
            tab_content += '</div>';
            tab_content += '</div>';

            tab_content += '<div class="form-group container notes_row ">';
            tab_content += '<div class="row">';
            tab_content += '<div class="col-xs-6 notes_section"><div class="input-group"><span class="input-group-addon" id="descp_text">NOTES</span><textarea id="notes" class="form-control notes" readonly value=""  rows="4" cols="50" data-stopid="' + obj['stop_id'] + '">' + obj['stop_notes'] + '</textarea></div></div>';
            tab_content += '</div>';
            tab_content += '</div>';

            var freq_length = obj['stop_freq'].length;
            var obj_freq = obj['stop_freq'];

            nlapiLogExecution('DEBUG', "obj['stop_freq'].length", obj['stop_freq'].length)

            if (freq_length == 1) { //same time everyday
                tab_content += '<div class="form-group container difference_row ">';
                tab_content += '<div class="row">';
                tab_content += '<div class="col-xs-6 difference_section"><div class="input-group"><input type="text" readonly value="DIFFERENT TIME FOR EACH DAY?" class="form-control input-group-addon"/> <span class="input-group-addon">';
                tab_content += '<input type="checkbox" id="different_each_day" class="different_each_day" data-stopno="' + (i + 1) + '" data-freqid="' + obj_freq[0]['freq_id'] + '" data-stopid="' + obj['stop_id'] + '" data-operationzee="' + obj['operation_zee'] + '" />';
                tab_content += '</span></div></div>';
                tab_content += '</div>';
                tab_content += '</div>';

                tab_content += '<div class="form-group container run_row' + obj['stop_id'] + ' ">';
                tab_content += '<div class="row">';
                tab_content += '<div class="col-xs-6 run_section"><div class="input-group"><span class="input-group-addon" id="run_text">SELECT RUN</span><select id="run' + obj['stop_id'] + '" class="form-control run" data-stopid="' + obj['stop_id'] + '" data-oldrun="' + obj_freq[0]['freq_run_plan'] + '" data-freqid="' + obj_freq[0]['freq_id'] + '"><option value="0"></option>';
                var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');

                var newFilters_runPlan = new Array();
                newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'is', obj['operation_zee']);
                runPlanSearch.addFilters(newFilters_runPlan);

                var resultSet_runPlan = runPlanSearch.runSearch();
                resultSet_runPlan.forEachResult(function(searchResult_runPlan) {

                    //nlapiLogExecution('DEBUG', 'obj_freq[0][freq_run_plan]', obj_freq[0]['freq_run_plan']);
                    if (obj_freq[0]['freq_run_plan'] == searchResult_runPlan.getValue('internalid')) {
                        tab_content += '<option value="' + searchResult_runPlan.getValue('internalid') + '" selected>' + searchResult_runPlan.getValue('name') + '</option>'
                    } else {
                        tab_content += '<option value="' + searchResult_runPlan.getValue('internalid') + '">' + searchResult_runPlan.getValue('name') + '</option>'
                    }

                    return true;
                });
                tab_content += '</select></div></div>';
                tab_content += '</div>';
                tab_content += '</div>';

                tab_content += '<div class="form-group container time_row' + obj['stop_id'] + ' ">';
                tab_content += '<div class="row">';
                tab_content += '<div class="col-xs-6 service_time_section"><div class="input-group"><span class="input-group-addon" id="service_time_text">SERVICE TIME</span><input id="service_time' + obj['stop_id'] + '" class="form-control service_time" type="time" data-stopid="' + obj['stop_id'] + '" data-oldtime="' + convertTo24Hour(obj_freq[0]['freq_time_current']) + '" value="' + convertTo24Hour(obj_freq[0]['freq_time_current']) + '" data-stopno="' + (i + 1) + '_' + 0 + '"/></div></div>';
                tab_content += '</div>';
                tab_content += '</div>';
                tab_content += '<div class="form-group container time_row' + obj['stop_id'] + ' ">';
                tab_content += '<div class="row">';
                tab_content += '<div class="col-xs-12 previous_service_time_section"><div class="col-xs-2"><button class="btn btn-sm btn-info" disabled>PREVIOUS TIMES</button></div>';
                tab_content += '<div class="col-xs-10">';
                if (!isNullorEmpty(obj['stop_ncl_id']) || !isNullorEmpty(obj['stop_addr_id'])) {
                    var serviceLegTimeSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_freq_time');

                    var newFiltersTime = new Array();
                    if (!isNullorEmpty(obj['stop_ncl_id'])) {
                        newFiltersTime[newFiltersTime.length] = new nlobjSearchFilter('custrecord_service_leg_non_cust_location', null, 'is', obj['stop_ncl_id']);
                    }
                    if (!isNullorEmpty(obj['stop_addr_id'])) {
                        newFiltersTime[newFiltersTime.length] = new nlobjSearchFilter('custrecord_service_leg_addr', null, 'is', obj['stop_addr_id']);
                    }


                    serviceLegTimeSearch.addFilters(newFiltersTime);

                    var resultSetTime = serviceLegTimeSearch.runSearch();

                    resultSetTime.forEachResult(function(searchResultTime) {

                        tab_content += '<div class="col-xs-1 service_time_section"><button type="button"  class="btn btn-sm btn-default service_time_button" data-stopid="' + obj['stop_id'] + '" data-time="' + convertTo24Hour(searchResultTime.getValue("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP")) + '" >' + convertTo24Hour(searchResultTime.getValue("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP")) + '</button></div>';
                        return true;
                    });

                }


                tab_content += '</div>';
                tab_content += '</div>';
                tab_content += '</div>';
                tab_content += '</div>';


                tab_content += '<div class="form-group container time_window_row' + obj['stop_id'] + ' ">';
                tab_content += '<div class="row">';
                tab_content += '<div class="col-xs-3 earliest_time_section"><div class="input-group"><span class="input-group-addon" id="earliest_time_text">EARLIEST TIME</span><input id="earliest_time' + obj['stop_id'] + '" class="form-control earliest_time" type="time" data-stopid="' + obj['stop_id'] + '" data-oldearliesttime="' + convertTo24Hour(obj_freq[0]['freq_time_start']) + '" value="' + convertTo24Hour(obj_freq[0]['freq_time_start']) + '" data-stopno="' + (i + 1) + '_' + 0 + '"/></div></div>';
                tab_content += '<div class="col-xs-3 latest_time_section"><div class="input-group"><span class="input-group-addon" id="latest_time_text">LATEST TIME</span><input id="latest_time' + obj['stop_id'] + '" class="form-control latest_time" type="time" data-stopid="' + obj['stop_id'] + '" data-oldlatesttime="' + convertTo24Hour(obj_freq[0]['freq_time_end']) + '" value="' + convertTo24Hour(obj_freq[0]['freq_time_end']) + '" data-stopno="' + (i + 1) + '_' + 0 + '"/></div></div>';
                tab_content += '</div>';
                tab_content += '</div>';
                tab_content += '<div class="form-group container time_window_row' + obj['stop_id'] + ' ">';
                tab_content += '<div class="row">';
                tab_content += '<div class="col-xs-12 previous_time_window_section"><div class="col-xs-2"><span class="btn btn-sm btn-info" disabled>PREVIOUS TIME WINDOWS</span></div>';
                tab_content += '<div class="col-xs-10">';
                if (!isNullorEmpty(obj['stop_ncl_id']) || !isNullorEmpty(obj['stop_addr_id'])) {
                    var serviceLegTimeWindowSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_freq_timewindows');

                    var newFiltersTimeWindow = new Array();
                    if (!isNullorEmpty(obj['stop_ncl_id'])) {
                        newFiltersTimeWindow[newFiltersTimeWindow.length] = new nlobjSearchFilter('custrecord_service_leg_non_cust_location', null, 'is', obj['stop_ncl_id']);
                    }
                    if (!isNullorEmpty(obj['stop_addr_id'])) {
                        newFiltersTimeWindow[newFiltersTimeWindow.length] = new nlobjSearchFilter('custrecord_service_leg_addr', null, 'is', obj['stop_addr_id']);
                    }


                    serviceLegTimeWindowSearch.addFilters(newFiltersTimeWindow);

                    var resultSetTimeWindow = serviceLegTimeWindowSearch.runSearch();

                    resultSetTimeWindow.forEachResult(function(searchResultTimeWindow) {

                        tab_content += '<div class="col-xs-2"><button type="button"  class="btn btn-sm btn-default service_time_window_button" data-stopid="' + obj['stop_id'] + '" data-timewindow="' + searchResultTimeWindow.getValue("formulatext", null, "GROUP") + '">' + searchResultTimeWindow.getValue("formulatext", null, "GROUP") + '</button></div>';
                        return true;
                    });

                }

                tab_content += '</div>';
                tab_content += '</div>';
                tab_content += '</div>';
                tab_content += '</div>';

                tab_content += '<table border="0" cellpadding="15" id="services' + obj['stop_id'] + '" class="table table-responsive table-striped services tablesorter hide" data-stopid="' + obj['stop_id'] + '" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr class="text-center">';

                /**
                 * DAYS OF WEEK ROW
                 */
                tab_content += '<th style="vertical-align: middle;text-align: center;"><b></b></th>';

                /**
                 * SELECT RUN ROW
                 */
                tab_content += '<th style="vertical-align: middle;text-align: center;"><b>SELECT RUN</b></th>';
                /**
                 * SERVICE TIME ROW
                 */
                tab_content += '<th style="vertical-align: middle;text-align: center;"><b>SERVICE TIME<span class=" glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';
                /**
                 * TIME WINDOW ROW
                 */

                tab_content += '<th style="vertical-align: middle;text-align: center;"><b>EARLIEST TIME <span class=" glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';

                tab_content += '<th style="vertical-align: middle;text-align: center;"><b>LATEST TIME <span class=" glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';

                tab_content += '</tr></thead><tbody>';
                tab_content += '<tr></tr>'
                tab_content += '</tbody></table>';
            } else { //different time each day
                tab_content += '<div class="form-group container difference_row ">';
                tab_content += '<div class="row">';
                tab_content += '<div class="col-xs-6 difference_section"><div class="input-group"><input type="text" readonly value="DIFFERENT FOR EACH DAY?" class="form-control input-group-addon"/> <span class="input-group-addon">';
                /*                if (!isNullorEmpty(obj['transfer_type'])) {
                                    tab_content += '<input type="checkbox" id="different_each_day" class=" different_each_day" data-stopno="' + (i + 1) + '" data-multifreq="T" data-stopid="' + obj['stop_id'] + '" />';
                                } else {
                                    tab_content += '<input type="checkbox" id="different_each_day" class=" different_each_day" data-stopno="' + (i + 1) + '" data-multifreq="T" data-stopid="' + obj['stop_id'] + '" checked/>';
                                }*/
                tab_content += '<input type="checkbox" id="different_each_day" class=" different_each_day" data-stopno="' + (i + 1) + '" data-multifreq="T" data-stopid="' + obj['stop_id'] + '" data-operationzee="' + obj['operation_zee'] + '" checked/>';


                tab_content += '</span></div></div>';
                tab_content += '</div>';
                tab_content += '</div>';
                /*                if (!isNullorEmpty(obj['transfer_type'])) {
                                    tab_content += '<div class="form-group container run_row' + obj['stop_id'] + ' ">';
                                    if (!isNullorEmpty(obj['transfer_zee'])) {
                                        newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'is', obj['transfer_zee']);
                                    }
                                } else {
                                    tab_content += '<div class="hide form-group container run_row' + obj['stop_id'] + ' ">';
                                }*/
                tab_content += '<div class="hide form-group container run_row' + obj['stop_id'] + ' ">';
                //for (var y = 0; y < freq_length; y++) {

                tab_content += '<div class="row">';
                tab_content += '<div class="col-xs-6 run_section"><div class="input-group"><span class="input-group-addon" id="run_text">SELECT RUN </span><select id="run' + obj['stop_id'] + '" class="form-control run" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj['stop_freq'] + '"><option value="0"></option>';
                var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');

                var newFilters_runPlan = new Array();
                newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'is', obj['operation_zee']);
                runPlanSearch.addFilters(newFilters_runPlan);

                var resultSet_runPlan = runPlanSearch.runSearch();
                resultSet_runPlan.forEachResult(function(searchResult_runPlan) {

                    //nlapiLogExecution('DEBUG', 'obj_freq[0][freq_run_plan]', obj_freq[0]['freq_run_plan']);
                    if (obj_freq[0]['freq_run_plan'] == searchResult_runPlan.getValue('internalid')) {
                        tab_content += '<option value="' + searchResult_runPlan.getValue('internalid') + '" selected>' + searchResult_runPlan.getValue('name') + '</option>'
                    } else {
                        tab_content += '<option value="' + searchResult_runPlan.getValue('internalid') + '">' + searchResult_runPlan.getValue('name') + '</option>'
                    }

                    return true;
                });
                tab_content += '</select></div></div></div>';
                //}
                tab_content += '</div>';

                /*                if (!isNullorEmpty(obj['transfer_type'])) {
                                    tab_content += '<div class="form-group container time_row' + obj['stop_id'] + ' ">';
                                } else {
                                    tab_content += '<div class="hide form-group container time_row' + obj['stop_id'] + ' ">';
                                }*/
                tab_content += '<div class="hide form-group container time_row' + obj['stop_id'] + ' ">';

                tab_content += '<div class="row">';
                tab_content += '<div class="col-xs-6 service_time_section"><div class="input-group"><span class="input-group-addon" id="service_time_text">SERVICE TIME</span><input id="service_time' + obj['stop_id'] + '" class="form-control service_time" type="time" data-stopid="' + obj['stop_id'] + '" data-stopno="' + (i + 1) + '" /></div></div>';
                tab_content += '</div>';
                tab_content += '</div>';

                /*                if (!isNullorEmpty(obj['transfer_type'])) {
                                    tab_content += '<div class="form-group container time_window_row' + obj['stop_id'] + ' ">';
                                } else {
                                    tab_content += '<div class="hide form-group container time_window_row' + obj['stop_id'] + ' ">';
                                }*/
                tab_content += '<div class="hide form-group container time_window_row' + obj['stop_id'] + ' ">';


                tab_content += '<div class="row">';
                tab_content += '<div class="col-xs-3 earliest_time_section"><div class="input-group"><span class="input-group-addon" id="earliest_time_text">EARLIEST TIME</span><input id="earliest_time' + obj['stop_id'] + '" class="form-control earliest_time" type="time" data-stopid="' + obj['stop_id'] + '" data-stopno="' + (i + 1) + '" /></div></div>';
                tab_content += '<div class="col-xs-3 latest_time_section"><div class="input-group"><span class="input-group-addon" id="latest_time_text">LATEST TIME</span><input id="latest_time' + obj['stop_id'] + '" class="form-control latest_time" type="time" data-stopid="' + obj['stop_id'] + '" data-stopno="' + (i + 1) + '"/></div></div>';
                tab_content += '</div>';
                tab_content += '</div>';

                /*                if (!isNullorEmpty(obj['transfer_type'])) {


                                } else {*/
                /*                if (isNullorEmpty(obj['transfer_type'])) {*/

                tab_content += '<table border="0" cellpadding="15" id="services' + obj['stop_id'] + '" class="table table-responsive table-striped services tablesorter " data-stopid="' + obj['stop_id'] + '" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr class="text-center">';

                /**
                 * DAYS OF WEEK ROW
                 */
                tab_content += '<th style="vertical-align: middle;text-align: center;"><b></b></th>';

                /**
                 * SELECT RUN ROW
                 */
                tab_content += '<th style="vertical-align: middle;text-align: center;"><b>SELECT RUN</b></th>';
                /**
                 * SERVICE TIME ROW
                 */
                tab_content += '<th style="vertical-align: middle;text-align: center;"><b>SERVICE TIME<span class=" glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';
                /**
                 * TIME WINDOW ROW
                 */

                tab_content += '<th style="vertical-align: middle;text-align: center;"><b>EARLIEST TIME <span class=" glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';

                tab_content += '<th style="vertical-align: middle;text-align: center;"><b>LATEST TIME <span class=" glyphicon glyphicon-info-sign" style="padding: 3px 3px 3px 3px;color: orange;cursor: pointer;" data-whatever=""></span></b></th>';

                tab_content += '</tr></thead><tbody>';
                tab_content += '<tr></tr>';
                for (var y = 0; y < freq_length; y++) {

                    var run_selection_html = '';
                    var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');

                    var newFilters_runPlan = new Array();
                    newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'is', obj['operation_zee']);
                    runPlanSearch.addFilters(newFilters_runPlan);

                    var resultSet_runPlan = runPlanSearch.runSearch();
                    resultSet_runPlan.forEachResult(function(searchResult_runPlan) {

                        //nlapiLogExecution('DEBUG', 'obj_freq[0][freq_run_plan]', obj_freq[0]['freq_run_plan']);
                        if (obj_freq[0]['freq_run_plan'] == searchResult_runPlan.getValue('internalid')) {
                            run_selection_html += '<option value="' + searchResult_runPlan.getValue('internalid') + '" selected>' + searchResult_runPlan.getValue('name') + '</option>'
                        } else {
                            run_selection_html += '<option value="' + searchResult_runPlan.getValue('internalid') + '">' + searchResult_runPlan.getValue('name') + '</option>'
                        }

                        return true;
                    });
                    if (obj_freq[y]['freq_mon'] == 'T') {
                        tab_content += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '">MONDAY</td><td><select id="table_run" data-day="mon" class="form-control run"  data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldrun="' + obj_freq[y]['freq_run_plan'] + '"><option value="0"></option>';
                        tab_content += run_selection_html;
                        tab_content += '</select></td><td><input id="table_service_time" class="form-control service_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldtime="' + convertTo24Hour(obj_freq[y]['freq_time_current']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_current']) + '"/></td><td><input id="table_earliest_time" class="form-control earliest_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '"  data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldearliesttime="' + convertTo24Hour(obj_freq[y]['freq_time_start']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_start']) + '"/></td><td><input id="table_latest_time" class="form-control latest_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '"  data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldlatesttime="' + convertTo24Hour(obj_freq[y]['freq_time_end']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_end']) + '"/></td></tr>';

                    }

                    if (obj_freq[y]['freq_tue'] == 'T') {
                        tab_content += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '">TUESDAY</td><td><select id="table_run" data-day="tue" class="form-control run"  data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldrun="' + obj_freq[y]['freq_run_plan'] + '"><option value="0"></option>';
                        tab_content += run_selection_html;
                        tab_content += '</select></td><td><input id="table_service_time" class="form-control service_time" type="time"  data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldtime="' + convertTo24Hour(obj_freq[y]['freq_time_current']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_current']) + '"/></td><td><input id="table_earliest_time" class="form-control earliest_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldearliesttime="' + convertTo24Hour(obj_freq[y]['freq_time_start']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_start']) + '"/></td><td><input id="table_latest_time" class="form-control latest_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldlatesttime="' + convertTo24Hour(obj_freq[y]['freq_time_end']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_end']) + '"/></td></tr>';
                    }

                    if (obj_freq[y]['freq_wed'] == 'T') {
                        tab_content += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">WEDNESDAY</td><td><select id="table_run" data-day="wed" class="form-control run"  data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldrun="' + obj_freq[y]['freq_run_plan'] + '"><option value="0"></option>';
                        tab_content += run_selection_html;
                        tab_content += '</select></td><td><input id="table_service_time" class="form-control service_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldtime="' + convertTo24Hour(obj_freq[y]['freq_time_current']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_current']) + '"/></td><td><input id="table_earliest_time" class="form-control earliest_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldearliesttime="' + convertTo24Hour(obj_freq[y]['freq_time_start']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_start']) + '"/></td><td><input id="table_latest_time" class="form-control latest_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldlatesttime="' + convertTo24Hour(obj_freq[y]['freq_time_end']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_end']) + '"/></td></tr>';
                    }

                    if (obj_freq[y]['freq_thu'] == 'T') {
                        tab_content += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">THURSDAY</td><td><select id="table_run" data-day="thu" class="form-control run" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldrun="' + obj_freq[y]['freq_run_plan'] + '"><option value="0"></option>';
                        tab_content += run_selection_html;
                        tab_content += '</select></td><td><input id="table_service_time" class="form-control service_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldtime="' + convertTo24Hour(obj_freq[y]['freq_time_current']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_current']) + '"/></td><td><input id="table_earliest_time" class="form-control earliest_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldearliesttime="' + convertTo24Hour(obj_freq[y]['freq_time_start']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_start']) + '"/></td><td><input id="table_latest_time" class="form-control latest_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldlatesttime="' + convertTo24Hour(obj_freq[y]['freq_time_end']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_end']) + '"/></td></tr>';
                    }

                    if (obj_freq[y]['freq_fri'] == 'T') {
                        tab_content += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">FRIDAY</td><td><select id="table_run" data-day="fri" class="form-control run" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldrun="' + obj_freq[y]['freq_run_plan'] + '"><option value="0"></option>';
                        tab_content += run_selection_html;
                        tab_content += '</select></td><td><input id="table_service_time" class="form-control service_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldtime="' + convertTo24Hour(obj_freq[y]['freq_time_current']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_current']) + '"/></td><td><input id="table_earliest_time" class="form-control earliest_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldearliesttime="' + convertTo24Hour(obj_freq[y]['freq_time_start']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_start']) + '"/></td><td><input id="table_latest_time" class="form-control latest_time" type="time" data-stopno="' + (i + 1) + '_' + (y + 1) + '" data-stopid="' + obj['stop_id'] + '" data-freqid="' + obj_freq[y]['freq_id'] + '" data-oldlatesttime="' + convertTo24Hour(obj_freq[y]['freq_time_end']) + '" value="' + convertTo24Hour(obj_freq[y]['freq_time_end']) + '"/></td></tr>';

                    }

                }
                tab_content += '</tbody></table>';
                //}
            }



            tab_content += '</div>';


        }

        inlineQty += '</ul>';


        inlineQty += '<div class="tab-content" style="padding-top: 3%;">';

        inlineQty += tab_content;

        inlineQty += '</div></div>';

        form.addField('stop_ids', 'text', 'Stop IDs').setDisplayType('hidden').setDefaultValue(stop_ids.toString());
        form.addField('customer_id', 'text', 'Stop IDs').setDisplayType('hidden').setDefaultValue(customer_id);
        form.addField('service_id', 'text', 'Stop IDs').setDisplayType('hidden').setDefaultValue(service_id);
        form.addField('zee', 'text', 'zee').setDisplayType('hidden').setDefaultValue(zee);
        form.addField('delete_freq', 'text', 'Stop IDs').setDisplayType('hidden');
        form.addField('run', 'text', 'Stop IDs').setDisplayType('hidden');
        form.addField('freq_edited', 'text', 'Stop IDs').setDisplayType('hidden');

        transfer_stop_linked_array = transfer_stop_linked_array.join();
        transfer_type_array = transfer_type_array.join();
        form.addField('custpage_transfer_stop_linked', 'text', 'Service ID').setDisplayType('hidden').setDefaultValue(transfer_stop_linked_array);
        form.addField('custpage_transfer_type', 'text', 'Service ID').setDisplayType('hidden').setDefaultValue(transfer_type_array);

        form.addField('custpage_suitlet', 'textarea', 'Latitude').setDisplayType('hidden').setDefaultValue(request.getParameter('scriptid'));
        form.addField('custpage_deploy', 'textarea', 'Latitude').setDisplayType('hidden').setDefaultValue(request.getParameter('deployid'));

        inlineQty += '</div>'; //End of container

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('outsidebelow', 'startrow').setDefaultValue(inlineQty);


        form.addSubmitButton('SUBMIT');
        form.addButton('back', 'RESET', 'onclick_reset()');
        form.addButton('back', 'Back', 'onclick_back()');
        form.addButton('main_page', 'Back to Main Page', 'onclick_mainpage()');
        form.setScript('customscript_cl_schedule_service');

        response.writePage(form);
    } else {

        var delete_freq_string = request.getParameter('delete_freq');

        if (!isNullorEmpty(delete_freq_string)) {
            var delete_freq_array = delete_freq_string.split(',');

            for (var i = 0; i < delete_freq_array.length; i++) {
                var freq_record = nlapiLoadRecord('customrecord_service_freq', delete_freq_array[i]);

                freq_record.setFieldValue('isinactive', 'T');

                nlapiSubmitRecord(freq_record);
            }
        }

        var service_id = request.getParameter('service_id');
        var customer_id = request.getParameter('customer_id');
        var freq_edited = request.getParameter('freq_edited');
        var run_string = request.getParameter('run');
        var run_array = run_string.split(',');
        nlapiLogExecution('DEBUG', 'run_array', run_array);
        nlapiLogExecution('DEBUG', 'freq_edited', freq_edited);
        var customerScheduled = true;

        nlapiLogExecution('DEBUG', 'service_id', service_id);
        nlapiLogExecution('DEBUG', 'customer_id', customer_id);

        if (freq_edited == 'true') {
            nlapiLogExecution('DEBUG', 'updating service & customer');
            service_record = nlapiLoadRecord('customrecord_service', service_id);
            service_record.setFieldValue('custrecord_service_run_scheduled', 1);
            var multiple_operators = 2;
            for (i = 1; i < run_array.length; i++) {
                if (run_array[i] != run_array[i - 1]) {
                    multiple_operators = 1;
                    break;
                }
            }
            service_record.setFieldValue('custrecord_multiple_operators', multiple_operators);
            nlapiSubmitRecord(service_record);

            var serviceSearch = nlapiLoadSearch('customrecord_service', 'customsearch_rp_services');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_service_customer', null, 'is', customer_id);
            serviceSearch.addFilters(newFilters);
            var resultSetService = serviceSearch.runSearch();
            resultSetService.forEachResult(function(searchResult) {
                var scheduleRun = searchResult.getValue("custrecord_service_run_scheduled", null, "GROUP");
                nlapiLogExecution('DEBUG', 'scheduleRun', scheduleRun);
                if (scheduleRun == 2 || isNullorEmpty(scheduleRun)) {
                    customerScheduled = false;
                    return false;
                }
                return true;
            });
            nlapiLogExecution('DEBUG', 'customerScheduled', customerScheduled);
            if (customerScheduled == true) {
                var customer_record = nlapiLoadRecord('customer', customer_id);
                customer_record.setFieldValue('custentity_run_scheduled', 1);
                nlapiSubmitRecord(customer_record);
            }
        }

        var zee_response = request.getParameter('zee');
        zee_response = parseInt(zee_response);
        var params = {
            scriptid: 'customscript_sl_full_calendar',
            deployid: 'customdeploy_sl_full_calender',
            zee: zee_response
        }
        nlapiSetRedirectURL('SUITELET', 'customscript_sl_rp_customer_list', 'customdeploy_sl_rp_customer_list', null, params);

    }
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