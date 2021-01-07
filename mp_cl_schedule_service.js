/**
 * Module Description
 * 
 * NSVersion    Date                    Author         
 * 1.00         2018-03-09 10:49:03         Ankith 
 *
 * Remarks:         
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2020-01-10 12:07:17
 *
 */
var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var delete_freq_array = [];
var freq_change = false;
var savingRecord = false;

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

$(window).load(function() {
    // Animate loader off screen
    $(".se-pre-con").fadeOut("slow");
});

// $(document).on('click', '.close', function(e) {
//  console.log('inside alert close');
//  $(this).parent().hide();
// });
/*
$(document).on('click', '.instruction_button', function() {
    $(".ng-scope").css({
        "padding-top": "170px"
    });

});*/

$('.collapse').on('shown.bs.collapse', function() {
    $("#container").css({
        "padding-top": "200px"
    });
})

$('.collapse').on('hide.bs.collapse', function() {
    $("#container").css({
        "padding-top": "80px"
    });
})

function validateFrequency() {
    if (!($('#monday').is(':checked')) && !($('#tuesday').is(':checked')) && !($('#wednesday').is(':checked')) && !($('#thursday').is(':checked')) && !($('#friday').is(':checked')) && !($('#adhoc').is(':checked'))) {
        $('.tabs').hide();
        return false;
    } else {
        $('.tabs').show();
        return true;
    }
}


function goToByScroll(id) {
    // Remove "link" from the ID
    // id = id.replace("link", "");
    // Scroll
    $('html,body').animate({
        scrollTop: $("#" + id).offset().top
    }, 'slow');
}

function showAlert(message) {
    $('#myModal .modal-header').html('<div class="form-group"><h4><label class="control-label" for="inputError1" style="color: #e93578; ">Error!!</label></h4></div>');
    $('#myModal .modal-body').html("");
    $('#myModal .modal-body').html(message);
    $('#myModal').modal("show");
    // $('#alert').html('<button type="button" class="close">&times;</button>' + message);
    // $('#alert').show();
    // goToByScroll('alert');
    // setInterval(function() {
    //  $("#alert .close").click();
    // }, 5000);
}


$(document).on('click', '#alert .close', function(e) {
    $(this).parent().hide();
});

$(document).on('click', '#myModal .btn', function(e) {
    if (savingRecord == true) {
        window.location.reload();
    }
});


function onclick_back() {
    var params = {
        zee: parseInt(nlapiGetFieldValue('zee')),
        serviceid: nlapiGetFieldValue('service_id'),
        scriptid: nlapiGetFieldValue('custpage_suitlet'),
        deployid: nlapiGetFieldValue('custpage_deploy')
    }
    params = JSON.stringify(params);
    console.log(nlapiGetFieldValue('custpage_suitlet'))
    console.log(nlapiGetFieldValue('custpage_deploy'))
    var upload_url = baseURL + nlapiResolveURL('SUITELET', nlapiGetFieldValue('custpage_suitlet'), nlapiGetFieldValue('custpage_deploy')) + '&unlayered=T&service_id=' + nlapiGetFieldValue('service_id') + '&custparam_params=' + params;
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}

function onclick_mainpage() {
    var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar', 'customdeploy_sl_full_calender') + '&unlayered=T';
    window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
}


function pageInit() {
    $('#alert').hide();
    // $(".tab-content").css("border", 'groove');

    validateFrequency();
}

var transfer_stop_linked = nlapiGetFieldValue('custpage_transfer_stop_linked');
transfer_stop_linked = transfer_stop_linked.split(',');
var transfer_type = nlapiGetFieldValue('custpage_transfer_type');
transfer_type = transfer_type.split(',');
console.log('transfer_stop_linked', transfer_stop_linked);
console.log('transfer_type', transfer_type);

