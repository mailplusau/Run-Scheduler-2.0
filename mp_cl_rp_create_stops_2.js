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
        var zee = 0;

        var deleted_service_ids = [];
        var deleted_job_ids = [];
        var add_row = false;

        var edited_stop_array = [];

        if (role == 1000) {
            //Franchisee
            // if it doesn't work, try it without the .id
            zee = runtime.getCurrentUser().id;
        } else {
            var currentScript = currentRecord.get();
            var zeeCustPage = currentScript.getValue({
                fieldId: 'custpage_zee',
            });
            zee = parseInt(zeeCustPage);
        }

        $(window).load(function() {
            // Animate loader off screen
            $(".se-pre-con").fadeOut("slow");;
        });
        
        /**
         * CONVERT ANGULAR??
         */
        var app = angular.module('myApp', []);
        app.controller('myCtrl', function($scope) {
        
        });

        $(document).on('click', '#create_new', function(e) {
            var currentScript = currentRecord.get();
            var customerIdCustPage = currentScript.getValue({
                fieldId: 'custpage_customer_id',
            });
            var params = {
                custid: parseInt(customerIdCustPage),
                id: 'customscript_sl_rp_create_stops',
                deploy: 'customdeploy_sl_rp_create_stops'
            };
            params = JSON.stringify(params);
            
            console.log('inside create new ncl');
            var output = url.resolveScript({
                scriptId: 'customscript_sl_create_new_ncl',
                deploymentId: 'customdeploy_sl_create_new_ncl',
                returnExternalUrl: false,
            });

            var upload_url = baseURL + output + '&custparam_params=' + params;
            window.open(upload_url, "_blank", "height=750,width=650,modal=yes,alwaysRaised=yes");
        });

        /**
         * On page initialisation
         */
        function pageInit() {
            $('#alert').hide();

            $('#duration').durationPicker();

            $('.durationpicker-container').addClass('hide');

            $(function() {
                $('[data-toggle="tooltip"]').tooltip()
            })

            var currentScript = currentRecord.get();
            var transfer_stop_linked = currentScript.getValue({
                fieldId: 'custpage_transfer_stop_linked',
            });
            
            transfer_stop_linked = transfer_stop_linked.split(',');
            console.log('transfer_stop_linked', transfer_stop_linked);

            for (i = 0; i < transfer_stop_linked.length; i++) {
                if (!isNullorEmpty(transfer_stop_linked[i])) {
                    $('#services tbody > tr').each(function() {
                        console.log('$(this).find(delete_stop).attr(data-oldstop)', $(this).find('.delete_stop').attr('data-oldstop'));
                        if ($(this).find('.delete_stop').attr('data-oldstop') == transfer_stop_linked[i]) {
                            $(this).addClass('hide');
                            $(this).find('.add_stop').removeClass('add_stop');
                            $(this).find('.edit_stop').removeClass('edit_stop');
                            $(this).find('.delete_stop_input').removeClass('delete_stop_input');
                            $(this).find('.table_info').removeClass('table_info');
                            $(this).find('.table_duration').removeClass('table_duration');
                            $(this).find('.table_stop_name').removeClass('table_stop_name');
                            $(this).find('.table_notes').removeClass('table_notes');
        
                        }
                    });
                }
            }
        
        
        }

        $(document).on('click', '#alert .close', function(e) {
            $(this).parent().hide();
        });

        function showAlert(message) {
            $('#myModal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1" style="color: #e93578; ">Error!!</label></h4></div>');
            $('#myModal .modal-body').html("");
            $('#myModal .modal-body').html(message);
            $('#myModal').modal("show");
        }

        $('.collapse').on('shown.bs.collapse', function() {
            $("#container").css({
                "padding-top": "350px"
            });
        })
        
        $('.collapse').on('hide.bs.collapse', function() {
            $("#container").css({
                "padding-top": "80px"
            });
        })

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

        function onclick_back() {
            var currentScript = currentRecord.get();
            var suiteletCustPage = currentScript.getValue({
                fieldId: 'custpage_suitlet',
            });
            console.log(suiteletCustPage)
            var deployCustPage = currentScript.getValue({
                fieldId: 'custpage_deploy',
            });
            console.log(deployCustPage)

            var output = url.resolveScript({
                scriptId: suiteletCustPage,
                deploymentId: deployCustPage,
                returnExternalUrl: false,
            });

            var upload_url = baseURL + output + '&unlayered=T&zee=' + zee;
            
            
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
        
        
        }

        function onclick_mainpage() {

            var output = url.resolveScript({
                scriptId: 'customscript_sl_full_calendar',
                deploymentId: 'customdeploy_sl_full_calender',
                returnExternalUrl: false,
            });

            var upload_url = baseURL + output + '&unlayered=T';
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
        }

        $(document).on('click', '.add_stop', function(e) {
            $('.address_type_row').removeClass('hide');
            $('.row_button').removeClass('hide');
            $('.edit_old_stop_section').addClass('hide');
            $('.add_new_stop_section').removeClass('hide');
            $('#add_new_stop').attr('data-rowid', $(this).attr('data-newstop'));
            $('#duration').val(0);
            $('#duration-hours').val(0);
            $('#duration-minutes').val(0);
            $('#duration-seconds').val(0);
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
            $('#add_new_stop').attr('data-rowid', $(this).attr('data-newstop'));
            $('#duration').val(0);
            $('#duration-hours').val(0);
            $('#duration-minutes').val(0);
            $('#duration-seconds').val(0);
        });

        $(document).on('click', '.add_row', function(e) {
        
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

        $(document).on('click', '.edit_transfer_stop', function(e) {
            var address_type = $(this).closest('tr').find('.table_info').attr('data-addresstype');
            var stop_duration = $(this).closest('tr').find('.table_duration').val();
            var stop_name = $(this).closest('tr').find('.table_stop_name').val();
            var ncl = $(this).closest('tr').find('.table_stop_name').attr('data-ncl');
            var notes = $(this).closest('tr').find('.table_stop_name').attr('data-notes');
            var transfer_type = $(this).closest('tr').find('.table_stop_name').attr('data-transfertype');
            var transfer_linked_zee = $(this).closest('tr').find('.table_stop_name').attr('data-linkedzee');
            var customer_address = $(this).closest('tr').find('.table_stop_name').attr('data-customeraddressid');
            var duration = $(this).closest('tr').find('.table_duration').val();
        
            $('#edit_old_stop').attr('data-rowid', $(this).attr('data-newstop'));
            $('#edit_old_stop').attr('data-oldstop', $(this).attr('data-oldstop'));
        
            $('.address_type_row').removeClass('hide');
            $('#address_type').val(address_type);
            if (address_type == 1) {
                $('.customer_address_row').removeClass('hide');
                $('#customer_address_type').val(customer_address);
                $('.ncl_row').addClass('hide');
                if (!isNullorEmpty(ncl) && ncl != 0) {
                    $('.ncl_row').removeClass('hide');
                    $('#ncl_type').val(ncl);
                }
            } else {
                $('#customer_address_type').val(customer_address);
                $('.customer_address_row').addClass('hide');
                $('.ncl_row').removeClass('hide');
                $('#ncl_type').val(ncl);
            }
        
        
            $('.duration_row').removeClass('hide');
            $('.notes_row').removeClass('hide');
            $('.stop_name_row').removeClass('hide');
            $('.stop_duration_row').removeClass('hide');
            $('.durationpicker-container').removeClass('hide');
            $('.stop_notes_row').removeClass('hide');
            $('.row_button').removeClass('hide');
            $('.transfer_row').removeClass('hide');
            $('.edit_old_stop_section').removeClass('hide');
            $('.add_new_stop_section').addClass('hide');
        
            $('.transfer_type_row').removeClass('hide');
            $('.zee_row').removeClass('hide');
        
            $('#transfer_type').val(transfer_type);
            $('#zee').val(transfer_linked_zee);
        
            var duration = secondsToHms(stop_duration);
        
            var split_duration = duration.split(',');
            var hours = parseInt(split_duration[0].split('h'));
            var minutes = parseInt(split_duration[1].split('m'));
            var seconds = parseInt(split_duration[2].split('s'));
        
            $('#duration-hours').val(hours);
            $('#duration-minutes').val(minutes);
            $('#duration-seconds').val(seconds);
            console.log('stop_name', stop_name);
            $('#stop_notes').val(notes);
            $('#stop_name').val(stop_name);
            $('#duration').val(stop_duration);
        
        
        });

        $(document).on('click', '.edit_stop', function(e) {
            var address_type = $(this).closest('tr').find('.table_info').attr('data-addresstype');
            var stop_name = $(this).closest('tr').find('.table_stop_name').val();
            var stop_duration = $(this).closest('tr').find('.table_duration').val();
            var ncl = $(this).closest('tr').find('.table_stop_name').attr('data-ncl');
            var notes = $(this).closest('tr').find('.table_stop_name').attr('data-notes');
            var customer_address = $(this).closest('tr').find('.table_stop_name').attr('data-customeraddressid');
            var duration = $(this).closest('tr').find('.table_duration').val();
        
            $('#edit_old_stop').attr('data-rowid', $(this).attr('data-newstop'));
            $('#edit_old_stop').attr('data-oldstop', $(this).attr('data-oldstop'));
        
        
            $('.address_type_row').removeClass('hide');
            $('#address_type').val(address_type);
            if (address_type == 1) {
                $('.customer_address_row').removeClass('hide');
                $('#customer_address_type').val(customer_address);
                $('.ncl_row').addClass('hide');
                if (!isNullorEmpty(ncl) && ncl != 0) {
                    $('.ncl_row').removeClass('hide');
                    $('#ncl_type').val(ncl);
                }
            } else {
                $('#customer_address_type').val(customer_address);
                $('.customer_address_row').addClass('hide');
                $('.ncl_row').removeClass('hide');
                $('#ncl_type').val(ncl);
            }
        
        
            $('.duration_row').removeClass('hide');
            $('.notes_row').removeClass('hide');
            $('.stop_name_row').removeClass('hide');
            $('.stop_duration_row').removeClass('hide');
            $('.durationpicker-container').removeClass('hide');
            $('.stop_notes_row').removeClass('hide');
            $('.row_button').removeClass('hide');
            $('.transfer_row').removeClass('hide');
            $('.edit_old_stop_section').removeClass('hide');
            $('.add_new_stop_section').addClass('hide');
        
            var duration = secondsToHms(stop_duration);
        
            var split_duration = duration.split(',');
        
        
            var hours = parseInt(split_duration[0].split('h'));
            var minutes = parseInt(split_duration[1].split('m'));
            var seconds = parseInt(split_duration[2].split('s'));
        
        
            console.log(duration)
            $('#duration-hours').val(hours);
            $('#duration-minutes').val(minutes);
            $('#duration-seconds').val(seconds);
            $('#stop_notes').val(notes);
            $('#stop_name').val(stop_name);
            $('#duration').val(stop_duration);
        
        
        });

        
        $(document).on('click', '.move_up, .move_down', function(e) {
            var row = $(this).parents("tr:first");
            if ($(this).is(".move_up")) {
                row.insertBefore(row.prev());
            } else {
                row.insertAfter(row.next());
            }
            updateRowCount();
        });

        $(document).on('click', '#transfer_question', function(e) {
            if ($(this).is(':checked')) {
                $('.transfer_position_row').removeClass('hide');
            } else {
                $('.transfer_position_row').addClass('hide');
            }
        });

        function updateRowCount() {
            $('#services tbody > tr').each(function(index, item) {
                $(this).find('.add_stop').attr('data-newstop', index + 1);
                $(this).find('.edit_stop').attr('data-newstop', index + 1);
                $(this).find('.add_row').attr('data-newstop', index + 1);
                $(this).find('.delete_stop').attr('data-newstop', index + 1);
                $(this).find('.transfer_stop').attr('data-newstop', index + 1);
            });
        }

        $(document).on('click', '#add_new_stop', function(e) {

            var currentScript = currentRecord.get();
            var zee = currentScript.getValue({
                fieldId: 'zee',
            });
            var add_stop_elem = document.getElementsByClassName("add_stop");
            var edit_stop_elem = document.getElementsByClassName("edit_stop");
            var transfer_stop_elem = document.getElementsByClassName("transfer_stop");
            var table_info_elem = document.getElementsByClassName("table_info");
            var table_duration_elem = document.getElementsByClassName("table_duration");
            var table_stop_name_elem = document.getElementsByClassName("table_stop_name");
            var table_duration_elem = document.getElementsByClassName("table_duration");
            var table_notes_elem = document.getElementsByClassName("table_notes");
            var row_number = $(this).attr('data-rowid');

            var duration = $('#duration').val();

            var split_duration = duration.split(',');

            if ($('option:selected', '#address_type').val() == 0) {
                showAlert('Please select Address Type');
                return false;
            }
            if (isNullorEmpty($('#stop_name').val())) {
                showAlert('Please select /  enter Address');
                return false;
            }

            console.log('split_duration', split_duration);
            if (split_duration.length == 3) {
                var hours = parseInt(split_duration[0].split('h'));
                var minutes = parseInt(split_duration[1].split('m'));
                var seconds = parseInt(split_duration[2].split('s'));

                if (hours == 0 && minutes == 0 && seconds == 0) {
                    showAlert('Please enter time spent at this stop');
                    return false;
                }
            } else if (duration == 0) {
                showAlert('Please enter time spent at this stop');
                return false;
            }

            if ($('#transfer_question').is(':checked')) {
                if ($('option:selected', '#transfer_position').val() == 0) {
                    showAlert('Please select Transfer Position');
                    return false;
                }
            }

            var hours_to_seconds = 0;
            var minutes_to_seconds = 0;

            if (hours > 0) {
                hours_to_seconds = hours * 60 * 60;
            }

            if (minutes > 0) {
                minutes_to_seconds = minutes * 60;
            }

            duration = hours_to_seconds + minutes_to_seconds + seconds;

            var display_html = '';

            display_html += 'Stop Name: ' + $('#stop_name').val() + '\n';
            if ($('option:selected', '#transfer_type').val() != 0) {
                display_html += 'Transfer Type: ' + $('option:selected', '#transfer_type').text() + '\n';
            }
            display_html += 'Notes: ' + $('#stop_notes').val();

            $('#services tr:eq(' + row_number + ')').find('.add_stop').removeClass('glyphicon-log-out');
            $('#services tr:eq(' + row_number + ')').find('.add_stop').removeClass('btn-success');
            $('#services tr:eq(' + row_number + ')').find('.add_stop').addClass('glyphicon-pencil');
            $('#services tr:eq(' + row_number + ')').find('.add_stop').addClass('btn-warning');
            $('#services tr:eq(' + row_number + ')').find('.add_stop').addClass('edit_stop');
            $('#services tr:eq(' + row_number + ')').find('.add_stop').removeClass('add_stop');

            $('#services tr:eq(' + row_number + ')').find('.transfer_stop').addClass('btn-warning');
            $('#services tr:eq(' + row_number + ')').find('.transfer_stop').addClass('edit_transfer_stop');
            $('#services tr:eq(' + row_number + ')').find('.transfer_stop').append(' <input class="btn btn-warning btn-sm edit_stop" type="hidden" data-newstop="' + (row_number) + '">');
            $('#services tr:eq(' + row_number + ')').find('.transfer_stop').removeClass('transfer_stop');
            $('#services tr:eq(' + row_number + ')').find('.table_duration').val(duration);
            $('#services tr:eq(' + row_number + ')').find('.table_info').val(display_html);
            $('#services tr:eq(' + row_number + ')').find('.table_info').attr('data-addresstype', $('option:selected', '#address_type').val());
            $('#services tr:eq(' + row_number + ')').find('.table_info').attr('data-oldstop', "");
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-notes', $('#stop_notes').val());
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').val($('#stop_name').val());
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-ncl', $('option:selected', '#ncl_type').val());
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-transfertype', $('option:selected', '#transfer_type').val());
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-linkedzee', $('option:selected', '#zee').val());
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-customeraddressid', $('option:selected', '#customer_address_type').val());
            if ($('option:selected', '#address_type').val() == 1) {
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-addr1', $('option:selected', '#customer_address_type').attr('data-addr1'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-addr2', $('option:selected', '#customer_address_type').attr('data-addr2'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-city', $('option:selected', '#customer_address_type').attr('data-city'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-state', $('option:selected', '#customer_address_type').attr('data-state'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-zip', $('option:selected', '#customer_address_type').attr('data-postcode'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-lat', $('option:selected', '#customer_address_type').attr('data-lat'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-lng', $('option:selected', '#customer_address_type').attr('data-lng'));
            } else if ($('option:selected', '#address_type').val() == 2) {
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-addr1', $('option:selected', '#ncl_type').attr('data-addr1'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-addr2', $('option:selected', '#ncl_type').attr('data-addr2'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-city', $('option:selected', '#ncl_type').attr('data-city'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-state', $('option:selected', '#ncl_type').attr('data-state'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-zip', $('option:selected', '#ncl_type').attr('data-postcode'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-lat', $('option:selected', '#ncl_type').attr('data-lat'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-lng', $('option:selected', '#ncl_type').attr('data-lng'));
            }
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-postbox', $('#stop_name').attr('data-postbox'));

            if (isNullorEmpty($('#services tr:eq(' + row_number + ')').find('.first_col').find('.delete_stop'))) {
                $('#services tr:eq(' + row_number + ')').find('.first_col').append(' <button class="btn btn-danger btn-sm delete_stop glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete Stop" data-oldstop="" data-newstop="' + row_number + '"></button>');
            } else {
                $('#services tr:eq(' + row_number + ')').find('.first_col').append(' <input type="hidden" class="delete_stop_input" value="F" data-stopid="" />');
            }


            var transfer_required = $('#transfer_question').val();
            var transfer_position = $('#transfer_position').val();

            if ($('#transfer_question').is(':checked')) {
                var row_count = $('#services tbody > tr').length;
                if (transfer_position == 1) {
                    var new_row = '<tr><td class="first_col"><button class="btn btn-success btn-sm transfer_stop glyphicon glyphicon-transfer" type="button" data-toggle="tooltip" data-placement="right" title="Add Transfer" data-newstop=""></button> <button class="btn btn-danger btn-sm delete_stop glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete Stop" data-oldstop="" data-newstop=""></button></td><td><textarea readonly class="form-control table_info"></textarea><input type="hidden" readonly class="form-control table_stop_name" /></td><td><input type="text" readonly class="form-control table_duration" data-oldstop="" value="" /></td></tr>';
                    $('#services tr:eq(' + row_number + ')').before(new_row);

                } else {
                    var new_row = '<tr><td class="first_col"><button class="btn btn-success btn-sm transfer_stop glyphicon glyphicon-transfer" type="button" data-toggle="tooltip" data-placement="right" title="Add Transfer" data-newstop=""></button> <button class="btn btn-danger btn-sm delete_stop glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete Stop" data-oldstop="" data-newstop=""></button></td><<td><textarea readonly class="form-control table_info"></textarea><input type="hidden" readonly class="form-control table_stop_name" /></td><td><input type="text" readonly class="form-control table_duration" data-oldstop="" value="" /></td></tr>';
                    $('#services tr:eq(' + row_number + ')').after(new_row);
                }
            }

            $('#services tr:eq(' + row_number + ')').find('.first_col').append(' <button class="btn btn-default btn-sm move_up glyphicon glyphicon-arrow-up" type="button" data-toggle="tooltip" data-placement="right" title="Move Up"></button><button class="btn btn-default btn-sm move_down glyphicon glyphicon-arrow-down" type="button" data-toggle="tooltip" data-placement="right" title="Move Down"></button>');

            updateRowCount();
            reset_all();
        });

        $(document).on('click', '#edit_old_stop', function(e) {
            var add_stop_elem = document.getElementsByClassName("add_stop");
            var edit_stop_elem = document.getElementsByClassName("edit_stop");
            console.log('edit_stop_elem', edit_stop_elem);
            var table_info_elem = document.getElementsByClassName("table_info");
            var table_duration_elem = document.getElementsByClassName("table_duration");
            var table_stop_name_elem = document.getElementsByClassName("table_stop_name");
            var table_duration_elem = document.getElementsByClassName("table_duration");
            var table_notes_elem = document.getElementsByClassName("table_notes");
            var row_number = $(this).attr('data-rowid');
            var edited_stop_id = $(this).attr('data-oldstop');

            //var row_number = edited_stop_id;

            var display_html = '';

            if ($('option:selected', '#address_type').val() == 0) {
                showAlert('Please select Address Type');
                return false;
            }
            if (isNullorEmpty($('#stop_name').val())) {
                showAlert('Please select /  enter Address');
                return false;
            }



            display_html += 'Stop Name: ' + $('#stop_name').val() + '\n';
            if ($('option:selected', '#transfer_type').val() != 0) {
                display_html += 'Transfer Type: ' + $('option:selected', '#transfer_type').text() + '\n';
            }

            display_html += 'Notes: ' + $('#stop_notes').val();
            console.log('display_html', display_html);

            var duration = $('#duration').val();
            console.log('duration', duration);
            // duration = secondsToHms(duration);


            var split_duration = duration.split(',');
            console.log('split_duration', split_duration);
            console.log('split_duration.length', split_duration.length);
            if (split_duration.length == 3) {
                var hours = parseInt(split_duration[0].split('h'));
                var minutes = parseInt(split_duration[1].split('m'));
                var seconds = parseInt(split_duration[2].split('s'));

                if (hours == 0 && minutes == 0 && seconds == 0) {
                    showAlert('Please enter time spent at this stop');
                    return false;
                }
            }

            if ($('#transfer_question').is(':checked')) {
                if ($('option:selected', '#transfer_position').val() == 0) {
                    showAlert('Please select Transfer Position');
                    return false;
                }
            }


            if (!isNullorEmpty(split_duration[1])) {
                minutes = parseInt(split_duration[1].split('m'));
                seconds = parseInt(split_duration[2].split('s'));

                var hours_to_seconds = 0;
                var minutes_to_seconds = 0;

                if (hours > 0) {
                    hours_to_seconds = hours * 60 * 60;
                }

                if (minutes > 0) {
                    minutes_to_seconds = minutes * 60;
                }

                duration = hours_to_seconds + minutes_to_seconds + seconds;
            }

            $('#services tr:eq(' + row_number + ')').find('.table_duration').val(duration);
            $('#services tr:eq(' + row_number + ')').find('.table_info').val(display_html);

            $('#services tr:eq(' + row_number + ')').find('.table_info').attr('data-addresstype', $('option:selected', '#address_type').val());
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-notes', $('#stop_notes').val());

            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').val($('#stop_name').val());
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-ncl', $('option:selected', '#ncl_type').val());
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-transfertype', $('option:selected', '#transfer_type').val());
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-linkedzee', $('option:selected', '#zee').val());
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-customeraddressid', $('option:selected', '#customer_address_type').val());
            if ($('option:selected', '#address_type').val() == 1) {
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-addr1', $('option:selected', '#customer_address_type').attr('data-addr1'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-addr2', $('option:selected', '#customer_address_type').attr('data-addr2'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-city', $('option:selected', '#customer_address_type').attr('data-city'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-state', $('option:selected', '#customer_address_type').attr('data-state'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-zip', $('option:selected', '#customer_address_type').attr('data-postcode'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-lat', $('option:selected', '#customer_address_type').attr('data-lat'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-lng', $('option:selected', '#customer_address_type').attr('data-lng'));
            } else if ($('option:selected', '#address_type').val() == 2) {
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-addr1', $('option:selected', '#ncl_type').attr('data-addr1'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-addr2', $('option:selected', '#ncl_type').attr('data-addr2'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-city', $('option:selected', '#ncl_type').attr('data-city'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-state', $('option:selected', '#ncl_type').attr('data-state'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-zip', $('option:selected', '#ncl_type').attr('data-postcode'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-lat', $('option:selected', '#ncl_type').attr('data-lat'));
                $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-lng', $('option:selected', '#ncl_type').attr('data-lng'));
            }
            $('#services tr:eq(' + row_number + ')').find('.table_stop_name').attr('data-postbox', $('#stop_name').attr('data-postbox'));

            if (isNullorEmpty($('#services tr:eq(' + row_number + ')').find('.first_col').find('.delete_stop'))) {
                $('#services tr:eq(' + row_number + ')').find('.first_col').append(' <button class="btn btn-danger btn-sm delete_stop glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete Stop" data-oldstop="" data-newstop="' + row_number + '"></button>');
            }


            var transfer_required = $('#transfer_question').val();
            var transfer_position = $('#transfer_position').val();

            if ($('#transfer_question').is(':checked')) {
                var row_count = $('#services tbody > tr').length;
                if (transfer_position == 1) {
                    var new_row = '<tr><td class="first_col"><button class="btn btn-success btn-sm transfer_stop glyphicon glyphicon-transfer" type="button" data-toggle="tooltip" data-placement="right" title="Add Transfer" data-newstop=""></button> <button class="btn btn-danger btn-sm delete_stop glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete Stop" data-oldstop="" data-newstop=""></button></td><td><textarea readonly class="form-control table_info"></textarea><input type="hidden" readonly class="form-control table_stop_name" /></td><td><input type="text" readonly class="form-control table_duration" data-oldstop="" value="" /></td></tr>';
                    $('#services tr:eq(' + row_number + ')').before(new_row);

                } else {
                    var new_row = '<tr><td class="first_col"><button class="btn btn-success btn-sm transfer_stop glyphicon glyphicon-transfer" type="button" data-toggle="tooltip" data-placement="right" title="Add Transfer" data-newstop=""></button> <button class="btn btn-danger btn-sm delete_stop glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" title="Delete Stop" data-oldstop="" data-newstop=""></button></td><<td><textarea readonly class="form-control table_info"></textarea><input type="hidden" readonly class="form-control table_stop_name" /></td><td><input type="text" readonly class="form-control table_duration" data-oldstop="" value="" /></td></tr>';
                    $('#services tr:eq(' + row_number + ')').after(new_row);
                }

            }

            updateRowCount();
            reset_all();

            edited_stop_array[edited_stop_array.length] = edited_stop_id;
            console.log('edited_stop_array', edited_stop_array);



        });

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

        
        $(document).on('change', '.address_type', function(e) {
            if ($('option:selected', this).val() == 1) {
                $('.ncl_row').addClass('hide');
                $('.customer_address_row').removeClass('hide');
                $('.duration_row').removeClass('hide');
                $('.notes_row').removeClass('hide');
                $('.stop_name_row').removeClass('hide');
                $('.stop_duration_row').removeClass('hide');
                $('.durationpicker-container').removeClass('hide');

                
                console.log($('#duration').val());
                $('.stop_notes_row').removeClass('hide');
            } else if ($('option:selected', this).val() == 2) {
                $('.customer_address_row').addClass('hide');
                $('.ncl_row').removeClass('hide');
                $('.duration_row').removeClass('hide');
                $('.notes_row').removeClass('hide');
                $('.stop_name_row').removeClass('hide');
                $('.stop_duration_row').removeClass('hide');
                $('.durationpicker-container').removeClass('hide');

                $('.stop_notes_row').removeClass('hide');
            }
            $('.transfer_row').removeClass('hide');
            $('.transfer_question').prop('checked', false);
            $('.transfer_position').val(0);
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

                        stop_name = ncl_text;
                        $('.stop_name').attr('data-postbox', addr1);
                    } else {
                        $('.stop_name').attr('data-postbox', "");
                    }
        
        
        
                } else {
                    $('.ncl_row').addClass('hide');
                    $('.create_new_section').removeClass('hide');
                    $('#ncl_type').val(0);
        
                    stop_name = $('option:selected', this).attr('data-compname');
                    $('.stop_name').attr('data-postbox', "");
                }
                $('.stop_name').val(stop_name);
        
            }
        });
        
        
        function saveRecord(context) {
            var currentScript = currentRecord.get();
            var custZee = currentScript.getValue({
                fieldId: 'custpage_zee',
            });

            zee = parseInt(custZee);

            console.log('zee', zee);
            console.log('edited_stop_array', edited_stop_array);

            var return_value = validateLegsNumber();
            console.log('return value', return_value);
            if (return_value == false) {
                showAlert('Please enter a minimum of 2 stops');
                return false;
            }

            var customer_id = currentScript.getValue({
                fieldId: 'custpage_customer_id',
            });

            var service_id = currentScript.getValue({
                fieldId: 'custpage_service_id',
            });

            var add_stop_elem = document.getElementsByClassName("add_stop");
            var edit_stop_elem = document.getElementsByClassName("edit_stop");
            var delete_stop_elem = document.getElementsByClassName("delete_stop_input");
            var table_info_elem = document.getElementsByClassName("table_info");
            var table_duration_elem = document.getElementsByClassName("table_duration");
            var table_stop_name_elem = document.getElementsByClassName("table_stop_name");
            var table_notes_elem = document.getElementsByClassName("table_notes");

            var stored_zee_array = [];
            var linked_zee_array = [];
            var freq_ids_to_be_edited = [];
            var freq_ids_to_be_created = [];
            var freq_ids_to_be_created_linked_zee = [];
            var new_service_leg_id = [];
            var new_service_leg_zee = [];

            var updated_stop_array = [];
            var old_stop_array = [];
            var updated_stop_zee = [];


            var deleted_stop_array = [];
            var deleted_linked_zee_email = [];
            var deleted_message = [];

            var transfer_stop_linked = currentScript.getValue({
                fieldId: 'custpage_transfer_stop_linked',
            });
            transfer_stop_linked = transfer_stop_linked.split(',');
            var transfer_array = [];
            var transfer_zee_array = [];
            var stop_array = [];

            console.log('edit_stop_elem', edit_stop_elem);

            
            for (var i = 0; i < edit_stop_elem.length; i++) {
                var stop_id = edit_stop_elem[i].getAttribute('data-newstop');
                console.log('edit_stop_elem[i]', edit_stop_elem[i]);
                console.log('stop_id', stop_id);
                var old_stop_id = table_info_elem[i].getAttribute('data-oldstop');
                console.log('old_stop_id', old_stop_id);

                var delete_stop_id = delete_stop_elem[i].getAttribute('data-stopid');

                var transfer_type = table_stop_name_elem[i].getAttribute('data-transfertype');
                var linked_zee = table_stop_name_elem[i].getAttribute('data-linkedzee');
                var linked_stop = table_stop_name_elem[i].getAttribute('data-linkedstop');
                var old_value = table_stop_name_elem[i].getAttribute('data-oldvalue');
                var notes = table_stop_name_elem[i].getAttribute('data-notes');

                if (delete_stop_elem[i].value == 'T' && !isNullorEmpty(delete_stop_id)) {
                    var serviceLegSearch = search.load({
                        id: 'customsearch_rp_servicefreq',
                        type: 'customrecord_service_freq'
                    }) 
                    
                    serviceLegSearch.filters.push(search.createFilter({
                        name: 'custrecord_service_freq_service',
                        operator: search.Operator.IS,
                        values: service_id
                    }));
                    if (!isNullorEmpty(linked_stop)) {
                        serviceLegSearch.filters.push(search.createFilter({
                            name: 'custrecord_service_freq_stop',
                            operator: search.Operator.ANYOF,
                            values: delete_stop_id
                        }));
                    } else {
                        serviceLegSearch.filters.push(search.createFilter({
                            name: 'custrecord_service_freq_stop',
                            operator: search.Operator.IS,
                            values: delete_stop_id
                        }));
                    }


                    var resultSet = serviceLegSearch.run();

                    resultSet.each(function(searchResult) {

                        var freq_id = searchResult.getValue('internalid');

                        if (!isNullorEmpty(freq_id)) {
                            var freq_record = record.load({
                                type: 'customrecord_service_freq',
                                id: freq_id,
                            });

                            freq_record.setValue({
                                fieldId: 'isinactive',
                                value: 'T',
                            });

                            freq_record.save({
                                enableSourcing: true,
                            });

                        }
                        return true;
                    });


                    var service_leg_record = record.load({
                        type: 'customrecord_service_leg',
                        id: delete_stop_id,
                    });

                    var deleted_link_zee = service_leg_record.getValue({
                        fieldId: 'custrecord_service_leg_trf_franchisee'
                    });

                    if (!isNullorEmpty(deleted_link_zee)) {

                        deleted_stop_array[deleted_stop_array.length] = delete_stop_id;
                        deleted_linked_zee_email[deleted_linked_zee_email.length] = deleted_link_zee;

                    }

                    service_leg_record.setValue({
                        fieldId: 'isinactive',
                        value: 'T',
                    })

                    service_leg_record.save({
                        enableSourcing: true,
                    });

                    //FOR TRANSFERS
                    if (!isNullorEmpty(linked_stop)) {
                        var linked_service_leg_record = record.load({
                            type: 'customrecord_service_leg',
                            id: linked_stop,
                        });
                        linked_service_leg_record.setValue({
                            fieldId: 'isinactive',
                            value: 'T',
                        });
                        linked_service_leg_record.save({
                            enableSourcing: true
                        });
                    }


                } else {
                    var transfer_created = false;
                    var edited = false;
                    console.log('transfer_type', transfer_type);
                    console.log('old_stop_id', old_stop_id);

                    if (isNullorEmpty(old_stop_id)) {
                        edited = true;
                        var service_leg_record = record.create({
                            type: 'customrecord_service_leg',
                            isDynamic: true
                        });
                        
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_customer',
                            value: customer_id
                        });

                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_service',
                            value: service_id
                        });

                        if (!isNullorEmpty(transfer_type) && transfer_type != 0) {
                            transfer_created = true;
                            transfer_array[transfer_array.length] = i;
                            transfer_zee_array[transfer_zee_array.length] = linked_zee;
                            console.log('creating transfer stop');
                            var service_leg_record_transfer = record.create({
                                type: 'customrecord_service_leg',
                                isDynamic: true,
                            });
                            
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_customer',
                                value: customer_id
                            });

                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_service',
                                value: service_id
                            });

                        }
                    } else if (!isNullorEmpty(old_stop_id)) {
                        if (!isNullorEmpty(transfer_type) && transfer_type != 0) {
                            transfer_array[transfer_array.length] = i;
                            transfer_zee_array[transfer_zee_array.length] = linked_zee;
                        }
                        for (k = 0; k < edited_stop_array.length; k++) {
                            if (old_stop_id == edited_stop_array[k]) {
                                edited = true;
                                var service_leg_record = record.load({
                                    type: 'customrecord_service_leg',
                                    id: old_stop_id,
                                });

                                if (!isNullorEmpty(transfer_type) && transfer_type != 0) {
                                    
                                    var transfer_app_service_leg = service_leg_record.getValue({
                                        fieldId: 'custrecord_service_leg_trf_leg'
                                    });
                                    
                                    console.log('transfer_app_service_leg', transfer_app_service_leg);
                                    if (transfer_app_service_leg == 1) {
                                        var transfer_stop_linked_id = service_leg_record.getValue({
                                            fieldId: 'custrecord_service_leg_trf_linked_stop'
                                        });
                                        
                                        var service_leg_record_transfer = record.load({
                                            type: 'customrecord_service_leg',
                                            id: transfer_stop_linked_id,
                                        });
                                        
                                    }
                                }
                            }
                        }

                    }
                    console.log('edited', edited);
                    if (edited == false) {
                        stop_array[stop_array.length] = old_stop_id;
                        continue;
                    }

                    //Array with the stops of which the name has changed
                    if (old_value != table_stop_name_elem[i].value && !isNullorEmpty(old_value)) {
                        updated_stop_array[updated_stop_array.length] = table_stop_name_elem[i].value;
                        old_stop_array[old_stop_array.length] = old_value;
                        if (linked_zee != 0) {
                            updated_stop_zee[updated_stop_zee.length] = linked_zee;
                        }
                    }

                    service_leg_record.setValue({
                        fieldId: 'name',
                        value: table_stop_name_elem[i].value,
                    });
                    console.log('table_stop_name_elem[i].value', table_stop_name_elem[i].value);

                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_location_type',
                        value: table_info_elem[i].getAttribute('data-addresstype'),
                    });

                    if (!isNullorEmpty(table_stop_name_elem[i].getAttribute('data-ncl')) && table_stop_name_elem[i].getAttribute('data-ncl') != 0) {
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_non_cust_location',
                            value: table_stop_name_elem[i].getAttribute('data-ncl'),
                        });
                        
                        var ncl_inactiveSearch = search.load({
                            id: 'customsearch_noncust_inactiv',
                            type: 'customrecord_ap_lodgment_location'
                        });
                        
                        //CONVERT

                        ncl_inactiveSearch.filters.push(search.createFilter({
                            name: 'internalid',
                            operator: search.Operator.IS,
                            values: table_stop_name_elem[i].getAttribute('data-ncl')
                        }));

                        var resultSet_ncl_inactive = ncl_inactiveSearch.run();
                        var error = false;

                        resultSet_ncl_inactive.each(function(ResultSet) {
                            var ncl_name = ResultSet.getValue('name');
                            showAlert(ncl_name + ' is inactive. Please choose another location for that stop.');
                            error = true;
                            return true
                        })
                        if (error == true) {
                            return false;
                        }
                    }

                    if (table_stop_name_elem[i].getAttribute('data-customeraddressid') != 0) {
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_addr',
                            value: table_stop_name_elem[i].getAttribute('data-customeraddressid'),
                        });
                        
                    }

                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_postal',
                        value: table_stop_name_elem[i].getAttribute('data-postbox'),
                    });
                    
                    if (isNullorEmpty(table_stop_name_elem[i].getAttribute('data-postbox'))) {
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_addr_subdwelling',
                            value: table_stop_name_elem[i].getAttribute('data-addr1'),
                        });
                        
                    }

                    if (!isNullorEmpty(transfer_type) && transfer_type != 0) {
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_trf_type',
                            value: transfer_type,
                        });
                        
                        service_leg_record.setValue({
                            fieldId: 'custrecord_service_leg_trf_leg',
                            value: 1,
                        });

                    }

                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_st_num_name',
                        value: table_stop_name_elem[i].getAttribute('data-addr2'),
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_suburb',
                        value: table_stop_name_elem[i].getAttribute('data-city'),
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_state',
                        value: table_stop_name_elem[i].getAttribute('data-state'),
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_postcode',
                        value: table_stop_name_elem[i].getAttribute('data-zip'),
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_lat',
                        value: table_stop_name_elem[i].getAttribute('data-lat'),
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_addr_lon',
                        value: table_stop_name_elem[i].getAttribute('data-lng'),
                    });
                    
                    var duration = table_duration_elem[i].value;


                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_duration',
                        value: duration,
                    });
                    
                    service_leg_record.setValue({
                        fieldId: 'custrecord_service_leg_notes',
                        value: notes,
                    });
                    

                    var original_service_leg_id = service_leg_record.save({
                        enableSourcing: true,
                    });
                    
                    stop_array[stop_array.length] = original_service_leg_id;



                    if (!isNullorEmpty(transfer_type) && transfer_type != 0 && !isNullorEmpty(service_leg_record_transfer)) {
                        console.log('editing transfer stop');
                        service_leg_record_transfer.setValue({
                            fieldId: 'name',
                            value: table_stop_name_elem[i].value,
                        });
                        

                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_location_type',
                            value: table_info_elem[i].getAttribute('data-addresstype'),
                        });
                        
                        if (!isNullorEmpty(table_stop_name_elem[i].getAttribute('data-ncl')) && table_stop_name_elem[i].getAttribute('data-ncl') != 0) {
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_non_cust_location',
                                value: table_stop_name_elem[i].getAttribute('data-ncl'),
                            });
                            
                        }

                        if (table_stop_name_elem[i].getAttribute('data-customeraddressid') != 0) {
                            service_leg_record.setValue({
                                fieldId: 'custrecord_service_leg_addr',
                                value: table_stop_name_elem[i].getAttribute('data-customeraddressid'),
                            });
                            
                        }

                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_postal',
                            value: table_stop_name_elem[i].getAttribute('data-postbox'),
                        });
                        
                        if (isNullorEmpty(table_stop_name_elem[i].getAttribute('data-postbox'))) {
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_addr_subdwelling',
                                value: table_stop_name_elem[i].getAttribute('data-addr1'),
                            });
                            
                        }

                        if (!isNullorEmpty(transfer_type) && transfer_type != 0) {
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_trf_type',
                                value: transfer_type,
                            });
                            
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_trf_leg',
                                value: 2,
                            });
                            
                            service_leg_record_transfer.setValue({
                                fieldId: 'custrecord_service_leg_trf_linked_stop',
                                value: original_service_leg_id,
                            });
                            
                        }

                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_st_num_name',
                            value: table_stop_name_elem[i].getAttribute('data-addr2'),
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_suburb',
                            value: table_stop_name_elem[i].getAttribute('data-city'),
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_state',
                            value: table_stop_name_elem[i].getAttribute('data-state'),
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_postcode',
                            value: table_stop_name_elem[i].getAttribute('data-zip'),
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_lat',
                            value: table_stop_name_elem[i].getAttribute('data-lat'),
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_addr_lon',
                            value: table_stop_name_elem[i].getAttribute('data-lng'),
                        });
                        
                        var duration = table_duration_elem[i].value;


                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_duration',
                            value: duration,
                        });
                        
                        service_leg_record_transfer.setValue({
                            fieldId: 'custrecord_service_leg_notes',
                            value: notes,
                        });

                        var original_service_leg_id_transfer = service_leg_record_transfer.save({
                            enableSourcing: true,
                        });

                        console.log('transfer_created', transfer_created);
                        if (transfer_created == true) {
                            var service_leg_record = record.load({
                                type: 'customrecord_service_leg',
                                id: original_service_leg_id,
                                isDynamic: true,
                            });

                            service_leg_record.setValue({
                                fieldId: 'custrecord_service_leg_trf_linked_stop',
                                value: original_service_leg_id_transfer,
                            });
                            
                            service_leg_record.save({
                                enableSourcing: true,
                            });
                        }
                    }

                }
            }

            console.log('transfer_array', transfer_array);
            console.log('transfer_zee_array', transfer_zee_array);
            console.log('stop_array', stop_array);

            var stored_string = stored_zee_array.join();
            var linked_string = linked_zee_array.join();
            var created_linked_zee_string = freq_ids_to_be_created_linked_zee.join();
            var deleted_stop_string = deleted_stop_array.join();
            var deleted_linked_zee_string = deleted_linked_zee_email.join();
            var new_service_leg_id_string = new_service_leg_id.join();

            console.log(updated_stop_array);
            console.log(old_stop_array);
            console.log(updated_stop_zee);

            if (!isNullorEmpty(updated_stop_array)) {
                var updated_stop_string = updated_stop_array.join('|');
                var old_stop_string = old_stop_array.join('|');
                var updated_stop_zee_string = updated_stop_zee.join();
            }

            var transfer_string = transfer_array.join();
            var transfer_zee_string = transfer_zee_array.join();
            var stop_string = stop_array.join();

            var currentScript = currentRecord.get();
            currentScript.setValue({
                fieldId: 'custpage_stored_zee',
                value: stored_string,

            });

            currentScript.setValue({
                fieldId: 'custpage_linked_zee',
                value: linked_string,

            });

            currentScript.setValue({
                fieldId: 'custpage_deleted_stop',
                value: deleted_stop_string,

            });

            currentScript.setValue({
                fieldId: 'custpage_deleted_linked_zee',
                value: deleted_linked_zee_string,

            });

            currentScript.setValue({
                fieldId: 'custpage_updated_stop',
                value: updated_stop_string,

            });

            currentScript.setValue({
                fieldId: 'custpage_old_stop',
                value: old_stop_string,

            });

            currentScript.setValue({
                fieldId: 'custpage_updated_stop_zee',
                value: updated_stop_zee_string,

            });

            currentScript.setValue({
                fieldId: 'new_service_leg_id_string',
                value: new_service_leg_id_string,

            });

            currentScript.setValue({
                fieldId: 'transfer_string',
                value: transfer_string,

            });

            currentScript.setValue({
                fieldId: 'transfer_zee_string',
                value: transfer_zee_string,

            });

            currentScript.setValue({
                fieldId: 'stop_string',
                value: stop_string,

            });

            

            return true;

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

        
        function validateLegsNumber() {
            var legs_number = 0;

            var edit_stop_elem = document.getElementsByClassName("edit_stop");
            var total_legs_number = edit_stop_elem.length;

            var delete_stop_elem = document.getElementsByClassName("delete_stop_input");
            var deleted_legs_number = 0;
            for (var i = 0; i < delete_stop_elem.length; ++i) {
                if (delete_stop_elem[i].value == 'T') {
                    deleted_legs_number += 1;
                }
            }


            legs_number = total_legs_number - deleted_legs_number;
            console.log('legs_number', legs_number);
            if (legs_number >= 2) {
                return true
            }
            return false;

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