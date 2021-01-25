 /**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: Calendar view page of the run
 * 
 * @Last Modified by: Sruti Desai
 * 
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
    function(error, runtime, search, url, record, format, email, currentRecord) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var role = runtime.getCurrentUser().role;
        var zee = 0;

        var stops_array = [];
        var stops_duration_array = [];
        var freqs_array = [];
        var freqs_start_array = [];
        
        function showAlert(message) {
            $('#alert').html('<button type="button" class="close">&times;</button>' + message);
            $('#alert').show();
        }
        /**
         * On page initialisation
         */
        function pageInit() {
            
            AddStyle('https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&_xt=.css', 'head');
            $('.services_selected_class').selectator({
                keepOpen: true,
                showAllOptionsOnFocus: true,
                selectFirstOptionOnSearch: false
            });

            $('#alert').hide();
            document.getElementById('tdbody_save').style = 'background-color: #125ab2 !important;color: white;';

            var currentScript = currentRecord.get();
            var zeeCustPage = currentScript.getValue({
                fieldId: 'zee',
            });
            if (isNullorEmpty(zeeCustPage)) {
                zee = 0;
            } else {
                zee = parseInt(zeeCustPage);
            }

            $(window).load(function() {
                // Animate loader off screen
                $(".se-pre-con").fadeOut("slow");;
            });
            
            
            $(document).on('change', '.zee_dropdown', function(event) {
                var zee = $(this).val();

                //PROD = 1149, SB = 1143
            
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1143&deploy=1";
            
                url += "&zee=" + zee + "";
            
                window.location.href = url;
            });

            $(document).on('change', '.run_dropdown', function(event) {
                var run = $(this).val();
                var zee = $('option:selected', '.zee_dropdown').val();
            
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1143&deploy=1";
            
                url += "&zee=" + zee + "&run=" + run;
            
                window.location.href = url;
            });

            $(document).on('click', '#alert .close', function(e) {
                $(this).parent().hide();
            });            
            if (zee != 0) {
                var zeeRecord = record.load({
                    type: record.Type.PARTNER,
                    id: zee,
                    isDynamic: true,
                });
                
                var multi = zeeRecord.getValue({ fieldId: 'custentity_zee_multiple_territory' });
                if (!isNullorEmpty(multi)) {
                    currentScript.setValue({
                        fieldId: 'multi_zee',
                        value: multi.toString()
                    });
                }
                console.log("test", zeeRecord.getText({ name: 'custentity_zee_run_0' })[1]);
                var stop_freq_json_array = [];
                var i = 0;
                while (!isNullorEmpty(zeeRecord.getValue({ fieldId: 'custentity_zee_run_' + i }))){
                    stop_freq_json_array[stop_freq_json_array.length] = zeeRecord.getValue({ fieldId: 'custentity_zee_run_' + i });
                    i++;
                }
                var stop_freq_json_all = stop_freq_json_array.join('},');
                stop_freq_json_all += ']}';

                //console.log('stop_freq_json_all', stop_freq_json_all);
                var parsedStopFreq = JSON.parse(stop_freq_json_all);
                console.log("parsed", parsedStopFreq);
                console.log("data", parsedStopFreq.data);
                $('#calendar').fullCalendar({
                    themeSystem: 'bootstrap4',
                    header: {
                        left: '',
                        center: '',
                        right: 'agendaWeek,listWeek,agendaDay,listDay'
                    },
                    hiddenDays: [0],
                    defaultView: "listWeek",
                    weekNumbers: true,
                    eventLimit: true,
                    slotDuration: "00:01:00", //Displays the time slots shown on the calendar
                    minTime: "05:00:00",
                    maxTime: "18:00:00",
                    contentHeight: "auto",
                    views: {
                        listWeek: {
                            buttonText: 'List Week'
                        },
                        listDay: {
                            buttonText: 'List Day'
                        },
                        week: {
                            buttonText: 'Edit Times',
                            columnHeaderHtml: function(mom) {
                                if (mom.weekday() === 6) {
                                    return '<b>Adhoc Events</b>';
                                } else {
                                    return '<b>' + mom.format('dddd, MMMM Do YYYY') + '</b>';
                                }
                            }
                        },
                        day: {
                            buttonText: 'Day',
                            columnHeaderHtml: function(mom) {
                                if (mom.weekday() === 6) {
                                    return '<b>Adhoc Events</b>';
                                } else {
                                    return '<b>' + mom.format('dddd') + '</b>';
                                }
                            }
                        }
                    },
                    viewRender: function(view, element) {
                        if (view.name == "agendaWeek") {
                            $('#tbl_save').show();
                            $('#tbl_back').show();
                            $('#tbl_submitter').hide();
                            $('#tbl_create_run').hide();
                            $('#tbl_customer_closure').hide();

                        } else {
                            $('#tbl_save').hide();
                            $('#tbl_back').hide();
                            $('#tbl_submitter').show();
                            $('#tbl_create_run').show();
                            $('#tbl_customer_closure').show();

                        }
                    },
                    navLinks: true,
                    allDayText: "Adhoc Events",
                    allDaySlot: false,
                    editable: true,
                    selectable: true,
                    events: parsedStopFreq.data,
                    textEscape: false,
                    eventRender: function(event, element, view) {
                        if (!isNullorEmpty(event.ncl)) {

                        }
                        if (!isNullorEmpty(event.description)) {
                            if (event.ncl == "") {
                                element.find('.fc-title').append(event.description + "<br>");
                            }

                        }
                        if (event.ncl != "") {
                            element.find('.fc-title').append("<ul>");
                            for (var x = 0; x < event.services.length; x++) {

                                element.find('.fc-title').append("<li><b>Service</b>: " + event.services[x].service_text + ' <ul><li>' + event.services[x].customer_notes + ' <b>Customer</b>: ' + event.services[x].customer_text + "  </li><li><b>Run</b>: " + event.services[x].run_plan_text + "</li></ul></li>");

                            }
                            element.find('.fc-title').append("</ul>");
                        } else {
                            element.find('.fc-title').append("<ul>");
                            for (var x = 0; x < event.services.length; x++) {

                                element.find('.fc-title').append("<li><b>Service</b>: " + event.services[x].service_text + "<ul><li><b>Run</b>: " + event.services[x].run_plan_text + "</li></ul></li>");

                            }
                            element.find('.fc-title').append("</ul>");
                        }

                    },
                    eventClick: function(event) {
                        var header = '<div class="form-group"><h4><label class="control-label" for="inputError1">Stop: ' + event.title + ' </label></h4></div>';
                        var body = '';
                        body += '<table border="0" cellpadding="15" id="customer" class="display compact tablesorter table table-striped" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th><b>EDIT</b></th><th><b>CUSTOMER NAME</b></th><th><b>SERVICE</b></th><th><b>STOP NOTES</b></th></tr></thead><tbody>';

                        for (var x = 0; x < event.services.length; x++) {

                            var split_name = event.services[x].customer_text.split('CLOSED - ');

                            if (isNullorEmpty(split_name[0])) {
                                if (event.services[x].customer_zee != zee) {
                                    body += '<tr style="color:#ad3a3a;"><td><span class="d-inline-block" tabindex="0" data-toggle="tooltip" title="You are not allowed to edit because you are not the owner of this customer."><button type="button" class="btn btn-sm btn-warning glyphicon glyphicon-pencil edit_stop" data-serviceid="' + event.services[x].service_id + '" disabled></button></td></span><td>' + event.services[x].customer_text + '</td><td>' + event.services[x].service_text + '</td><td>' + event.services[x].customer_notes + '</td></tr>';
                                } else {
                                    body += '<tr style="color:#ad3a3a;"><td><button type="button" class="btn btn-sm btn-warning glyphicon glyphicon-pencil edit_stop" data-serviceid="' + event.services[x].service_id + '"></button></td><td>' + event.services[x].customer_text + '</td><td>' + event.services[x].service_text + '</td><td>' + event.services[x].customer_notes + '</td></tr>';
                                }
                            } else {
                                if (event.services[x].customer_zee != zee) {
                                    body += '<tr><td><span class="d-inline-block" tabindex="0" data-toggle="tooltip" title="You are not allowed to edit because you are not the owner of this customer."><button type="button" class="btn btn-sm btn-warning glyphicon glyphicon-pencil edit_stop" data-serviceid="' + event.services[x].service_id + '" disabled></button></td></span><td>' + event.services[x].customer_text + '</td><td>' + event.services[x].service_text + '</span></td><td style="max-width:500px; word-break: normal;">' + event.services[x].customer_notes + '</td></tr>';
                                } else {
                                    body += '<tr><td><button type="button" class="btn btn-sm btn-warning glyphicon glyphicon-pencil edit_stop" data-serviceid="' + event.services[x].service_id + '"></button></td><td>' + event.services[x].customer_text + '</td><td>' + event.services[x].service_text + '</td><td style="max-width:500px; word-break: normal;">' + event.services[x].customer_notes + '</td></tr>';
                                }
                            }
                        }

                        body += '</tbody></table>'

                        $('#myModal .modal-header').html(header);
                        $('#myModal .modal-body').html("");
                        $('#myModal .modal-body').html(body);
                        $('#myModal').modal("show");
                    },
                    eventMouseover: function(event, jsEvent, view) {

                    },
                    eventResize: function(event, delta, revertFunc, jsEvent, ui, view) {

                        console.log(event);
                        var start_time2 = moment(event.start.format(), 'HH:mm:ss: A').diff(moment().startOf('day'), 'seconds');
                        var end_time2 = moment(event.end.format(), 'HH:mm:ss: A').diff(moment().startOf('day'), 'seconds');
                        var duration = parseInt(end_time2 - start_time2);

                        var ids = event.id;
                        var service_legs_ids = ids.split(',');
                        alert(event.title + " end is now " + event.end.format());

                        if (!confirm("is this okay?")) {
                            revertFunc();
                        } else {
                            for (var x = 0; x < service_legs_ids.length; x++) {
                                stops_array[stops_array.length] = service_legs_ids[x];
                                stops_duration_array[stops_duration_array.length] = duration;
                            }
                        }

                    },
                    eventDrop: function(event, delta, revertFunc, jsEvent, ui, view) {
                        console.log(event.start.format());
                        var start_time2 = moment(event.start.format()).format('HH:mm:ss: A');
                        console.log(start_time2);
                        var start = onTimeChange(start_time2);
                        console.log(start);
                        var freq_id = event.freq_id;
                        var freq_ids = freq_id.split(',');
                        alert(event.title + " Start Time is: " + event.start.format('HH:mm:ss: A'));
                        if (!confirm("is this okay?")) {
                            revertFunc();
                        } else {
                            for (var x = 0; x < freq_ids.length; x++) {
                                freqs_array[freqs_array.length] = freq_ids[x];
                                freqs_start_array[freqs_start_array.length] = start;
                            }
                        }
                    },
                    select: function(startDate, endDate, jsEvent, view, resource) {
                        alert('selected ' + startDate.format() + ' to ' + endDate.format() + ' on resource ' + resource.id);
                    }
                });

                $('.fc-agendaWeek-button').addClass('btn-warning');
                $('.fc-agendaWeek-button').removeClass('btn-primary');

            }

            JQuery();
            
        }

        function JQuery() {
            $('#myModal').on('show.bs.modal', function(event) {
                $(function() {
                    $('[data-toggle="tooltip"]').tooltip()
                });
            })

            
            /**
             * [description] - On click of the Add button
             */
            $(document).on('click', '.add_class', function(event) {
                var currentScript = currentRecord.get();
                var zeeCust = currentScript.getValue({
                    fieldId: 'zee',
                });
                zee = parseInt(zeeCust);
                var multiCust = currentScript.getValue({
                    fieldId: 'multi_zee',
                });

                var multi_zee = multiCust;

                var multiTextCust = currentScript.getValue({
                    fieldId: 'multi_zee_text',
                });

                var multi_zee_text = multiTextCust;

                var operatorSearch = search.load({
                    id: 'customsearch_app_operator_load',
                    type: 'customrecord_operator'
                });
                
                operatorSearch.filters.push(search.createFilter({
                    name: 'custrecord_operator_franchisee',
                    operator: search.Operator.IS,
                    values: zee
                }));

                var resultSet = operatorSearch.run();

                var row_count = $('#run_table tr').length;

                row_count++;

                var create_run_html = '';

                create_run_html += '<tr><td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-runplanid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Package"></button><input type="hidden" class="delete_run" value="F" /></td>';

                create_run_html += '<td><input class="form-control run_name" type="text" /></td>';
                create_run_html += '<td><select class="form-control operator" >';
                resultSet.each(function(searchResult) {
                    var operator_internal_id = searchResult.getValue("internalid");
                    var operator_name = searchResult.getValue("name");
                    create_run_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';

                    return true;
                });

                create_run_html += '</select></td>';
                if (!isNullorEmpty(multi_zee)) {
                    create_run_html += '<td><select multiple class="form-control run_zee">';
                    var multi_zee_array = multi_zee.split(',');
                    var multi_zee_text_array = multi_zee_text.split(',');
                    for (x = 0; x < multi_zee_array.length; x++) {

                        create_run_html += '<option value="' + multi_zee_array[x] + '">' + multi_zee_text_array[x] + '</option>';

                    }
                    create_run_html += '</td>';
                }
                create_run_html += '</tr>';

                $('#run_table tr:last').after(create_run_html);

                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_run_class add_class');
                $(this).find('edit_class').prop('title', 'Edit Package');
                $(this).closest('tr').find('.run_name').attr("readonly", "readonly");
                $(this).closest('tr').find('.operator').attr("readonly", "readonly");

                $(this).closest('tr').find('.first_col').append('<button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" data-runplanid="" title="Delete"></button>');

            });

            
            $(document).on('click', '.edit_run_class', function(event) {
                var currentScript = currentRecord.get();
                var zeeCust = currentScript.getValue({
                    fieldId: 'zee',
                });
                var multiCust = currentScript.getValue({
                    fieldId: 'multi_zee',
                });

                var multiTextCust = currentScript.getValue({
                    fieldId: 'multi_zee_text',
                });

                zee = parseInt(zeeCust);
                var multi_zee = multiCust;
                var multi_zee_text = multiTextCust;


                var runplanid = $(this).attr('data-runplanid');
                $(this).closest('tr').find('.run_name').removeAttr("readonly");
                $(this).closest('tr').find('.operator').removeAttr("readonly");
                if (!isNullorEmpty(multi_zee)) {
                    $(this).closest('tr').find('.run_zee').removeAttr("readonly");
                }


                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_run_class save_edit_class');

            });

            
            $(document).on('click', '.save_edit_class', function(event) {
                var currentScript = currentRecord.get();
                var zeeCust = currentScript.getValue({
                    fieldId: 'zee',
                });
                var multiCust = currentScript.getValue({
                    fieldId: 'multi_zee',
                });

                var multiTextCust = currentScript.getValue({
                    fieldId: 'multi_zee_text',
                });

                zee = parseInt(zeeCust);
                var multi_zee = multiCust;
                var multi_zee_text = multiTextCust;


                var runplanid = $(this).attr('data-runplanid');
                $(this).closest('tr').find('.run_name').attr("readonly", "readonly");
                $(this).closest('tr').find('.operator').attr("readonly", "readonly");
                if (!isNullorEmpty(multi_zee)) {
                    $(this).closest('tr').find('.run_zee').attr("readonly", "readonly");
                }


                $(this).toggleClass('btn-warning btn-success')
                $(this).toggleClass('glyphicon-pencil glyphicon-plus');
                $(this).toggleClass('edit_run_class save_edit_class');

            });

            
            $(document).on('click', '.edit_stop', function(event) {
                var currentScript = currentRecord.get();
                var zeeCust = currentScript.getValue({
                    fieldId: 'zee',
                });

                var service_id = $(this).attr('data-serviceid');
                zee = parseInt(zeeCust);


                var params = {
                    serviceid: service_id,
                    scriptid: 'customscript_sl_full_calendar_2',
                    deployid: 'customdeploy_sl_full_calender_2',
                    zee: zee
                }
                params = JSON.stringify(params);

                var output = url.resolveScript({
                    scriptId: 'customscript_sl_rp_create_stops_2',
                    deploymentId: 'customdeploy_sl_rp_create_stops_2',
                });
                
                var upload_url = baseURL + output + '&unlayered=T&custparam_params=' + params;
                window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");

            });

            
            /**
             * [description] - On click of the delete button
             */
            $(document).on('click', '.remove_class', function(event) {

                if (confirm('Are you sure you want to delete this item?\n\nThis action cannot be undone.')) {

                    $(this).closest('tr').find('.delete_run').val("T");
                    $(this).closest("tr").hide();
                }



            });

            
            /**
             * [description] - On click of the delete button
             */
            $(document).on('click', '.save_run', function(event) {
                var currentScript = currentRecord.get();
                var zeeCust = currentScript.getValue({
                    fieldId: 'zee',
                });
                var multiCust = currentScript.getValue({
                    fieldId: 'multi_zee',
                });

                var multiTextCust = currentScript.getValue({
                    fieldId: 'multi_zee_text',
                });

                zee = parseInt(zeeCust);
                var multi_zee = multiCust;
                var multi_zee_text = multiTextCust;

                var delete_run_elem = document.getElementsByClassName("delete_run");
                var edit_class_elem = document.getElementsByClassName("edit_run_class");
                var run_name_elem = document.getElementsByClassName("run_name");
                var operator_elem = document.getElementsByClassName("operator");
                var run_zee_elem = document.getElementsByClassName("run_zee");

                console.log(run_zee_elem);
                console.log(run_zee_elem[0]);
                for (var i = 0; i < edit_class_elem.length; ++i) {

                    if (delete_run_elem[i].value == 'T') {
                        var runPlanID = edit_class_elem[i].getAttribute('data-runplanid');
                        if (!isNullorEmpty(runPlanID)) {
                            var run_plan_record = record.load({
                                type: 'customrecord_run_plan',
                                id: runPlanID,
                            });
                            
                            run_plan_record.setValue({ fieldId: 'isinactive', value: 'T'});
                            run_plan_record.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                        }
                    } else {
                        var runPlanID = edit_class_elem[i].getAttribute('data-runplanid');
                        if (isNullorEmpty(runPlanID)) {
                            var run_plan_record = nlapiCreateRecord('customrecord_run_plan');
                        } else {
                            console.log('edit')
                            var run_plan_record = record.load({
                                type: 'customrecord_run_plan',
                                id: runPlanID,
                            });
                        }
                        if (isNullorEmpty(multi_zee)) {
                            run_plan_record.setValue({ fieldId: 'custrecord_run_franchisee', value: zee });
                        }

                        run_plan_record.setValue({ fieldId: 'name', value: run_name_elem[i].value });

                        for (var y = 0, len = operator_elem[i].options.length; y < len; y++) {
                            opt = operator_elem[i].options[y];

                            if (opt.selected === true) {
                                run_plan_record.setValue({ fieldId: 'custrecord_run_operator', value: operator_elem[i].options[y].value });
                            }
                        }
                        if (!isNullorEmpty(multi_zee)) {
                            var multi_zee_array = [];
                            for (var y = 0, len = run_zee_elem[i].options.length; y < len; y++) {
                                opt = run_zee_elem[i].options[y];

                                if (opt.selected === true) {
                                    multi_zee_array[multi_zee_array.length] = run_zee_elem[i].options[y].value
                                }
                            }
                            run_plan_record.setValue({ fieldId: 'custrecord_run_franchisee', value: multi_zee_array });
                        }

                        run_plan_record.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                    }

                }

            });


        }

        
        function onclick_save() {
            var currentScript = currentRecord.get();
                
            console.log(stops_array);
            console.log(stops_duration_array);
            console.log(freqs_array);
            console.log(freqs_start_array);
            currentScript.setValue({
                fieldId: 'stops',
                value: stops_array.join(',')
            });
            currentScript.setValue({
                fieldId: 'duration',
                value: stops_duration_array.join(',')
            });

            currentScript.setValue({
                fieldId: 'freqs',
                value: freqs_array.join(',')
            });

            currentScript.setValue({
                fieldId: 'start_times',
                value: freqs_start_array.join(',')
            });

            currentScript.setValue({
                fieldId: 'save_button',
                value: 'T'
            });

           
            $('#submitter').trigger('click');
        }

        function saveRecord() {
            var currentScript = currentRecord.get();
            var zeeCust = currentScript.getValue({
                fieldId: 'zee',
            });

            zee = parseInt(zeeCust);
        
            console.log(zee);
            if (!isNullorEmpty(zee)) {
                var runPlanSearch = search.load({
                    id: 'customsearch_app_run_plan_active',
                    type: 'customrecord_run_plan'
                });

                runPlanSearch.filters.push(search.createFilter({
                    name: 'custrecord_run_franchisee',
                    operator: search.Operator.IS,
                    values: zee
                }));

                        
        
        
                var resultSet_runPlan = runPlanSearch.run();
                var count_run = 0;
                resultSet_runPlan.each(function(searchResult_runPlan) {
        
                    count_run++;
                    return true;
                });
        
                if (count_run == 0) {
                    showAlert('Please Create a Run');
                    return false;
                }
        
            } else {
                showAlert('Please Select Franchisee');
                return false;
            }
        
            return true;
        }
        
        function convertSecondsToMinutes(seconds) {
            var min = Math.floor(seconds / 60);
            var sec = seconds % 60;

            var minutes_array = [];

            minutes_array[0] = min;
            minutes_array[1] = sec;

            return minutes_array;
        }


        function convertTo24Hour(time) {
            nlapiLogExecution('DEBUG', 'time', time);
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

        function arraysEqual(_arr1, _arr2) {

            if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length)
                return false;
        
            var arr1 = _arr1.concat().sort();
            var arr2 = _arr2.concat().sort();
        
            for (var i = 0; i < arr1.length; i++) {
        
                if (arr1[i] !== arr2[i])
                    return false;
        
            }
        
            return true;
        
        }
        
        function wordWrap(str, maxWidth) {
            var newLineStr = "</br>";
            done = false;
            res = '';
            do {
                found = false;
                // Inserts new line at first whitespace of the line
                for (i = maxWidth - 1; i >= 0; i--) {
                    if (testWhite(str.charAt(i))) {
                        res = res + [str.slice(0, i), newLineStr].join('');
                        str = str.slice(i + 1);
                        found = true;
                        break;
                    }
                }
                // Inserts new line at maxWidth position, the word is too long to wrap
                if (!found) {
                    res += [str.slice(0, maxWidth), newLineStr].join('');
                    str = str.slice(maxWidth);
                }

                if (str.length < maxWidth)
                    done = true;
            } while (!done);

            return res + str;
        }

        function AddJavascript(jsname, pos) {
            var tag = document.getElementsByTagName(pos)[0];
            var addScript = document.createElement('script');
            addScript.setAttribute('type', 'text/javascript');
            addScript.setAttribute('src', jsname);
            tag.appendChild(addScript);
        }
        
        function testWhite(x) {
            var white = new RegExp(/^\s$/);
            return white.test(x.charAt(0));
        };
        
        function getDate() {
            var date = new Date();
            date = format.format({
                value: date,
                type: format.Type.DATE,
                timezone: format.Timezone.AUSTRALIA_SYDNEY
            });
        
            return date;
        }

        function AddStyle(cssLink, pos) {
            var tag = document.getElementsByTagName(pos)[0];
            var addLink = document.createElement('link');
            addLink.setAttribute('type', 'text/css');
            addLink.setAttribute('rel', 'stylesheet');
            addLink.setAttribute('href', cssLink);
            tag.appendChild(addLink);
        }
        
        function onclick_customerClosure() {
            var currentScript = currentRecord.get();
            var zeeCustPage = currentScript.getValue({
                fieldId: 'zee',
            });
            zee = parseInt(zeeCustPage);

            if (zee != 0) {

                var params = {
                    scriptid: 'customscript_sl_full_calendar_2',
                    deployid: 'customdeploy_sl_full_calender_2',
                    zee: zee
                }
                params = JSON.stringify(params);


                var output = url.resolveScript({
                    scriptId: 'customscript_sl_scheduled_cust_closure_2',
                    deploymentId: 'customdeploy_sl_scheduled_cust_closure_2',
                });

                var upload_url = baseURL + output + '&unlayered=T&custparam_params=' + params;
                window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
            }
        }

        function onclick_networkMap(zee){

            var output = url.resolveScript({
                scriptId: 'customscript_sl_run_planner_map_2',
                deploymentId: 'customdeploy_sl_run_planner_map_2',
            });
            window.open(output + "&zee=" + zee +'');
        }

        
        function download(strData, strFileName, strMimeType) {
            var D = document,
                A = arguments,
                a = D.createElement("a"),
                d = A[0],
                n = A[1],
                t = A[2] || "text/plain";

            //build download link:
            a.href = "data:" + strMimeType + "," + escape(strData);

            if (window.MSBlobBuilder) {
                var bb = new MSBlobBuilder();
                bb.append(strData);
                return navigator.msSaveBlob(bb, strFileName);
            } /* end if(window.MSBlobBuilder) */

            if ('download' in a) {
                a.setAttribute("download", n);
                a.innerHTML = "downloading...";
                D.body.appendChild(a);
                setTimeout(function() {
                    var e = D.createEvent("MouseEvents");
                    e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false,
                        false, false, 0, null);
                    a.dispatchEvent(e);
                    D.body.removeChild(a);
                }, 66);
                return true;
            } /* end if('download' in a) */

            //do iframe dataURL download:
            var f = D.createElement("iframe");
            D.body.appendChild(f);
            f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" :
                "") + "," + (window.btoa ? window.btoa : escape)(strData);
            setTimeout(function() {
                D.body.removeChild(f);
            }, 333);
            return true;
        } /* end download() */


        function onclick_createRun() {
            var currentScript = currentRecord.get();
            var zeeCust = currentScript.getValue({
                fieldId: 'zee',
            });
            var multiCust = currentScript.getValue({
                fieldId: 'multi_zee',
            });
            var multiTextCust = currentScript.getValue({
                fieldId: 'multi_zee_text',
            });
            zee = parseInt(zeeCust);
            multi_zee = multiCust;
            multi_zee_text = multiTextCust;
        
            if (zee != 0) {
                var operatorSearch = search.load({
                    id: 'customsearch_app_operator_load',
                    type: 'customrecord_operator'
                })
                        
                if (isNullorEmpty(multi_zee)) {
                    operatorSearch.filters.push(search.createFilter({
						name: 'custrecord_operator_franchisee',
						operator: search.Operator.IS,
						values: zee
                    }));
                } else {
                    var multi_zee_array = multi_zee.split(',');
                    operatorSearch.filters.push(search.createFilter({
						name: 'custrecord_operator_franchisee',
						operator: search.Operator.ANYOF,
						values: multi_zee_array
                    }));
                }
        
        
                var resultSet = operatorSearch.run();
        
                var runPlanSearch = search.load({
                    id: 'customsearch_app_run_plan_active',
                    type: 'customrecord_run_plan'
                });
                        
                if (isNullorEmpty(multi_zee)) {
                    runPlanSearch.filters.push(search.createFilter({
						name: 'custrecord_run_franchisee',
						operator: search.Operator.IS,
						values: zee
                    }));
                } else {
                    var multi_zee_array = multi_zee.split(',');
                    runPlanSearch.filters.push(search.createFilter({
						name: 'custrecord_run_franchisee',
						operator: search.Operator.ANYOF,
						values: multi_zee_array
                    }));

                }
            
                var resultSet_runPlan = runPlanSearch.run();
        
                var create_run_html = '<table id= "run_table" class="table table-responsive table-striped"><thead><tr class="info"><th><b>ACTION</b></th><th><b>RUN NAME</b></th><th><b>OPERATOR</b></th>';
                if (!isNullorEmpty(multi_zee)) {
                    create_run_html += '<th><b>TERRITORIES</b></th>'
                }
        
                create_run_html += '</thead><tbody>';
        
                resultSet_runPlan.each(function(searchResult_runPlan) {
        
                    create_run_html += '<tr>';
        
                    create_run_html += '<td class="first_col"><button class="btn btn-warning btn-sm edit_run_class glyphicon glyphicon-pencil" data-runplanid="' + searchResult_runPlan.getValue('internalid') + '" type="button" data-toggle="tooltip" data-placement="right" title="Edit"></button><button class="btn btn-danger btn-sm remove_class glyphicon glyphicon-trash" type="button" data-toggle="tooltip" data-placement="right" data-runplanid="' + searchResult_runPlan.getValue('internalid') + '" title="Delete"></button><input type="hidden" class="delete_run" value="F" /></td>';
        
                    create_run_html += '<td><input class="form-control run_name" type="text" value="' + searchResult_runPlan.getValue('name') + '" readonly/></td>';
                    create_run_html += '<td><select class="form-control operator" readonly>';
                    resultSet.each(function(searchResult) {
                        var operator_internal_id = searchResult.getValue("internalid");
                        var operator_name = searchResult.getValue("name");
        
                        if (searchResult_runPlan.getValue('custrecord_run_operator') == operator_internal_id) {
                            create_run_html += '<option selected value="' + operator_internal_id + '">' + operator_name + '</option>';
                        } else {
                            create_run_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';
                        }
        
                        return true;
                    });

                    create_run_html += '</select></td>';
                    if (!isNullorEmpty(multi_zee)) {
                        create_run_html += '<td><select multiple class="form-control run_zee" readonly>';
                        var multi_zee_array = multi_zee.split(',');
                        var multi_zee_text_array = multi_zee_text.split(',');
                        for (x = 0; x < multi_zee_array.length; x++) {
                            var zee_array = searchResult_runPlan.getValue('custrecord_run_franchisee').split(',');
                            var index = zee_array.indexOf(multi_zee_array[x]);
                            if (index > -1) {
                                create_run_html += '<option selected value="' + multi_zee_array[x] + '">' + multi_zee_text_array[x] + '</option>';
                            } else {
                                create_run_html += '<option value="' + multi_zee_array[x] + '">' + multi_zee_text_array[x] + '</option>';
                            }
                        }
                        create_run_html += '</td>';
                    }
                    create_run_html += '</tr>';
        
                    return true;
                });
        
        
        
                create_run_html += '<tr>';
        
                create_run_html += '<td class="first_col"><button class="btn btn-success btn-sm add_class glyphicon glyphicon-plus" data-runplanid="" type="button" data-toggle="tooltip" data-placement="right" title="Add New Package"></button><input type="hidden" class="delete_run" value="F" /></td>';
        
                create_run_html += '<td><input class="form-control run_name" type="text" /></td>';
                create_run_html += '<td><select class="form-control operator" >';
                resultSet.each(function(searchResult) {
        
                    var operator_internal_id = searchResult.getValue("internalid");
                    var operator_name = searchResult.getValue("name");
        
                    create_run_html += '<option value="' + operator_internal_id + '">' + operator_name + '</option>';
        
                    return true;
                })
                create_run_html += '</select></td>';
                if (!isNullorEmpty(multi_zee)) {
                    create_run_html += '<td><select multiple class="form-control run_zee">';
                    var multi_zee_array = multi_zee.split(',');
                    var multi_zee_text_array = multi_zee_text.split(',');
                    for (x = 0; x < multi_zee_array.length; x++) {
        
                        create_run_html += '<option value="' + multi_zee_array[x] + '">' + multi_zee_text_array[x] + '</option>';
        
                    }
                    create_run_html += '</td>';
                }
        
                create_run_html += '</tr>';
        
                create_run_html += '</tbody></table>';
                $('.modal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Create Run</label></h4></div>');
                $('.modal .modal-body').html("");
                $('.modal .modal-body').html(create_run_html);
                $('.modal').modal("show");
            } else {
                $('.modal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1">Please Select Franchisee</label></h4></div>');
                $('.modal .modal-body').html("");
                $('.modal').modal("show");
            }
        
        }
        

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            onclick_customerClosure: onclick_customerClosure,
            onclick_networkMap: onclick_networkMap,
            download: download,
            onclick_createRun: onclick_createRun
            
        };  
    }

    
);