$(".nav-tabs").on("click", "li a", function(e) {
    var main_stop = $(this).attr('href');
    var main_stop_det = $(this);
    var freq_array = $(this).attr('data-freq');
    console.log('main stop', main_stop);
    console.log('freq_array', freq_array);
    var error = false;
    var old_stored_run;
    var stored_run;
    var transfer_different_each_day;
    var service_time_each_day_array = [];
    var earliest_time_each_day_array = [];
    var latest_time_each_day_array = [];

    var exit = true;
    $(".tabs").each(function() {
        $(this).find(".nav-tabs li").each(function(index, element) {
            var stop_id = $(this).children('a').attr('href');
            console.log('stop_id: ' + stop_id);
            $(this).children('a').css({
                "background-color": "white",
                "color": "#337ab7"
            });
            //console.log('Current Clicked tab' + main_stop_det.attr('class'));
            //console.log('tab seq ' + $(this).attr('class'));
            console.log($(this).attr('class'));
            if ($(this).attr('class') == 'active') {
                //$(this).children('a').css('background-color', '#8080809c');
                console.log('inside active tab');
                stop_id = stop_id.split('#');
                var main_stop_id = main_stop.split('#');
                console.log('stop_id[1]', stop_id[1]);
                if (!isNullorEmpty(stop_id[1])) {
                    var table_id = '#services' + stop_id[1] + ' > tbody > tr';
                    var rows;
                    if (!isNullorEmpty($(table_id))) {
                        rows = $(table_id);
                        console.log('rows.length', rows.length);
                    }

                    if (rows.length == 1) {
                        var run = $('#' + stop_id[1]).find('#run' + stop_id[1]).val();
                        old_stored_run = $('#' + stop_id[1]).find('#run' + stop_id[1]).attr('data-oldrun');
                        var run_freq_id = $('#' + stop_id[1]).find('#run' + stop_id[1]).attr('data-freqid');
                        var service_time = $('#' + stop_id[1]).find('#service_time' + stop_id[1]).val();
                        var earliest_time = ($('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).val());
                        var latest_time = ($('#' + stop_id[1]).find('#latest_time' + stop_id[1]).val());

                        console.log('service_time', service_time);


                        var message = '';

                        console.log('run ' + run);
                        console.log('service_time', service_time);

                        if (isNullorEmpty(run) || run == 0) {
                            message += 'Please Select the Run</br>';
                            error = true;
                        } else {
                            stored_run = run;
                        }

                        if (isNullorEmpty(service_time)) {
                            message += 'Please Select the Service Time</br>';
                            error = true;
                        }

                        if (isNullorEmpty(earliest_time)) {
                            message += 'Please Select the Earliest Time</br>';
                            error = true;
                        }

                        if (isNullorEmpty(latest_time)) {
                            message += 'Please Select the Latest Time</br>';
                            error = true;
                        }

                        if (error == true) {
                            // $(this).children('a').css('background-color', '#337ab7')
                            showAlert(message);
                            exit = false;
                        } else {

                            console.log('inside 1');
                            console.log(main_stop_det);
                            main_stop_det.tab('show');

                            var main_stop_id = main_stop.split('#');
                            console.log('old_stored_run', old_stored_run);
                            if (isNullorEmpty(old_stored_run)) {
                                $('#' + main_stop_id[1]).find('#run' + main_stop_id[1]).val(stored_run);
                            }
                            for (i = 0; i < transfer_stop_linked.length; i++) {
                                if (main_stop_id[1] == transfer_stop_linked[i]) {
                                    if (isNullorEmpty(old_stored_run)) {
                                        $('#' + main_stop_id[1]).find('#run' + main_stop_id[1]).val('');
                                    }
                                    if (transfer_type[i] == 1) {
                                        $('#' + main_stop_id[1]).find('#service_time' + main_stop_id[1]).val(service_time);
                                        $('#' + main_stop_id[1]).find('#earliest_time' + main_stop_id[1]).val(earliest_time);
                                        $('#' + main_stop_id[1]).find('#latest_time' + main_stop_id[1]).val(latest_time);
                                        $('#' + main_stop_id[1]).find('#service_time' + main_stop_id[1]).prop('readonly', true);
                                        $('#' + main_stop_id[1]).find('#earliest_time' + main_stop_id[1]).prop('readonly', true);
                                        $('#' + main_stop_id[1]).find('#latest_time' + main_stop_id[1]).prop('readonly', true);
                                    }
                                }
                            }
                            exit = false;


                        }

                    } else {
                        console.log('inside different day');
                        if ($('.different_each_day').is(':checked')) {
                            $(table_id).each(function(i, row) {
                                if (i > 0) {
                                    var $row = $(row);

                                    var freq_id = $row.find('.run').attr('data-freqid');
                                    var run = $row.find('.run').val();
                                    var service_time = ($row.find('#table_service_time').val());
                                    var earliest_time = ($row.find('#table_earliest_time').val());
                                    var latest_time = ($row.find('#table_latest_time').val());


                                    console.log(run);
                                    var error = false;
                                    var message = '';

                                    if (isNullorEmpty(run)) {
                                        message += 'Please Select the Run</br>';
                                        error = true;
                                    }

                                    if (isNullorEmpty(service_time)) {
                                        message += 'Please Select the Service Time</br>';
                                        error = true;
                                    }

                                    if (isNullorEmpty(earliest_time)) {
                                        message += 'Please Select the Earliest Time</br>';
                                        error = true;
                                    }

                                    if (isNullorEmpty(latest_time)) {
                                        message += 'Please Select the Latest Time</br>';
                                        error = true;
                                    }

                                    if (error == true) {
                                        $(this).children('a').css('background-color', '#337ab7')
                                        showAlert(message);
                                        exit = false;
                                    } else {
                                        console.log('inside 2');
                                        $(this).children('a').tab('show');
                                        //$(this).find('.different_each_day').prop('checked', true);
                                        for (y = 0; y < transfer_stop_linked.length; y++) {
                                            if (main_stop_id[1] == transfer_stop_linked[y] && transfer_type[i] == 1) {
                                                transfer_different_each_day = true;
                                                console.log('transfer_different_each_day', transfer_different_each_day);
                                            }
                                        }
                                        service_time_each_day_array[service_time_each_day_array.length] = service_time;
                                        earliest_time_each_day_array[earliest_time_each_day_array.length] = earliest_time;
                                        latest_time_each_day_array[latest_time_each_day_array.length] = latest_time;

                                    }

                                }
                            })
                        }
                    }
                }
            } else if (main_stop == stop_id && error != true) {
                console.log('inside 3');
                //$(this).children('a').css('background-color', '#8080809c');
                $(this).children('a').tab('show');
                //$(this).children('a').css('background-color', '#8080809c');

                stop_id = stop_id.split('#');
                old_stored_run = $('#' + stop_id[1]).find('#run' + stop_id[1]).attr('data-oldrun');
                stored_run = $('#' + stop_id[1]).find('#run' + stop_id[1]).val();
                console.log('stored_run', stored_run);
                console.log('old_stored_run', old_stored_run);

                if (isNullorEmpty(old_stored_run)) {
                    $('#' + stop_id[1]).find('#run' + stop_id[1]).val(stored_run);
                }
                //FOR THE SECOND PART OF A TRANSFER THE RUN IS NOT PREFILLED AND IF FACE TO FACE, THE TIMES ARE NOT EDITABLED (SAME AS THE TIMES OF THE FIRST PART OF THE TRANSFER)
                for (i = 0; i < transfer_stop_linked.length; i++) {
                    if (stop_id[1] == transfer_stop_linked[i]) {
                        if (isNullorEmpty(old_stored_run)) {
                            $('#' + stop_id[1]).find('#run' + stop_id[1]).val('');
                        }
                        if (transfer_type[i] == 1) {
                            $('#' + stop_id[1]).find('#service_time' + stop_id[1]).val(service_time);
                            $('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).val(earliest_time);
                            $('#' + stop_id[1]).find('#latest_time' + stop_id[1]).val(latest_time);
                            $('#' + stop_id[1]).find('#service_time' + stop_id[1]).prop('readonly', true);
                            $('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).prop('readonly', true);
                            $('#' + stop_id[1]).find('#latest_time' + stop_id[1]).prop('readonly', true);
                        }
                    }
                }
                if (!isNullorEmpty(transfer_different_each_day) && transfer_different_each_day == true) {
                    if ($('#' + stop_id[1] + '').find('.different_each_day').is(':checked') == false) {
                        console.log('click different each day');
                        $('#' + stop_id[1] + '').find('.different_each_day').click();
                    }
                    var table_id = '#services' + stop_id[1] + ' > tbody > tr';
                    //console.log('$(table_id)', $(table_id));
                    if (!isNullorEmpty($(table_id))) {
                        rows = $(table_id);
                        console.log('rows.length', rows.length);
                    }
                    $(table_id).each(function(i, row) {
                        if (i > 0) {
                            var $row = $(row);
                            $row.find('#table_service_time').val(service_time_each_day_array[i - 1]);
                            $row.find('#table_earliest_time').val(earliest_time_each_day_array[i - 1]);
                            $row.find('#table_latest_time').val(latest_time_each_day_array[i - 1]);
                            $row.find('#table_service_time').prop('readonly', true);
                            $row.find('#table_earliest_time').prop('readonly', true);
                            $row.find('#table_latest_time').prop('readonly', true);
                        }
                    })
                }

            }
            console.log('exit 1' + exit);
            if (exit == false) {
                return false;
            }
        });
        console.log('exit 2' + exit);
        if (exit == false) {
            return false;
        }
    });
    $(this).css({
        "background-color": "rgb(50, 122, 183)",
        "color": "white"
    });

});


function validateTimes() {
    if (service_time_array.length > 1) {
        for (var x = 0; x < service_time_array.length; x++) {
            if (service_time_array[x + 1] < service_time_array[x]) {
                console.log('service_time_array[x + 1]', service_time_array[x + 1]);
                console.log('service_time_array[x]', service_time_array[x]);
                showAlert('Please Enter the correct Service Time. Service Time entered for stop ' + (x + 2) + ' is before stop ' + (x + 1));
                return false;
                break;
            }

            if (!isNullorEmpty(earliest_time_array[x])) {
                if (earliest_time_array[x] > service_time_array[x]) {
                    showAlert('Earliest Time is after the Service Time. Please Check.');
                    return false;
                    break;
                }
            }

            if (!isNullorEmpty(latest_time_array[x])) {
                if (latest_time_array[x] < service_time_array[x]) {
                    showAlert('Latest Time is before the Service Time. Please Check');
                    return false;
                    break;
                }
            }
        }
    }
}

function uncheckDailyAdhocFreq() {
    $('#daily').prop('checked', false);
    $('#adhoc').prop('checked', false);
}

$(".tab-pane").on('focusout', '.service_time', function() {
    console.log('focusout');
    if (isNullorEmpty($(this).val())) {
        showAlert('Please Enter the Time or Select AM/PM');
        $(this).focus();
        return false;
    } else {
        var stop_no = $(this).attr('data-stopno');
        console.log('stop_no', stop_no);
        var stop_array = stop_no.split('_');
        console.log('stop_array', stop_array);
        var stop_id = $(this).attr('data-stopid');
        if (this.id != 'table_service_time') {
            if (stop_array[1] == 0) {
                service_time_array[stop_array[0] - 1] = $(this).val();
            } else {
                service_time_array[stop_array[1] - 1] = $(this).val();
            }
        }

        var service_time = $(this).val();
        var hours_string = (service_time.substr(0, 2));
        var hours = parseInt(service_time.substr(0, 2));

        console.log('service_time_array', service_time_array);
        var error = validateTimes();
        //console.log('error', error);
        if (error == false) {
            $(this).val("");
        } else {
            var earliest_time;
            var latest_time;

            if (hours < 9 && hours != 0) {
                earliest_time = service_time.replace(hours_string, '0' + (hours - 1));
                latest_time = service_time.replace(hours_string, '0' + (hours + 1));
            } else if (hours == 9) {
                earliest_time = service_time.replace(hours_string, '0' + (hours - 1));
                latest_time = service_time.replace(hours_string, (hours + 1));
            } else if (hours == 10) {
                earliest_time = service_time.replace(hours_string, '0' + (hours - 1));
                latest_time = service_time.replace(hours_string, (hours + 1));
            } else if (hours > 10) {
                earliest_time = service_time.replace(hours_string, (hours - 1));
                latest_time = service_time.replace(hours_string, (hours + 1));
            }
            console.log('this.id', this.id);
            console.log($(this).val());
            console.log(earliest_time);
            console.log(latest_time);

            if (this.id == 'table_service_time') {
                //console.log('$(this).closest(tr)', $(this).closest('tr'));
                var $tr = $(this).closest('tr');
                $tr.find('.earliest_time').val(earliest_time);
                $tr.find('.latest_time').val(latest_time);
            } else {
                console.log('ok');
                $('#earliest_time' + stop_id).val(earliest_time);
                $('#latest_time' + stop_id).val(latest_time);
            }
        }

        // var error = validateTimes();
        // if (error == false) {
        //  $(this).val("");
        // }
    }

});


$(".tab-pane").on('focusout', '.earliest_time', function() {
    console.log('focusout earliest_time');
    if (isNullorEmpty($(this).val())) {
        showAlert('Please Enter the Time or Select AM/PM');
        $(this).focus();
        return false;
    } else {
        var stop_no = $(this).attr('data-stopno');
        var stop_array = stop_no.split('_');
        if (stop_array[1] == 0) {
            earliest_time_array[stop_array[0] - 1] = $(this).val();
        } else {
            earliest_time_array[stop_array[1] - 1] = $(this).val();
        }
        console.log(earliest_time_array);
        var error = validateTimes();
        if (error == false) {
            $(this).val("");
        }
    }

});

$(".tab-pane").on('focusout', '.latest_time', function() {
    console.log('focusout latest_time');
    if (isNullorEmpty($(this).val())) {
        showAlert('Please Enter the Time or Select AM/PM');
        $(this).focus();
        return false;
    } else {
        var stop_no = $(this).attr('data-stopno');
        var stop_array = stop_no.split('_');
        if (stop_array[1] == 0) {
            latest_time_array[stop_array[0] - 1] = $(this).val();
        } else {
            latest_time_array[stop_array[1] - 1] = $(this).val();
        }
        var error = validateTimes();
        if (error == false) {
            $(this).val("");
        }
    }

});

$(document).on('click', '.monday', function() {

    if (!$(this).is(':checked')) {
        uncheckDailyAdhocFreq();
        console.log('checked')
        checkIfMultiFreq('mon', 'T');
    } else {
        checkIfMultiFreq('mon', 'F');
    }
    freq_change = true;
    validateFrequency();
});

$(document).on('click', '.tuesday', function() {

    if (!$(this).is(':checked')) {
        uncheckDailyAdhocFreq();
        checkIfMultiFreq('tue', 'T');
    } else {
        checkIfMultiFreq('tue', 'F');
    }
    validateFrequency();
    freq_change = true;
});

$(document).on('click', '.wednesday', function() {

    if (!$(this).is(':checked')) {
        uncheckDailyAdhocFreq();
        checkIfMultiFreq('wed', 'T');
    } else {
        checkIfMultiFreq('wed', 'F');
    }
    validateFrequency();
    freq_change = true;
});

$(document).on('click', '.thursday', function() {

    if (!$(this).is(':checked')) {
        uncheckDailyAdhocFreq();
        checkIfMultiFreq('thu', 'T');
    } else {
        checkIfMultiFreq('thu', 'F');
    }
    validateFrequency();
    freq_change = true;
});

$(document).on('click', '.friday', function() {

    if (!$(this).is(':checked')) {
        uncheckDailyAdhocFreq();
        checkIfMultiFreq('fri', 'T');
    } else {
        checkIfMultiFreq('fri', 'F');
    }
    validateFrequency();
    freq_change = true;
});

$(document).on('click', '.service_time_window_button', function() {
    var previous_time_window = $(this).attr('data-timewindow');
    var stop_id = $(this).attr('data-stopid');

    var split_time_window = previous_time_window.split(' - ');

    console.log(split_time_window);

    var earliest_time = convertTo24Hour(split_time_window[0]);
    var latest_time = convertTo24Hour(split_time_window[1]);

    console.log(earliest_time);
    console.log(latest_time);

    $('#earliest_time' + stop_id).val(earliest_time);
    $('#latest_time' + stop_id).val(latest_time);

});

$(document).on('click', '.service_time_button', function() {
    var previous_time = $(this).attr('data-time');
    var stop_id = $(this).attr('data-stopid');

    console.log(previous_time);
    $('#service_time' + stop_id).val(previous_time);

});

//If Different For Each Day is checked
$(document).on('click', '.different_each_day', function() {
    zee = nlapiGetFieldValue('zee');
    var operation_zee = $(this).attr('data-operationzee');
    if ($(this).is(':checked')) {
        var id = $(this).attr('data-stopid');
        var stop_no = $(this).attr('data-stopno');
        var table_id = '#services' + id;
        var loaded_multifreq = $(this).attr('data-multifreq');
        var freq_id = $(this).attr('data-freqid');
        if (!isNullorEmpty(freq_id)) {
            delete_freq_array[delete_freq_array.length] = freq_id;
        }
        $('#run' + id).addClass('hide');
        $('#service_time' + id).addClass('hide');
        $('#earliest_time' + id).addClass('hide');
        $('#latest_time' + id).addClass('hide');
        $('.run_row' + id).addClass('hide');
        $('.time_row' + id).addClass('hide');
        $('.previous_time_row' + id).addClass('hide');
        $('.time_window_row' + id).addClass('hide');
        $('.previous_time_window_row' + id).addClass('hide');
        if (loaded_multifreq == 'T') {
            $(table_id).removeClass('hide');
            var table_id_rows = '#services' + id + ' > tbody > tr';
            var rows;
            if (!isNullorEmpty($(table_id_rows))) {
                rows = $(table_id_rows);
            }
            console.log(rows);
            if (rows.length == 1) {

            } else {
                $(table_id).each(function(i, row) {
                    if (i >= 1) {
                        var $row = $(row);
                        var freq_id = $row.find('.run').attr('data-freqid');

                        var index = delete_freq_array.indexOf(freq_id);
                        if (index > -1) {
                            delete_freq_array.splice(index, 1);
                        }
                    }
                })
            }
        } else {
            var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');

            var newFilters_runPlan = new Array();
            newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'is', operation_zee);

            runPlanSearch.addFilters(newFilters_runPlan);

            var resultSet_runPlan = runPlanSearch.runSearch();


            var create_run_html = '';
            $(table_id).find("tr:not(:nth-child(1))").remove();

            var run_selection_html = '';
            resultSet_runPlan.forEachResult(function(searchResult_runPlan) {

                run_selection_html += '<option value="' + searchResult_runPlan.getValue('internalid') + '">' + searchResult_runPlan.getValue('name') + '</option>'
                return true;
            });

            var row_count = 1;

            if ($('#monday').is(':checked')) {
                create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">MONDAY</td><td><select id="table_run_mon" data-day="mon" class="form-control run"  data-oldrun="" data-stopid="' + id + '" data-freqid=""><option value="0"></option>';
                create_run_html += run_selection_html;
                create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-stopno="' +
                    stop_no + '_' + row_count + '" data-oldtime="" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime="" class="form-control earliest_time" data-stopno="' + stop_no + '_' + row_count + '" type="time" /></td><td><input id="table_latest_time" class="form-control latest_time" data-stopno="' + stop_no + '_' + row_count + '" data-oldlatesttime="" type="time" /></td></tr>';
                row_count++;
            }

            if ($('#tuesday').is(':checked')) {
                create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">TUESDAY</td><td><select id="table_run_tue" data-day="tue" class="form-control run"  data-oldrun="" data-stopid="' + id + '" data-freqid=""><option value="0"></option>';
                create_run_html += run_selection_html;
                create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-oldtime="" data-stopno="' + stop_no + '_' + row_count + '" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime="" data-stopno="' + stop_no + '_' + row_count + '" class="form-control earliest_time" type="time" /></td><td><input id="table_latest_time" data-stopno="' + stop_no + '_' + row_count + '" class="form-control latest_time" data-oldlatesttime="" type="time" /></td></tr>';
                row_count++;
            }

            if ($('#wednesday').is(':checked')) {
                create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">WEDNESDAY</td><td><select id="table_run_wed" data-day="wed" class="form-control run"  data-oldrun="" data-stopid="' + id + '" data-freqid=""><option value="0"></option>';
                create_run_html += run_selection_html;
                create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-stopno="' + stop_no + '_' + row_count + '" data-oldtime="" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime="" data-stopno="' + stop_no + '_' + row_count + '" class="form-control earliest_time" type="time" /></td><td><input id="table_latest_time" data-stopno="' + stop_no + '_' + row_count + '" class="form-control latest_time" data-oldlatesttime="" type="time" /></td></tr>';
                row_count++;
            }

            if ($('#thursday').is(':checked')) {
                create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">THURSDAY</td><td><select id="table_run_thu" data-day="thu" class="form-control run"  data-oldrun="" data-stopid="' + id + '" data-freqid=""><option value="0"></option>';
                create_run_html += run_selection_html;
                create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-stopno="' + stop_no + '_' + row_count + '" data-oldtime="" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime="" data-stopno="' + stop_no + '_' + row_count + '"class="form-control earliest_time" type="time" /></td><td><input id="table_latest_time" data-stopno="' + stop_no + '_' + row_count + '"class="form-control latest_time" data-oldlatesttime="" type="time" /></td></tr>';
                row_count++;
            }

            if ($('#friday').is(':checked')) {
                create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">FRIDAY</td><td><select id="table_run_fri" data-day="fri" class="form-control run"  data-oldrun="" data-stopid="' + id + '" data-freqid=""><option value="0"></option>';
                create_run_html += run_selection_html;
                create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-stopno="' + stop_no + '_' + row_count + '" data-oldtime="" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime=""  data-stopno="' + stop_no + '_' + row_count + '"class="form-control earliest_time" type="time" /></td><td><input id="table_latest_time" data-stopno="' + stop_no + '_' + row_count + '" class="form-control latest_time" data-oldlatesttime="" type="time" /></td></tr>';
                row_count++;

            }
            $(table_id + ' tr:last').after(create_run_html);
            $(table_id).removeClass('hide');
        }


    } else {
        var id = $(this).attr('data-stopid');
        var table_id = '#services' + id;
        var freq_id = $(this).attr('data-freqid');
        var loaded_multifreq = $(this).attr('data-multifreq');
        if (!isNullorEmpty(freq_id)) {
            var index = delete_freq_array.indexOf(freq_id);
            if (index > -1) {
                delete_freq_array.splice(index, 1);
            }
        }
        if (loaded_multifreq == 'T') {
            var table_id_rows = '#services' + id + ' > tbody > tr';
            var rows;
            if (!isNullorEmpty($(table_id_rows))) {
                rows = $(table_id_rows);
            }
            console.log(rows);
            if (rows.length == 1) {

            } else {
                $(table_id).each(function(i, row) {
                    if (i >= 1) {
                        var $row = $(row);
                        var freq_id = $row.find('.run').attr('data-freqid');

                        delete_freq_array[delete_freq_array.length] = freq_id;
                    }
                })
            }
        }
        $(table_id).addClass('hide');
        $('#run' + id).removeClass('hide');
        $('#service_time' + id).removeClass('hide');
        $('#earliest_time' + id).removeClass('hide');
        $('#latest_time' + id).removeClass('hide');
        $('.run_row' + id).removeClass('hide');
        $('.time_row' + id).removeClass('hide');
        $('.previous_time_row' + id).removeClass('hide');
        $('.time_window_row' + id).removeClass('hide');
        $('.previous_time_window_row' + id).removeClass('hide');
    }
});

//If Daily is checked
$(document).on('click', '#daily', function() {
    if ($(this).is(':checked')) {
        $('#monday').prop('disabled', true);
        $('#tuesday').prop('disabled', true);
        $('#wednesday').prop('disabled', true);
        $('#thursday').prop('disabled', true);
        $('#friday').prop('disabled', true);
        $('#adhoc').prop('disabled', true);
        $('#monday').prop('checked', true);
        $('#tuesday').prop('checked', true);
        $('#wednesday').prop('checked', true);
        $('#thursday').prop('checked', true);
        $('#friday').prop('checked', true);
    } else {
        $('#monday').prop('disabled', false);
        $('#tuesday').prop('disabled', false);
        $('#wednesday').prop('disabled', false);
        $('#thursday').prop('disabled', false);
        $('#friday').prop('disabled', false);
        $('#adhoc').prop('disabled', false);
        $('#monday').prop('checked', false);
        $('#tuesday').prop('checked', false);
        $('#wednesday').prop('checked', false);
        $('#thursday').prop('checked', false);
        $('#friday').prop('checked', false);
    }
    validateFrequency();
    freq_change = true;
});

//If Adhoc is checked
$(document).on('click', '#adhoc', function() {
    if ($(this).is(':checked')) {
        $('#monday').prop('disabled', true);
        $('#tuesday').prop('disabled', true);
        $('#wednesday').prop('disabled', true);
        $('#thursday').prop('disabled', true);
        $('#friday').prop('disabled', true);
        $('#daily').prop('disabled', true);
        $('#monday').prop('checked', false);
        $('#tuesday').prop('checked', false);
        $('#wednesday').prop('checked', false);
        $('#thursday').prop('checked', false);
        $('#friday').prop('checked', false);
        $('#daily').prop('checked', false);
    } else {
        $('#monday').prop('disabled', false);
        $('#tuesday').prop('disabled', false);
        $('#wednesday').prop('disabled', false);
        $('#thursday').prop('disabled', false);
        $('#friday').prop('disabled', false);
        $('#daily').prop('disabled', false);

    }
    validateFrequency();
    freq_change = true;
});

function checkIfMultiFreq(value, unchecked) {
    $(".tabs").each(function() {
        $(this).find(".nav-tabs li").each(function(index, element) {
            var stop_id = $(this).children('a').attr('href');
            stop_id = stop_id.split('#');
            var zee_id = $(this).children('a').attr('data-zee');
            var operation_zee = $(this).children('a').attr('data-operationzee');
            if (!isNullorEmpty(stop_id[1])) {

                // To check if a new stop has been created. -1 = NO / 0 = YES
                var new_stop = stop_id[1].indexOf('new_stop_');

                var table_id = '#services' + stop_id[1] + ' > tbody > tr';
                var rows;
                if (!isNullorEmpty($(table_id))) {
                    rows = $(table_id);
                }
                console.log(rows);
                //console.log($('#services' + stop_id[1] + ' > tbody')[0].innerHTML);
                if (rows.length == 1) {

                } else {
                    var daycreated = false;
                    $(table_id).each(function(i, row) {

                        console.log('i', i);
                        console.log('row', row);
                        if (i >= 1) {
                            var $row = $(row);
                            var freq_id = $row.find('.run').attr('data-freqid');
                            console.log('freq_id', freq_id);

                            if (unchecked == 'T') {
                                if ($row.find('#table_run').attr('data-day') == value) {
                                    $row.hide();
                                    delete_freq_array[delete_freq_array.length] = freq_id;
                                    daycreated = true;
                                }
                            } else {
                                if ($row.find('#table_run').attr('data-day') == value) {
                                    $row.show();
                                    console.log('show');
                                    daycreated = true;

                                    var index = delete_freq_array.indexOf(freq_id);
                                    if (index > -1) {
                                        delete_freq_array.splice(index, 1);
                                    }
                                }
                            }

                        }

                    });
                    console.log('daycreated', daycreated);
                    if (daycreated == false && unchecked == 'F') {

                        var newRow = $('#services' + stop_id[1] + ' > tbody')[0].insertRow();
                        console.log('row inserted', value);

                        zee = nlapiGetFieldValue('zee');
                        var create_run_html = '';
                        var run_selection_html = '';
                        var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');
                        var newFilters_runPlan = new Array();
                        newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'is', operation_zee);
                        runPlanSearch.addFilters(newFilters_runPlan);

                        var resultSet_runPlan = runPlanSearch.runSearch();
                        resultSet_runPlan.forEachResult(function(searchResult_runPlan) {
                            run_selection_html += '<option value="' + searchResult_runPlan.getValue('internalid') + '">' + searchResult_runPlan.getValue('name') + '</option>';

                            return true;
                        });

                        var day;
                        switch (value) {
                            case 'mon':
                                day = 'MONDAY';
                                break;
                            case 'tue':
                                day = 'TUESDAY';
                                break;
                            case 'wed':
                                day = 'WEDNESDAY';
                                break;
                            case 'thu':
                                day = 'THURSDAY';
                                break;
                            case 'fri':
                                day = 'FRIDAY';
                                break;
                        }


                        create_run_html += '<tr><td style="vertical-align: middle;text-align: center;color: white;background-color: #607799;" class="day" data-freqid="">' + day + '</td><td><select id="table_run_mon" data-day="' + value + '" class="form-control run"  data-oldrun="" data-stopid="" data-freqid=""><option value="0"></option>';
                        create_run_html += run_selection_html;
                        create_run_html += '</select></td><td><input id="table_service_time" class="form-control service_time" data-stopno="" data-oldtime="" type="time" /></td><td><input id="table_earliest_time" data-oldearliesttime="" class="form-control earliest_time" data-stopno="" type="time" /></td><td><input id="table_latest_time" class="form-control latest_time" data-stopno="" data-oldlatesttime="" type="time" /></td></tr>';

                        newRow.innerHTML = create_run_html;
                        newRow.className = 'newrow';
                        //console.log('previousRow', previousRow);
                        //previousRow.after(create_run_html);
                    } else if (daycreated == false && unchecked == 'T') {
                        $('.newrow').hide();
                    }
                }
            }
        });
    });
}


function saveRecord() {
    savingRecord = true;
    console.log('savingRecord', savingRecord);

    var customer_id = nlapiGetFieldValue('customer_id');
    var service_id = nlapiGetFieldValue('service_id');
    var stops_ids = nlapiGetFieldValue('stop_ids');

    zee = parseInt(nlapiGetFieldValue('zee'));

    var exit = true;
    var error = false;
    var message = '';

    var freq_time_current_array = [];

    var run_array = [];
    var freq_edited = false;

    $(".tabs").each(function() {
        $(this).find(".nav-tabs li").each(function(index, element) {
            var stop_id = $(this).children('a').attr('href');
            var freq_main_id = $(this).children('a').attr('data-freq');
            console.log('Stop ID: ' + stop_id)
            console.log('freq_main_id: ' + freq_main_id)
            stop_id = stop_id.split('#');

            freq_time_current_array[freq_time_current_array.length] = onTimeChange($('#' + stop_id[1]).find('#service_time' + stop_id[1]).val());
            console.log('freq_time_current_array', freq_time_current_array);
            if (!isNullorEmpty(stop_id[1])) {

                var new_stop_id = stop_id[1].split('_');
                console.log('new_stop_id', new_stop_id);

                // To check if a new stop has been created. -1 = NO / 0 = YES
                var new_stop = stop_id[1].indexOf('new_stop_');

                var table_id = '#services' + stop_id[1] + ' > tbody > tr';
                var rows;
                if (!isNullorEmpty($(table_id))) {
                    rows = $(table_id);
                }
                console.log('Rows: ' + rows);
                console.log('Rows Length :' + rows.length);
                if (rows.length == 1 || rows.length == 0) {
                    var run = $('#' + stop_id[1]).find('#run' + stop_id[1]).val();
                    run_array[run_array.length] = run;
                    var old_run = $('#' + stop_id[1]).find('#run' + stop_id[1]).attr('data-oldrun');
                    if (isNullorEmpty(freq_main_id)) {
                        var run_freq_id = $('#' + stop_id[1]).find('#run' + stop_id[1]).attr('data-freqid');
                    } else {
                        var run_freq_id = freq_main_id;
                    }

                    console.log('service_time: ' + $('#' + stop_id[1]).find('#service_time' + stop_id[1]).val());
                    var service_time = onTimeChange($('#' + stop_id[1]).find('#service_time' + stop_id[1]).val());
                    var earliest_time = ($('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).val());
                    var latest_time = ($('#' + stop_id[1]).find('#latest_time' + stop_id[1]).val());

                    //var message = '';

                    if (isNullorEmpty(run) || run == 0) {
                        message += 'Please Select the Run</br>';
                        error = true;
                    }

                    if (isNullorEmpty(service_time)) {
                        message += 'Please Select the Service Time</br>';
                        error = true;
                    }

                    if (isNullorEmpty(earliest_time)) {
                        message += 'Please Select the Earliest Time</br>';
                        error = true;
                    }

                    if (isNullorEmpty(latest_time)) {
                        message += 'Please Select the Latest Time</br>';
                        error = true;
                    }

                    /*                    if (error == true) {
                                            // $(this).children('a').css('background-color', '#337ab7')
                                            showAlert(message);
                                            exit = false;*/
                    //} 
                    else {
                        console.log('old_service_time: ' + $('#' + stop_id[1]).find('#service_time' + stop_id[1]).attr('data-oldtime'));
                        var old_service_time = onTimeChange($('#' + stop_id[1]).find('#service_time' + stop_id[1]).attr('data-oldtime'));

                        console.log('earliest_time: ' + $('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).val());
                        var earliest_time = onTimeChange($('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).val());

                        console.log('old_earliest_time: ' + $('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).attr('data-oldearliesttime'));
                        var old_earliest_time = onTimeChange($('#' + stop_id[1]).find('#earliest_time' + stop_id[1]).attr('data-oldearliesttime'));

                        console.log('latest_time: ' + $('#' + stop_id[1]).find('#latest_time' + stop_id[1]).val());
                        var latest_time = onTimeChange($('#' + stop_id[1]).find('#latest_time' + stop_id[1]).val());

                        console.log('latest_time: ' + $('#' + stop_id[1]).find('#latest_time' + stop_id[1]).attr('data-oldlatesttime'));
                        var old_latest_time = onTimeChange($('#' + stop_id[1]).find('#latest_time' + stop_id[1]).attr('data-oldlatesttime'));

                        if (freq_change == true || (run != old_run) || (service_time != old_service_time) || (earliest_time != old_earliest_time) || (latest_time != old_latest_time)) {
                            freq_edited = true;
                            if (isNullorEmpty(run_freq_id)) {
                                var freq_record = nlapiCreateRecord('customrecord_service_freq');
                            } else {
                                var freq_record = nlapiLoadRecord('customrecord_service_freq', run_freq_id);
                            }

                            // freq_record.setFieldValue('custrecord_service_freq_franchisee', zee);
                            freq_record.setFieldValue('custrecord_service_freq_customer', nlapiGetFieldValue('customer_id'));
                            freq_record.setFieldValue('custrecord_service_freq_run_plan', run);
                            freq_record.setFieldValue('custrecord_service_freq_service', nlapiGetFieldValue('service_id'));
                            freq_record.setFieldValue('custrecord_service_freq_stop', new_stop_id[0]);
                            freq_record.setFieldValue('custrecord_service_freq_time_start', earliest_time);
                            freq_record.setFieldValue('custrecord_service_freq_time_end', latest_time);
                            freq_record.setFieldValue('custrecord_service_freq_time_current', service_time);

                            if ($('#monday').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_mon', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_mon', 'F');
                            }
                            if ($('#tuesday').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_tue', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_tue', 'F');
                            }
                            if ($('#wednesday').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_wed', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_wed', 'F');
                            }
                            if ($('#thursday').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_thu', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_thu', 'F');
                            }
                            if ($('#friday').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_fri', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_fri', 'F');
                            }

                            if ($('#adhoc').is(':checked')) {
                                freq_record.setFieldValue('custrecord_service_freq_day_adhoc', 'T');
                            } else {
                                freq_record.setFieldValue('custrecord_service_freq_day_adhoc', 'F');
                            }

                            nlapiSubmitRecord(freq_record);
                        }


                    }


                    // 
                } else {
                    $(table_id).each(function(i, row) {
                        if (i >= 1) {
                            var $row = $(row);
                            var freq_id = $row.find('.run').attr('data-freqid');

                            var run = $row.find('.run').val();
                            run_array[run_array.length] = run;
                            var old_run = $row.find('.run').attr('data-oldrun');
                            var service_time = onTimeChange($row.find('#table_service_time').val());
                            var old_service_time = onTimeChange($row.find('#table_service_time').attr('data-oldtime'));
                            var earliest_time = onTimeChange($row.find('#table_earliest_time').val());
                            var old_earliest_time = onTimeChange($row.find('#table_earliest_time').attr('data-oldearliesttime'));
                            var latest_time = onTimeChange($row.find('#table_latest_time').val());
                            var old_latest_time = onTimeChange($row.find('#table_latest_time').attr('data-oldlatesttime'));

                            if (isNullorEmpty(run)) {
                                message += 'Please Select the Run</br>';
                                error = true;
                            } else {
                                stored_run = run;
                            }

                            if (isNullorEmpty(service_time)) {
                                message += 'Please Select the Service Time</br>';
                                error = true;
                            }

                            if (isNullorEmpty(earliest_time)) {
                                message += 'Please Select the Earliest Time</br>';
                                error = true;
                            }

                            if (isNullorEmpty(latest_time)) {
                                message += 'Please Select the Latest Time</br>';
                                error = true;
                            }


                            /*                            if (error == true) {
                                                            // $(this).children('a').css('background-color', '#337ab7')
                                                            showAlert(message);
                                                            exit = false;*/
                            //} 
                            else {
                                if (freq_change == true || (run != old_run) || (service_time != old_service_time) || (earliest_time != old_earliest_time) || (latest_time != old_latest_time)) {
                                    freq_edited = true;
                                    if (isNullorEmpty(freq_id)) {
                                        var freq_record = nlapiCreateRecord('customrecord_service_freq');
                                    } else {
                                        var freq_record = nlapiLoadRecord('customrecord_service_freq', freq_id);
                                    }
                                    // freq_record.setFieldValue('custrecord_service_freq_franchisee', zee);
                                    freq_record.setFieldValue('custrecord_service_freq_customer', nlapiGetFieldValue('customer_id'));
                                    freq_record.setFieldValue('custrecord_service_freq_run_plan', run);
                                    freq_record.setFieldValue('custrecord_service_freq_service', nlapiGetFieldValue('service_id'));
                                    freq_record.setFieldValue('custrecord_service_freq_stop', new_stop_id[0]);

                                    freq_record.setFieldValue('custrecord_service_freq_time_start', earliest_time);
                                    freq_record.setFieldValue('custrecord_service_freq_time_end', latest_time);
                                    freq_record.setFieldValue('custrecord_service_freq_time_current', service_time);
                                    if ($row.find('.run').attr('data-day') == 'mon') {
                                        freq_record.setFieldValue('custrecord_service_freq_day_mon', 'T');
                                    }
                                    if ($row.find('.run').attr('data-day') == 'tue') {
                                        freq_record.setFieldValue('custrecord_service_freq_day_tue', 'T');
                                    }
                                    if ($row.find('.run').attr('data-day') == 'wed') {
                                        freq_record.setFieldValue('custrecord_service_freq_day_wed', 'T');
                                    }
                                    if ($row.find('.run').attr('data-day') == 'thu') {
                                        freq_record.setFieldValue('custrecord_service_freq_day_thu', 'T');
                                    }
                                    if ($row.find('.run').attr('data-day') == 'fri') {
                                        freq_record.setFieldValue('custrecord_service_freq_day_fri', 'T');
                                    }

                                    nlapiSubmitRecord(freq_record);

                                }
                            }
                        }
                    })
                }

            }
        });
    });

    if (!isNullorEmpty(delete_freq_array)) {
        var delete_freq_string = delete_freq_array.join();
        nlapiSetFieldValue('delete_freq', delete_freq_string)
    }

    var run_string = run_array.join();
    nlapiSetFieldValue('run', run_string);
    nlapiSetFieldValue('freq_edited', freq_edited);


    if (error == true) {
        // $(this).children('a').css('background-color', '#337ab7')
        showAlert(message);
        exit = false;

    }

    if (exit == true) {
        return true;
    }
}


//Build the JSON string to get all the values from the tab
function buildRequestStringData(form, stop_id) {
    var select = form.find('select'),
        input = form.find('input'),
        textarea = form.find('textarea'),
        requestString = '{"stop_id":"' + stop_id + '",';
    var table_id = '#services' + stop_id + ' > tbody > tr';
    console.log(table_id)
    var rows;
    if (!isNullorEmpty($(table_id))) {
        rows = $(table_id);
    }
    console.log(rows);
    if (rows.length == 1) {

    } else {
        $(table_id).each(function(i, row) {
            if (i >= 1) {
                var $row = $(row);
                console.log($row.find('#table_run').val());
            }
        })
    }

    var different_checkbox = false;
    var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    for (var i = 0; i < select.length; i++) {
        requestString += '"' + $(select[i]).attr('id') + '": "' + $(select[i]).val() + '",';
    }
    for (var i = 0; i < textarea.length; i++) {
        requestString += '"' + $(textarea[i]).attr('id') + '": "' + $(textarea[i]).val() + '",';
    }
    if (textarea.length > 1) {
        requestString = requestString.substring(0, requestString.length - 1);
    }
    for (var i = 0; i < input.length; i++) {
        if (!isNullorEmpty($(input[i]).attr('id'))) {
            if ($(input[i]).attr('type') !== 'checkbox') {

                requestString += '"' + $(input[i]).attr('id') + '":"' + $(input[i]).val() + '",';
            } else {
                if ($(input[i]).is(':checked')) {
                    requestString += '"' + $(input[i]).attr('id') + '":"true",';
                    different_checkbox = true;
                } else {
                    requestString += '"' + $(input[i]).attr('id') + '":"false",';
                }

            }
        }
    }
    if (input.length > 1) {
        requestString = requestString.substring(0, requestString.length - 1);
    }
    requestString += '}';
    return requestString;
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

function convertTo24Hour(time) {
    var hours_string = (time.substr(0, 2));
    var hours = parseInt(time.substr(0, 2));
    if (time.indexOf('AM') != -1 && hours == 12) {
        time = time.replace('12', '0');
    }
    // if (time.indexOf('AM') != -1 && hours < 10) {
    //  time = time.replace(hours, ('0' + hours));
    // }
    if (time.indexOf('PM') != -1 && hours < 12) {
        console.log(hours + 12)
        time = time.replace(hours_string, (hours + 12));
    }
    return time.replace(/( AM| PM)/, '');
}