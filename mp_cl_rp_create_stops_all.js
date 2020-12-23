/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
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

define(['N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/currentRecord', 'N/email'],
    function(runtime, search, url, record, format, currentRecord, email) { //require, factory
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
        }

        var currRecord = currentRecord.get();

        function startJQuery(){
            $(window).load(function() {
                // Animate loader off screen
                $(".se-pre-con").fadeOut("slow");;
            });
            
            var app = angular.module('myApp', []);
            app.controller('myCtrl', function($scope) {
            
            });

            $(document).on('click', '#create_new', function(e) {
                var params = {
                    custid: parseInt(currRecord.getValue({ fieldId: 'custpage_customer_id'})),
                    id: 'customscript_sl_rp_create_stops',
                    deploy: 'customdeploy_sl_rp_create_stops'
                };
                params = JSON.stringify(params);
                // var params2 = {
                // 	custparam_params: params
                // }
                console.log('inside create new ncl')
                // var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_create_new_ncl', 'customdeploy_sl_create_new_ncl') + '&custparam_params=' + params;
                var upload_url = baseURL + url.resolveScript({
                    deploymentId: 'customdeploy_sl_create_new_ncl',
                    scriptId: 'customscript_sl_create_new_ncl'
                }) + '&custparam_params=' + params
                window.open(upload_url, "_blank", "height=750,width=650,modal=yes,alwaysRaised=yes");
            });
        }

        function pageInit(){
            startJQuery();

            $('#alert').hide();

            $("#duration").durationPicker();
        
        
            var customer_id = currRecord.getValue({ fieldId: 'custpage_customer_id'});
            if (isNullorEmpty(customer_id)) {
                $('.durationpicker-container').addClass('hide');
            } else {
                var duration = secondsToHms(300);
        
                var split_duration = duration.split(',');
        
        
                var hours = parseInt(split_duration[0].split('h'));
                var minutes = parseInt(split_duration[1].split('m'));
                var seconds = parseInt(split_duration[2].split('s'));
        
        
                console.log(duration)
                $('#duration-hours').val(hours);
                $('#duration-minutes').val(minutes);
                $('#duration-seconds').val(seconds);
            }
        
        
            $(function() {
                $('[data-toggle="tooltip"]').tooltip()
            })

            jQuery();
        }

        function jQuery(){
            $(".service_time").focusout(function() {
                if (isNullorEmpty($(this).val())) {
                    showAlert('Please Enter the Time or Select AM/PM');
                    $(this).focus();
                    return false;
                } else {
                    var service_time = $(this).val();
                    service_time_array[service_time_array.length] = service_time;
                    console.log(convertTo24Hour(service_time, 'earliest'))
            
                    $('.earliest_time').val(convertTo24Hour(service_time, 'earliest'))
                    $('.latest_time').val(convertTo24Hour(service_time, 'latest'))
            
                }
            
            });
            
            $(document).on('click', '#alert .close', function(e) {
                $(this).parent().hide();
            });

            function showAlert(message) {
                $('#myModal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1" style="color: #e93578; ">Error!!</label></h4></div>');
                $('#myModal .modal-body').html("");
                $('#myModal .modal-body').html(message);
                $('#myModal').modal("show");
                // $('#alert').html('<button type="button" class="close">&times;</button>' + message);
                // $('#alert').show();
                // goToByScroll('alert');
                // setInterval(function() {
                // 	$("#alert .close").click();
                // }, 5000);
            }

            $(document).on('click', '#alert .close', function(e) {
                $(this).parent().hide();
            });
            
            $(document).on('click', '.instruction_button', function() {
                $(".container").css({
                    "padding-top": "150px"
                });
            
            });
            
            
            
            $('#exampleModal').on('show.bs.modal', function(event) {
                var button = $(event).relatedTarget // Button that triggered the modal
                var recipient = button.data('whatever') // Extract info from data-* attributes
                // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
                // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
                var modal = $(this)
                modal.find('.modal-title').text('New message to ' + recipient)
                modal.find('.modal-body input').val(recipient)
            });
            
            $(document).ready(function() {
                $(".modal_display").click(function() {
                    var link = $(this).data("whatever");
                    $('.modal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Information!!</label></h4></div>');
                    $('.modal .modal-body').html("");
                    $('.modal .modal-body').html(link);
                    $('.modal').modal("show");
            
            
                });
            });
            
            $(document).on('click', '.add_next_stop', function(e) {
                var $curRow = $(this).closest('tr');
                var currentRowNo = $(this).closest('tr').find('.add_stop').attr('data-newstop');
                var row_count = $('#services tbody > tr').length;
                console.log(row_count)
                var new_row = '<tr><td class="first_col"><button class="btn btn-success btn-sm add_row glyphicon glyphicon-plus" type="button" data-toggle="tooltip" data-placement="right" title="Add Row" data-newstop="' + (row_count + 1) + '"></button></td><td><textarea readonly class="form-control table_info"></textarea><input type="hidden" readonly class="form-control table_stop_name" /></td><td><input type="text" readonly class="form-control table_duration" data-oldstop="" value="" /></td></tr>';
            
                $curRow.after(new_row);
            });

            $(document).on('click', '.add_stop', function(e) {
                $('.address_type_row').removeClass('hide');
                $('.row_button').removeClass('hide');
                $('.edit_old_stop_section').addClass('hide');
                $('.add_new_stop_section').removeClass('hide');
                $('#add_new_stop').attr('data-rowid', $(this).attr('data-newstop'))
            });
            
            $(document).on('click', '.transfer_stop', function(e) {
                resetTransferQuestions();
                $('.address_type_row').removeClass('hide');
                $('.transfer_type_row').removeClass('hide');
                $('.zee_row').removeClass('hide');
                $('.zee_operator_row').removeClass('hide');
                $('.row_button').removeClass('hide');
                $('.edit_old_stop_section').addClass('hide');
                $('.add_new_stop_section').removeClass('hide');
                $('#add_new_stop').attr('data-rowid', $(this).attr('data-newstop'))
            });
            
            $(document).on('click', '.add_row', function(e) {
                // $('.address_type_row').removeClass('hide');
                // $('.row_button').removeClass('hide');
                // $('.edit_old_stop_section').addClass('hide');
                // $('.add_new_stop_section').removeClass('hide');
                // $('#add_new_stop').attr('data-rowid', $(this).attr('data-newstop'));
            
                $(this).closest('tr').find('.first_col').append(' <button class="btn btn-danger btn-sm delete_stop glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete Stop" data-oldstop="" data-newstop=""></button>');
            
                $(this).removeClass('glyphicon-plus');
                $(this).addClass('glyphicon-log-out');
                $(this).addClass('btn-success');
                $(this).addClass('add_stop');
                $(this).removeClass('add_row');
                $(this).removeAttr('style');
                $(this).attr('data-original-title', 'Add Stop');
                $(this).val(null);
                var $curRow = $(this).closest('tr');
                var currentRowNo = $(this).closest('tr').find('.add_stop').attr('data-newstop');
                var row_count = $('#services tbody > tr').length;
                console.log(row_count)
                var new_row = '<tr><td class="first_col"><button type="button" class="btn btn-sm add_row glyphicon glyphicon-plus" value="+" style="color: green;" data-toggle="tooltip" data-placement="right" title="Add Row" data-newstop="' + (row_count + 1) + '" ></button></td><td><textarea type="text" readonly class="form-control table_info"></textarea><input type="hidden" readonly class="form-control table_stop_name" value="" /></td><td><input type="text" readonly class="form-control table_duration" data-oldstop="" value="" /></td></tr>';
            
                $(function() {
                    $('[data-toggle="tooltip"]').tooltip()
                })
            
                $curRow.after(new_row);
            
                updateRowCount();
            });

            $(document).on('change', '.customer_row', function(e) {
                if ($('option:selected', this).val() > 1) {
                    var params = {
                        custid: parseInt($('option:selected', this).val()),
                        zee: parseInt(currRecord.getValue({ fieldId: 'custpage_zee'}))
                    };
                    params = JSON.stringify(params);
                    // var params2 = {
                    // 	custparam_params: params
                    // }
                    console.log('inside create new ncl')
                    var upload_url = baseURL + url.resolveScript({
                        deploymentId: 'customdeploy_sl_setup_stops',
                        scriptId: 'customscript_sl_setup_stops',
                    }) + '&custparam_params=' + params;
                    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
                }
            });
            
            $(document).on('change', '.customer_selected_class', function(e) {
                var zee = parseInt(currRecord.getValue({ fieldId: 'custpage_zee'}));
            
                if ($('option:selected', this).val() != 0) {
                    var customer_id = $('option:selected', this).val();
                    // var serviceSearch = nlapiLoadSearch('customrecord_service', 'customsearch_rp_services');
                    // var addFilterExpression = new Array();
                    // addFilterExpression[addFilterExpression.length] = new nlobjSearchFilter('custrecord_service_customer', null, 'anyof', customer_id);
                    // addFilterExpression[addFilterExpression.length] = new nlobjSearchFilter('custrecord_service_franchisee', null, 'anyof', zee);
                    // serviceSearch.addFilters(addFilterExpression);
                    // var resultSetCustomer = serviceSearch.runSearch();
                    var serviceSearch = search.load({ type: 'customrecord_service', id: 'customsearch_rp_services'});
                    var addFilterExpression_1 = search.createFilter({
                        name: 'custrecord_service_customer',
                        operator: search.Operator.ANYOF,
                        values: customer_id
                    });
                    var addFilterExpression_2 = search.createFilter({
                        name: 'custrecord_service_customer',
                        operator: search.Operator.ANYOF,
                        values: zee
                    });
                    serviceSearch.filters.push(addFilterExpression_1);
                    serviceSearch.filters.push(addFilterExpression_2);
                    var resultSetCustomer = serviceSearch.run();
            
                    var serviceId = [];
                    var serviceName = [];
                    var servicePrice = [];
            
                    resultSetCustomer.each(function(searchResult_service) {
                        var service_id = searchResult_service.getValue({ name: "internalid", join: null, summary: search.Summary.GROUP});
                        var service_name = searchResult_service.getText({ name: 'custrecord_service', join: null, summary: search.Summary.GROUP});
                        var service_leg_freq_count = searchResult_service.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_FREQ_SERVICE", summary: search.Summary.COUNT});
                        var service_leg_count = searchResult_service.getValue({ name: "internalid", join: "CUSTRECORD_SERVICE_LEG_SERVICE", summary: search.Summary.COUNT});
                        var service_price = searchResult_service.getValue({ name: "custrecord_service_price", join: null, summary: search.Summary.GROUP});
            
                        if (service_leg_count == 0) {
            
                            serviceId[serviceId.length] = service_id;
                            serviceName[serviceName.length] = service_name;
                            servicePrice[servicePrice.length] = service_price;
                        }
                        return true;
                    });
            
                    if (isNullorEmpty(serviceName) || isNullorEmpty(serviceId)) {
                        $(this).closest('tr').find('.service_selected_class').empty();
                    } else {
                        $(this).closest('tr').find('.service_selected_class').empty();
                        $(this).closest('tr').find('.service_selected_class').append($('<option></option>').val('0').html(' '));
                        for (var i = 0; i < serviceId.length; i++) {
                            $(this).closest('tr').find('.service_selected_class').append(
                                $('<option></option>').val(serviceId[i]).html(serviceName[i] + ' - $' + servicePrice[i])
                            );
                        }
            
                    }
                    $(this).closest('tr').find('.nsItemName').removeAttr("disabled");
                } else {
                    $(this).closest('tr').find('.nsItemName').attr("disabled", "disabled")
                }
            });

            $(document).on('click', '#daily', function() {
                if ($(this).is(':checked')) {
                    $(this).closest('tr').find('.monday').prop('disabled', true);
                    $(this).closest('tr').find('.tuesday').prop('disabled', true);
                    $(this).closest('tr').find('.wednesday').prop('disabled', true);
                    $(this).closest('tr').find('.thursday').prop('disabled', true);
                    $(this).closest('tr').find('.friday').prop('disabled', true);
                    $(this).closest('tr').find('.adhoc').prop('disabled', true);
                    $(this).closest('tr').find('.monday').prop('checked', true);
                    $(this).closest('tr').find('.tuesday').prop('checked', true);
                    $(this).closest('tr').find('.wednesday').prop('checked', true);
                    $(this).closest('tr').find('.thursday').prop('checked', true);
                    $(this).closest('tr').find('.friday').prop('checked', true);
                } else {
                    $(this).closest('tr').find('.monday').prop('disabled', false);
                    $(this).closest('tr').find('.tuesday').prop('disabled', false);
                    $(this).closest('tr').find('.wednesday').prop('disabled', false);
                    $(this).closest('tr').find('.thursday').prop('disabled', false);
                    $(this).closest('tr').find('.friday').prop('disabled', false);
                    $(this).closest('tr').find('.adhoc').prop('disabled', false);
                    $(this).closest('tr').find('.monday').prop('checked', false);
                    $(this).closest('tr').find('.tuesday').prop('checked', false);
                    $(this).closest('tr').find('.wednesday').prop('checked', false);
                    $(this).closest('tr').find('.thursday').prop('checked', false);
                    $(this).closest('tr').find('.friday').prop('checked', false);
                }
            
            });
            
            $(document).on('change', '.service_selected_class', function(e) {
                if ($('option:selected', this).val() != 0) {
                    var service_id = $('option:selected', this).val();
                    var service_record = record.load({ type: 'customrecord_service', id: service_id})
                    var mon = service_record.getValue({ fieldId: 'custrecord_service_day_mon'});
                    var tue = service_record.getValue({ fieldId: 'custrecord_service_day_tue'});
                    var wed = service_record.getValue({ fieldId: 'custrecord_service_day_wed'});
                    var thu = service_record.getValue({ fieldId: 'custrecord_service_day_thu'});
                    var fri = service_record.getValue({ fieldId: 'custrecord_service_day_fri'});
                    var adhoc = service_record.getValue({ fieldId: 'custrecord_service_day_adhoc'});
            
                    if (mon == 'T' &&
                        tue == 'T' &&
                        wed == 'T' &&
                        thu == 'T' &&
                        fri == 'T') {
                        $(this).closest('tr').find('.daily').prop('checked', true);
                    }
            
                    if (mon == 'T') {
                        $(this).closest('tr').find('.monday').prop('checked', true);
                    }
                    if (tue == 'T') {
                        $(this).closest('tr').find('.tuesday').prop('checked', true);
                    }
                    if (wed == 'T') {
                        $(this).closest('tr').find('.wednesday').prop('checked', true);
                    }
                    if (thu == 'T') {
                        $(this).closest('tr').find('.thursday').prop('checked', true);
                    }
                    if (fri == 'T') {
                        $(this).closest('tr').find('.friday').prop('checked', true);
                    }
                    if (adhoc == 'T') {
                        $(this).closest('tr').find('.adhoc').prop('checked', true);
                    }
            
                }
            });
            
            $(document).on('click', '.add_class', function(event) {
            
                var zee = currRecord.getValue({ field: 'custpage_zee'});
                var customer_id = currRecord.getValue({ field: 'custpage_customer_id'});
                var customerSearch = search.load({ type: 'customer', id: 'customsearch_smc_customer'});
                var addFilterExpression = search.createFilter({ name: 'partner', join: null, operator: search.Operator.ANYOF, values: zee});
                customerSearch.filters.push(addFilterExpression);
                var resultSetCustomer = customerSearch.run();
                
                var runPlanSearch = search.load({ type: 'customrecord_run_plan', id: 'customsearch_app_run_plan_active'});
                var newFilters_runPlan = search.createFilter({
                    name: 'custrecord_run_franchisee',
                    join: null,
                    operator: search.Operator.IS,
                    values: zee
                });
                runPlanSearch.filters.push(newFilters_runPlan);
                var resultSet_runPlan = runPlanSearch.run();

                var customer_name = $(this).closest('tr').find('.customer_selected_class').val();
                var service_selected = $(this).closest('tr').find('.service_selected_class').val();
                var run_selected = $(this).closest('tr').find('.run_selected_class').val();
            
            
                if (isNullorEmpty(customer_name) && isNullorEmpty(customer_id)) {
                    // alert('Please enter Package Name');
                    showAlert('Please Select Customer');
            
                    $(this).closest('tr').find('.customer_selected_class').focus();
                    return false;
                }
                if (service_selected == 0) {
                    // alert('Please enter Package Name');
                    showAlert('Please Select Service');
            
                    $(this).closest('tr').find('.service_selected_class').focus();
                    return false;
                }
            
                if (run_selected == 0) {
                    showAlert('Please Select Run');
            
                    $(this).closest('tr').find('.run_selected_class').focus();
                    return false;
                }
            
            
            
                var row_count = ($('#services tr').length - 2);
            
                row_count++;
            
                var inlineQty = '<tr><td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" type="button" data-toggle="tooltip" data-placement="right" title="Add New Package"></button><input type="hidden" class="delete_package" value="F" /></td><td><input type="text" value="' + row_count + '" class="form-control sequence" readonly /></td>';
                if (isNullorEmpty(customer_id)) {
                    inlineQty += '<td><select class="form-control customer_selected_class" name="customer_selected"><option value="0"></option>';
                    resultSetCustomer.forEachResult(function(searchResult) {
            
                        var custid = searchResult.getValue('internalid', null, "GROUP");
                        var entityid = searchResult.getValue('entityid', null, "GROUP");
                        var companyname = searchResult.getValue('companyname', null, "GROUP");
            
                        if (custid == customer_id) {
                            inlineQty += '<option value="' + custid + '" selected>' + entityid + ' ' + companyname + '</option>';
                        } else {
                            inlineQty += '<option value="' + custid + '">' + entityid + ' ' + companyname + '</option>';
                        }
            
            
                        return true;
                    });
                    inlineQty += '</select></td>';
                }
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
                resultSet_runPlan.forEachResult(function(searchResult_runPlan) {
            
                    inlineQty += '<option value="' + searchResult_runPlan.getValue('internalid') + '">' + searchResult_runPlan.getValue('name') + '</option>';
            
                    return true;
                });
                inlineQty += '</select></td>';
            
            
                $('#services tr:last').after(inlineQty);
            
                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_class add_class');
            
                $(this).closest('tr').find('.customer_selected_class').prop('disabled', function(i, v) {
                    return !v;
                });
                $(this).closest('tr').find('.service_selected_class').prop('disabled', function(i, v) {
                    return !v;
                });
                $(this).closest('tr').find('.run_selected_class').prop('disabled', function(i, v) {
                    return !v;
                });
                $(this).closest('tr').find('.service_leg').prop('disabled', function(i, v) {
                    return !v;
                });
            
            
            
                $(this).closest('tr').find('.first_col').append('<button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete"></button><br><button class="btn btn-primary btn-sm preview_row glyphicon glyphicon-new-window" type="button" data-toggle="tooltip" data-placement="right" title="Preview Invoice"></button>');
            
            });
            
            $(document).on('click', '.edit_class', function(event) {
            
                $(this).closest('tr').find('.customer_selected_class').prop('disabled', function(i, v) {
                    return !v;
                });
                $(this).closest('tr').find('.service_selected_class').prop('disabled', function(i, v) {
                    return !v;
                });
                $(this).closest('tr').find('.run_selected_class').prop('disabled', function(i, v) {
                    return !v;
                });
                $(this).closest('tr').find('.service_leg').prop('disabled', function(i, v) {
                    return !v;
                });
            
                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-ok');
            
            
            
            });
            
            $(document).on('change', '.address_type', function(e) {
                var customer_id = nlapiGetFieldValue('custpage_customer_id');
                if (!isNullorEmpty(customer_id)) {
            
                    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_setup_stops', 'customdeploy_sl_setup_stops');
                    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
                } else {
                    if ($('option:selected', this).val() == 1) {
                        $('.ncl_row').addClass('hide');
                        // $('.customer_address_row').removeClass('hide');
                        $('.customer_row').removeClass('hide');
                        $('.durationpicker-container').addClass('hide');
            
                        var duration = secondsToHms(300);
            
                        var split_duration = duration.split(',');
            
            
                        var hours = parseInt(split_duration[0].split('h'));
                        var minutes = parseInt(split_duration[1].split('m'));
                        var seconds = parseInt(split_duration[2].split('s'));
            
            
                        console.log(duration)
                        $('#duration-hours').val(hours);
                        $('#duration-minutes').val(minutes);
                        $('#duration-seconds').val(seconds);
            
                        $('.transfer_row').addClass('hide');
                        $('.duration_row').addClass('hide');
                        $('.notes_row').addClass('hide');
                        $('.stop_name_row').addClass('hide');
                        $('.stop_duration_row').addClass('hide');
                        $('.durationpicker-container').addClass('hide');
                        $('.service_time_row').addClass('hide');
                        $('.time_window_row').addClass('hide');
                        $('.table_row').addClass('hide');
                        $('.stop_notes_row').addClass('hide');
                    } else if ($('option:selected', this).val() == 2) {
                        $('.customer_address_row').addClass('hide');
                        $('.customer_row').addClass('hide');
                        $('.ncl_row').removeClass('hide');
                        $('.duration_row').removeClass('hide');
                        $('.notes_row').removeClass('hide');
                        $('.stop_name_row').removeClass('hide');
                        $('.stop_duration_row').removeClass('hide');
                        $('.durationpicker-container').removeClass('hide');
                        var duration = secondsToHms(1200);
            
                        var split_duration = duration.split(',');
            
            
                        var hours = parseInt(split_duration[0].split('h'));
                        var minutes = parseInt(split_duration[1].split('m'));
                        var seconds = parseInt(split_duration[2].split('s'));
            
            
                        console.log(duration)
                        $('#duration-hours').val(hours);
                        $('#duration-minutes').val(minutes);
                        $('#duration-seconds').val(seconds);
                        $('.stop_notes_row').removeClass('hide');
                        $('.transfer_row').removeClass('hide');
                        $('.service_time_row').removeClass('hide');
                        $('.time_window_row').removeClass('hide');
                        $('.table_row').removeClass('hide');
            
                        $('.transfer_question').prop('checked', false);
                        $('.transfer_position').val(0);
                    }
                }
            
            
            
            });
            
            
            $(document).on('change', '.ncl_type', function(e) {
                if ($('option:selected', this).val() != 0) {
                    var ncl_id = $('option:selected', this).val();
                    var ncl_text = $('option:selected', this).text();
            
                    var stop_name = ncl_text;
                    $('.stop_name').val(stop_name);
                }
            });
            
            $(document).on('click', '#clear', function(event) {
                reset_all();
            });
            
            /**
             * [description] - On click of the delete button
             */
            $(document).on('click', '.delete_stop', function(event) {
            
                if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {
            
                    $(this).closest('tr').find('.delete_stop_input').val("T");
                    $(this).closest("tr").hide();
                }
            
                reset_all()
            
            });
            
            $(document).on('change', '.customer_address_type', function(e) {
                if ($('option:selected', this).val() != 0) {
                    var customer_address_id = $('option:selected', this).val();
            
                    var ncl_id = $('option:selected', this).attr('data-ncl');
                    var addr1 = $('option:selected', this).attr('data-addr1');
                    var addr2 = $('option:selected', this).attr('data-addr2');
                    var city = $('option:selected', this).attr('data-city');
                    var state = $('option:selected', this).attr('data-state');
                    var zip = $('option:selected', this).attr('data-postcode');
                    var customer_name = $('option:selected', this).attr('data-compname');
            
                    var stop_name = '';
            
                    if (!isNullorEmpty(ncl_id)) {
                        $('.ncl_row').removeClass('hide');
                        $('.create_new_section').addClass('hide');
                        $('#ncl_type').val(ncl_id);
            
                        var ncl_text = $('option:selected', this).attr('data-ncltext');
            
                        if (!isNullorEmpty(addr1)) {
                            // stop_name = addr1 + ' - ' + ncl_text;
                            stop_name = ncl_text;
                            $('.stop_name').attr('data-postbox', addr1);
                        } else {
                            $('.stop_name').attr('data-postbox', "");
                        }
            
            
            
                    } else {
                        $('.ncl_row').addClass('hide');
                        $('.create_new_section').removeClass('hide');
                        $('#ncl_type').val(0);
            
                        // stop_name = $('option:selected', this).text();
                        stop_name = $('option:selected', this).attr('data-compname');
                        $('.stop_name').attr('data-postbox', "");
                    }
                    $('.stop_name').val(stop_name);
            
                }
            });

            $(document).on("change", ".zee_dropdown", function(e) {

                var zee = $(this).val();
            
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=843&deploy=1&compid=1048144";
            
                url += "&zee=" + zee + "";
            
                window.location.href = url;
            });
        }

        function saveRecord() {

            zee = parseInt(nlapiGetFieldValue('custpage_zee'));
            if (!isNullorEmpty(nlapiGetFieldValue('custpage_customer_id'))) {
                var customer_id = parseInt(nlapiGetFieldValue('custpage_customer_id'));
            } else {
                var customer_id = null;
            }
            var stop_id = nlapiGetFieldValue('custpage_stop_id');
        
            console.log($('option:selected', '.address_type').val());
        
            if ($('option:selected', '.address_type').val() == 1) {
                var addressid = $('option:selected', '.customer_address_type').val();
                var addr1 = $('option:selected', '.customer_address_type').attr('data-addr1')
                var addr2 = $('option:selected', '.customer_address_type').attr('data-addr2')
                var city = $('option:selected', '.customer_address_type').attr('data-city')
                var state = $('option:selected', '.customer_address_type').attr('data-state')
                var postcode = $('option:selected', '.customer_address_type').attr('data-postcode')
                var ncl = $('option:selected', '.customer_address_type').attr('data-ncl')
                var lat = $('option:selected', '.customer_address_type').attr('data-lat')
                var lng = $('option:selected', '.customer_address_type').attr('data-lng')
        
            }
        
            if ($('option:selected', '.address_type').val() == 2) {
                var addressid = null;
                var addr1 = $('option:selected', '.ncl_type').attr('data-addr1')
                var addr2 = $('option:selected', '.ncl_type').attr('data-addr2')
                var city = $('option:selected', '.ncl_type').attr('data-city')
                var state = $('option:selected', '.ncl_type').attr('data-state')
                var postcode = $('option:selected', '.ncl_type').attr('data-postcode')
                var ncl = $('option:selected', '.ncl_type').attr('data-ncl')
                var lat = $('option:selected', '.ncl_type').attr('data-lat')
                var lng = $('option:selected', '.ncl_type').attr('data-lng')
        
            }
        
            var stop_name = $('.stop_name').val();
            var duration = $('#duration').val();
            var stop_notes = $('#stop_notes').val();
        
        
        
            var split_duration = duration.split(',');
        
            var hours = ($('#duration-hours').val());
            var minutes = ($('#duration-minutes').val());
            var seconds = ($('#duration-seconds').val());
        
            console.log('hours ' + hours.toString());
            console.log('minutes ' + minutes.toString());
            console.log('seconds ' + seconds.toString());
        
            var hours = parseInt(hours.split('h'));
            var minutes = parseInt(minutes.split('m'));
            var seconds = parseInt(seconds.split('s'));
        
            var hours_to_seconds = 0;
            var minutes_to_seconds = 0;
        
            if (hours > 0) {
                hours_to_seconds = hours * 60 * 60;
            }
        
            if (minutes > 0) {
                minutes_to_seconds = minutes * 60;
            }
        
            duration = hours_to_seconds + minutes_to_seconds + seconds;
        
            console.log('duration ' + duration);
        
            var service_time = onTimeChange($('.service_time').val());
        
            var earliest_time = onTimeChange($('.earliest_time').val());
            var latest_time = onTimeChange($('.latest_time').val());
        
            var sequence_elem = document.getElementsByClassName("sequence");
            var edit_elem = document.getElementsByClassName("edit_class");
            console.log(customer_id)
            if (isNullorEmpty(customer_id)) {
                var customer_elem = document.getElementsByClassName("customer_selected_class");
            }
            var service_elem = document.getElementsByClassName("service_selected_class");
            var service_leg_elem = document.getElementsByClassName("service_leg");
            var daily_elem = document.getElementsByClassName("daily");
            var monday_elem = document.getElementsByClassName("monday");
            var tuesday_elem = document.getElementsByClassName("tuesday");
            var wednesday_elem = document.getElementsByClassName("wednesday");
            var thursday_elem = document.getElementsByClassName("thursday");
            var friday_elem = document.getElementsByClassName("friday");
            var adhoc_elem = document.getElementsByClassName("adhoc");
            var run_elem = document.getElementsByClassName("run_selected_class");
        
            if (edit_elem.length == 0) {
                showAlert('Please Setup the Stop');
                return false;
            }
        
            console.log(customer_elem.length);
            for (var i = 0; i < edit_elem.length; ++i) {
                var stop_id = edit_elem[i].getAttribute('data-stopid');
                var freq_id = edit_elem[i].getAttribute('data-freqid');
                if (isNullorEmpty(stop_id)) {
                    var service_leg_record = nlapiCreateRecord('customrecord_service_leg');
                    service_leg_record.setFieldValue('custrecord_service_leg_franchisee', zee);
        
                    if (!isNullorEmpty(customer_id)) {
                        console.log(customer_id)
                        service_leg_record.setFieldValue('custrecord_service_leg_customer', customer_id);
                    } else {
                        console.log(customer_elem[i].value)
                        service_leg_record.setFieldValue('custrecord_service_leg_customer', customer_elem[i].value);
                    }
                } else {
                    var service_leg_record = nlapiLoadRecord('customrecord_service_leg', stop_id);
                }
                service_leg_record.setFieldValue('name', stop_name);
                service_leg_record.setFieldValue('custrecord_app_service_leg_sequence', sequence_elem[i].value);
                service_leg_record.setFieldValue('custrecord_service_leg_number', service_leg_elem[i].value);
                service_leg_record.setFieldValue('custrecord_service_leg_type', service_leg_elem[i].value);
                service_leg_record.setFieldValue('custrecord_service_leg_service', service_elem[i].value);
                if (isNullorEmpty(ncl)) {
                    service_leg_record.setFieldValue('custrecord_service_leg_location_type', 1);
                } else {
                    service_leg_record.setFieldValue('custrecord_service_leg_location_type', 2);
                    service_leg_record.setFieldValue('custrecord_service_leg_non_cust_location', ncl);
                }
                if (!isNullorEmpty(addressid)) {
                    service_leg_record.setFieldValue('custrecord_service_leg_addr', addressid);
                }
        
                service_leg_record.setFieldValue('custrecord_service_leg_addr_subdwelling', addr1);
        
                service_leg_record.setFieldValue('custrecord_service_leg_addr_st_num_name', addr2);
                service_leg_record.setFieldValue('custrecord_service_leg_addr_suburb', city);
                service_leg_record.setFieldValue('custrecord_service_leg_addr_state', state);
                service_leg_record.setFieldValue('custrecord_service_leg_addr_postcode', postcode);
                service_leg_record.setFieldValue('custrecord_service_leg_addr_lat', lat);
                service_leg_record.setFieldValue('custrecord_service_leg_addr_lon', lng);
        
                service_leg_record.setFieldValue('custrecord_service_leg_duration', duration);
                service_leg_record.setFieldValue('custrecord_service_leg_notes', stop_notes);
        
                var original_service_leg_id = nlapiSubmitRecord(service_leg_record);
                if (isNullorEmpty(freq_id)) {
                    var freq_record = nlapiCreateRecord('customrecord_service_freq');
                } else {
                    var freq_record = nlapiLoadRecord('customrecord_service_freq', run_freq_id);
                }
        
                freq_record.setFieldValue('custrecord_service_freq_franchisee', zee);
                if (!isNullorEmpty(customer_id)) {
                    freq_record.setFieldValue('custrecord_service_freq_customer', customer_id);
                } else {
                    freq_record.setFieldValue('custrecord_service_freq_customer', customer_elem[i].value);
                }
        
                freq_record.setFieldValue('custrecord_service_freq_run_plan', run_elem[i].value);
                freq_record.setFieldValue('custrecord_service_freq_service', service_elem[i].value);
                freq_record.setFieldValue('custrecord_service_freq_stop', original_service_leg_id);
                freq_record.setFieldValue('custrecord_service_freq_time_start', earliest_time);
                freq_record.setFieldValue('custrecord_service_freq_time_end', latest_time);
                freq_record.setFieldValue('custrecord_service_freq_time_current', service_time);
        
                if (monday_elem[i].checked) {
                    freq_record.setFieldValue('custrecord_service_freq_day_mon', 'T');
                } else {
                    freq_record.setFieldValue('custrecord_service_freq_day_mon', 'F');
                }
                if (tuesday_elem[i].checked) {
                    freq_record.setFieldValue('custrecord_service_freq_day_tue', 'T');
                } else {
                    freq_record.setFieldValue('custrecord_service_freq_day_tue', 'F');
                }
                if (wednesday_elem[i].checked) {
                    freq_record.setFieldValue('custrecord_service_freq_day_wed', 'T');
                } else {
                    freq_record.setFieldValue('custrecord_service_freq_day_wed', 'F');
                }
                if (thursday_elem[i].checked) {
                    freq_record.setFieldValue('custrecord_service_freq_day_thu', 'T');
                } else {
                    freq_record.setFieldValue('custrecord_service_freq_day_thu', 'F');
                }
                if (friday_elem[i].checked) {
                    freq_record.setFieldValue('custrecord_service_freq_day_fri', 'T');
                } else {
                    freq_record.setFieldValue('custrecord_service_freq_day_fri', 'F');
                }
                nlapiSubmitRecord(freq_record);
                // service_leg_record.setFieldValue('custrecord_service_leg_addr_postal', table_stop_name_elem[i].getAttribute('data-postbox'));
                return true;
            }
        }

        function convertTo24Hour(time, time_slot) {
            // nlapiLogExecution('DEBUG', 'time', time);
            // console.log(time)
            var hours_array = time.substr(0, 2);
            var hours = parseInt(time.substr(0, 2));
            // if (time.indexOf('AM') != -1 && hours == 12) {
            // 	time = time.replace('12', '0');
            // }
            if (hours < 12) {
        
                if (time_slot == 'earliest') {
                    if (hours == 10) {
                        time = time.replace(hours, '09');
                    } else {
                        time = time.replace(hours, (hours - 1));
                    }
        
                } else {
                    if (hours == 9) {
                        time = time.replace(hours_array, 10);
                        console.log(time);
                        console.log(time_slot);
                    } else {
                        time = time.replace(hours, (hours + 1));
                    }
        
        
                }
                // console.log(time)
            }
            if (hours > 12) {
                if (time_slot == 'earliest') {
                    time = time.replace(hours, (hours - 1));
                } else {
                    time = time.replace(hours, (hours + 1));
                }
        
            }
            // console.log(time)
            return time.replace(/( AM| PM)/, '');
        }
        
        function validateTimes() {
        
        }

        function onclick_back() {
            var params = {
        
            }
            params = JSON.stringify(params);
            console.log(nlapiGetFieldValue('custpage_suitlet'))
            console.log(nlapiGetFieldValue('custpage_deploy'))
            var upload_url = baseURL + nlapiResolveURL('SUITELET', nlapiGetFieldValue('custpage_suitlet'), nlapiGetFieldValue('custpage_deploy')) + '&unlayered=T&custparam_params=' + params;
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
        }
        
        function onclick_mainpage() {
            var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar', 'customdeploy_sl_full_calender') + '&unlayered=T';
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
        }

        function secondsToHms(d) {
            d = Number(d);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
        
            var hDisplay = h > 0 ? h + (h == 1 ? "h," : "h,") : "0h,";
            var mDisplay = m > 0 ? m + (m == 1 ? "m," : "m,") : "0m,";
            var sDisplay = s > 0 ? s + (s == 1 ? "s" : "s") : "0s";
            return hDisplay + mDisplay + sDisplay;
        }
        
        
        function updateRowCount() {
            $('#services tbody > tr').each(function(index, item) {
                $(this).find('.add_stop').attr('data-newstop', index + 1);
                $(this).find('.edit_stop').attr('data-newstop', index + 1);
                $(this).find('.add_row').attr('data-newstop', index + 1);
                $(this).find('.delete_stop').attr('data-newstop', index + 1);
                $(this).find('.transfer_stop').attr('data-newstop', index + 1);
            });
        }
        
        function resetTransferQuestions() {
            $('.transfer_question').prop('checked', false);
            $('.transfer_position').val(0);
            $('.transfer_row').addClass('hide');
            $('.transfer_position_row').addClass('hide');
            $('#transfer_type').val(0);
            $('#zee').val(0);
        }
        
        function reset_all() {
            $('.ncl_row').addClass('hide');
            $('.customer_address_row').addClass('hide');
            $('.duration_row').addClass('hide');
            $('.notes_row').addClass('hide');
            $('.stop_name_row').addClass('hide');
            $('.stop_duration_row').addClass('hide');
            $('.durationpicker-container').addClass('hide');
            $('.stop_notes_row').addClass('hide');
            $('.row_button').addClass('hide');
            $('.address_type_row').addClass('hide');
            $('.transfer_type_row').addClass('hide');
            $('.zee_row').addClass('hide');
            $('.zee_operator_row').addClass('hide');
            $('.address_type').val(0);
            $('.ncl_type').val(0);
            $('.customer_address_type').val(0);
            $('.stop_name').val("");
            $('.stop_duration').val("");
            $('.stop_notes').val("");
            $('.duration').val("");
            $('.notes').val("");
            resetTransferQuestions();
        }

        function uncheckDailyAdhocFreq() {
            $('#daily').prop('checked', false);
            $('#adhoc').prop('checked', false);
        }

        function onTimeChange(value) {
            console.log('value: ' + value)
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

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord
        }
});