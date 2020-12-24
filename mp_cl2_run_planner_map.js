var geojson;
var geojson2;
var map;
var info;

var categories = {},
    category;

var overlaysObj = {},
    categoryName,
    categoryArray,
    categoryLG;

var allPointsLG;

var stateLG = [];

var selected_areas = [];
var deleted_areas = [];

var basemapsObj = {};

var partner_state;
var partner_location;
var same_day;
var next_day;

var zee_array = [];
var zee_text_array = [];
//var day_array = [];
var day;
var before_time;
var after_time;
var run_array = [];
var op_array = [];
//var before_time_array = [];
//var after_time_array = [];
var optimize_array = [];
var optimize = false;

var search_markers_array = [];
var run_markers_array = [];
var color_array = ['blue', 'red', 'green', 'orange', 'black'];


var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}
var ctx = nlapiGetContext();
var role = ctx.getRole();

var days_of_week = [];
days_of_week[0] = 0;
days_of_week[1] = 'custrecord_service_freq_day_mon';
days_of_week[2] = 'custrecord_service_freq_day_tue';
days_of_week[3] = 'custrecord_service_freq_day_wed';
days_of_week[4] = 'custrecord_service_freq_day_thu';
days_of_week[5] = 'custrecord_service_freq_day_fri';
days_of_week[6] = 6;


$('.collapse').on('shown.bs.collapse', function() {
    $("#main_container").css({
        "padding-top": "100px"
    });
})

$('.collapse').on('hide.bs.collapse', function() {
    $("#main_container").css({
        "padding-top": "3%"
    });
})

function clientPageInit(type) {
    $('#loader').remove();
    $('.uir-outside-fields-table').css('width', '-webkit-fill-available');
    //$('.zee_dropdown').selectpicker();
    $('.zee_dropdown').selectpicker({
        liveSearch: true,
    });

    //LOAD MAP & TERRITORIES
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {
            lat: -27.833,
            lng: 133.583
        }
    });
    var legend = document.getElementById('legend');
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

    if (role != 1000) {
        map.data.loadGeoJson('https://1048144.app.netsuite.com/core/media/media.nl?id=3772482&c=1048144&h=4579935b386159057056&_xt=.js');
        //map.data.loadGeoJson('https://1048144-sb3.app.netsuite.com/core/media/media.nl?id=3771516&c=1048144_SB3&h=afd38c5aed85b40b9cc0&_xt=.js');
        map.data.addListener('mouseover', function(event) {
            $('#zee_territory').val(event.feature.getProperty('Territory'));
            console.log('event.feature.getProperty(Name)', event.feature.getProperty('Territory'));
        });
        map.data.addListener('mouseout', function(event) {
            $('#zee_territory').val('');
        });
    }

    var zee_string = nlapiGetFieldValue('zee');
    //console.log('zee_string', zee_string);
    if (!isNullorEmpty(zee_string)) {
        zee_array = zee_string.split(',');
        zee_text_array = nlapiGetFieldValue('zee_text').split(',');
    }

    if (zee_array.length != 0) {
        op_array = nlapiGetFieldValue('op').split(',');
        run_array = nlapiGetFieldValue('run').split(',');
        optimize_array = nlapiGetFieldValue('optimisation').split(',');
        day = parseInt(nlapiGetFieldValue('day'));
        before_time = nlapiGetFieldValue('beforetime');
        after_time = nlapiGetFieldValue('aftertime');
        console.log('zee_array', zee_array);
        console.log('op_array', op_array);
        console.log('run_array', run_array);
        console.log('optimize_array', optimize_array);
        console.log('day', day);
        console.log('before_time', before_time);
        console.log('after_time', after_time);
        for (i = 0; i < zee_array.length; i++) {
            var zee = zee_array[i];
            //console.log('i', i);
            var run = run_array[i];
            var op = op_array[i];
            optimize = optimize_array[i];
            //console.log('run', run);
            //console.log('op', op);
            //console.log('optimize', optimize);
            if (optimize == 'true') {
                optimize = true;
            } else if (optimize == 'false') {
                optimize = false;
            }

            if (run == 0) {
                run = filterRunDropdown(zee, op);
            }
            if (run == 'no_run') {
                $('#op_not_assigned_' + zee + '').removeClass("hide");
            } else { //only load the map if a run exists for that operator
                /*                day = day_array[i];
                                before_time = beforetime_array[i];
                                after_time = aftertime_array[i];*/
                //console.log('day', day);
                //console.log('day of week ' + days_of_week[day]);
                //console.log('before_time', before_time);
                //console.log('after_time', after_time);

                var runJSON_array = getRunJSON(zee, run, day, before_time, after_time);
                console.log('runJSON_array', runJSON_array);
                var parsedStopFreq = runJSON_array[0];
                var firststop_time = runJSON_array[1];
                var laststop_time = runJSON_array[2];

                var stops_number = parsedStopFreq.data.length;
                $('#firststop_' + zee + '').val(firststop_time);
                $('#laststop_' + zee + '').val(laststop_time);
                console.log('stops_number', stops_number);

                var stops_number_temp = 0;
                var waypoint_json = [];
                var waypoint_otherproperties = [];
                var origin = [];
                var destination = [];

                var markerArray = [];


                if (stops_number != 0) {
                    var y_length = Math.ceil(stops_number / 25);
                    console.log(y_length)
                    var each_request_length = parseInt(Math.ceil((stops_number + (y_length - 1)) / y_length));
                    console.log('each_request_length', each_request_length);
                    for (var y = 0; y < y_length; y++) {
                        // stops_number_temp = stops_number - 25;
                        // origin[y] = parsedStopFreq.data[parseInt(y_length * y)].address;
                        // destination[y] = parsedStopFreq.data[parseInt(each_request_length * (y + 1)) - 1].address;
                        waypoint_json[y] = '[';
                        waypoint_otherproperties[y] = '[';
                        for (var x = (parseInt(each_request_length * y)); x < (parseInt(each_request_length * (y + 1))); x++) {
                            if (!isNullorEmpty(parsedStopFreq.data[x - y] && !isNullorEmpty(parsedStopFreq.data[x - y].address))) {
                                waypoint_json[y] += '{"location": "' + parsedStopFreq.data[x - y].address + '",'; //x - y so that the first element of an array is the last element of the previous array
                                if (isNullorEmpty(parsedStopFreq.data[x - y].ncl)) {
                                    waypoint_otherproperties[y] += '{"name": "' + parsedStopFreq.data[x - y].services[0].customer_text + '",';
                                    waypoint_otherproperties[y] += '"location_type": "customer",';
                                } else {
                                    waypoint_otherproperties[y] += '{"name": "' + parsedStopFreq.data[x - y].title + '",';
                                    waypoint_otherproperties[y] += '"location_type": "ncl",';
                                }
                                waypoint_json[y] += '"stopover": ' + true + '},';
                                waypoint_otherproperties[y] += '"time": "' + parsedStopFreq.data[x - y].start + '",';
                                waypoint_otherproperties[y] += '"lat": "' + parsedStopFreq.data[x - y].lat + '",';
                                waypoint_otherproperties[y] += '"lng": "' + parsedStopFreq.data[x - y].lon + '"},';
                            }
                        }
                        waypoint_json[y] = waypoint_json[y].substring(0, waypoint_json[y].length - 1);
                        waypoint_otherproperties[y] = waypoint_otherproperties[y].substring(0, waypoint_otherproperties[y].length - 1);
                        waypoint_json[y] += ']';
                        waypoint_otherproperties[y] += ']';

                    }

                    console.log(waypoint_json);
                    console.log(waypoint_otherproperties);

                    var directionsService = new google.maps.DirectionsService();
                    var directionsDisplay = new google.maps.DirectionsRenderer({
                        map: map,
                        suppressMarkers: true,
                        //suppressInfoWindows: true, 
                        polylineOptions: {
                            strokeColor: color_array[i],
                        },

                    });

                    var stepDisplay = new google.maps.InfoWindow();

                    // var map = new google.maps.Map(document.getElementById('map'), mapOptions);
                    // directionsDisplay.setMap(map);

                    directionsDisplay.setPanel(document.getElementById('directionsPanel'));
                    calculateAndDisplayRoute(directionsDisplay, directionsService, waypoint_json, markerArray, stepDisplay, map, waypoint_otherproperties, zee);
                    addMarker(map, stepDisplay, waypoint_otherproperties, zee);

                    $('.row_time').removeClass('hide');
                    $('.print_section').removeClass('hide');
                } else {
                    $('#run_not_scheduled_' + zee + '').removeClass('hide');
                    $('.print_section').addClass('hide');
                }
            }
            $('#runMarkers').removeClass('hide');
        }

        if (zee_array.length > 1) { //HIDE THE RUN MARKERS BY DEFAULT IF MULTIPLE ZEES
            for (i = 0; i < run_markers_array.length; i++) {
                var marker = run_markers_array[i];
                marker.setMap(null);
            }
            $('#runMarkers').val('SHOW RUN MARKERS');
            $('#runMarkers').toggleClass('btn-success');
            $('#runMarkers').toggleClass('btn-danger');
        }
        $('.legend_icons').removeClass('hide');
    }
    $('.map_section').removeClass('hide');

}


function addMarker(map, stepDisplay, waypoint_otherproperties, zee) {
    var marker_count = 0;
    //for markers at the exact same location - OverlappingMarkerSpiderfier to spiderfy the markers on click
    var oms = new OverlappingMarkerSpiderfier(map, {
        markersWontMove: true, // we promise not to move any markers, allowing optimizations
        markersWontHide: true, // we promise not to change visibility of any markers, allowing optimizations
        basicFormatEvents: true, // allow the library to skip calculating advanced formatting information
        ignoreMapClick: true, //markers do not unspiderfy on click of anywhere on the map
        keepSpiderfied: true //to see the infowindow of each marker - markers stay spiderfied on click of one of the markers
    });
    for (var i = 0; i < waypoint_otherproperties.length; i++) {
        var parsedWayPointProperties = JSON.parse(waypoint_otherproperties[i]);
        for (x = 0; x < parsedWayPointProperties.length; x++) {
            if (x == parsedWayPointProperties.length - 1 && i != waypoint_otherproperties.length - 1) { //do not display the last element unless it is the end location (because last element is also the first of the next array)
                continue;
            }

            //Get the position of the marker
            var lat = parseFloat(parsedWayPointProperties[x].lat);
            var lng = parseFloat(parsedWayPointProperties[x].lng);
            position = {
                lat: lat,
                lng: lng
            };
            //console.log('position', position);

            //Letter for the order : A,B,..,Z,AA,AB,..
            var letter = String.fromCharCode("A".charCodeAt(0) + marker_count);
            var marker_quotient = Math.floor(marker_count / 26);
            var marker_remainder = marker_count % 26;
            if (marker_quotient > 0) {
                var letter = String.fromCharCode("A".charCodeAt(0) + marker_quotient - 1) + String.fromCharCode("A".charCodeAt(0) + marker_remainder)
            } else {
                var letter = String.fromCharCode("A".charCodeAt(0) + marker_remainder)
            }
            //console.log('letter', letter);

            //Customer location or NCL
            // Marker SVG Path: 
            var MAP_MARKER = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z';
            if (parsedWayPointProperties[x].location_type == 'ncl') {
                color = '#575756'
            } else if (parsedWayPointProperties[x].location_type == 'customer') {
                color = '#008675'
            }
            var icon;
            icon = {
                path: MAP_MARKER,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: 'black',
                strokeWeight: 1,
                anchor: {
                    x: 13,
                    y: 22
                },
                scale: 1.5,
                //scaledSize: new google.maps.Size(27, 43),
                labelOrigin: new google.maps.Point(12, 10),
            }

            //Create the marker
            var marker = new google.maps.Marker({
                position: position,
                map: map,
                icon: icon,
                title: parsedWayPointProperties[x].name,
                label: {
                    text: letter,
                    fontSize: '12px',
                    color: 'white',
                }

            });
            oms.addMarker(marker); //add the marker to the OverlappingMarkerSpiderfier instance
            run_markers_array[run_markers_array.length] = marker; //store the markers created to be able to delete them

            //Marker InfoWindow
            var name = parsedWayPointProperties[x].name;
            var time = parsedWayPointProperties[x].time;
            var content = '<b>' + name + '</b><br/> Franchisee: ' + zee_text_array[zee_array.indexOf(zee)] + '<br/> Service Time: ' + onTimeChange(time) + '';
            attachInstructionText(
                stepDisplay, marker, content, map);
            marker_count++;
        }

    }
}


function calculateAndDisplayRoute(directionsDisplay, directionsService, waypoint_json, markerArray, stepDisplay, map, waypoint_otherproperties, zee) {
    for (var i = 0; i < markerArray.length; i++) {
        markerArray[i].setMap(null);
    }
    for (var i = 0; i < waypoint_json.length; i++) {
        var parsedWayPoint = JSON.parse(waypoint_json[i]);
        console.log('parsedWayPoint', parsedWayPoint);
        console.log('parsedWayPoint.length', parsedWayPoint.length);

        var parsedWayPointProperties = JSON.parse(waypoint_otherproperties[i]);
        console.log('parsedWayPointProperties', parsedWayPointProperties);
        console.log('parsedWayPointProperties.length', parsedWayPointProperties.length);

        var lastIndex = parsedWayPoint.length - 1;
        var start = parsedWayPoint[0].location;
        var end = parsedWayPoint[lastIndex].location;
        console.log('start', start);
        console.log('end', end);
        var waypts = [];
        waypts = parsedWayPoint;
        waypts.splice(0, 1);
        waypts.splice(waypts.length - 1, 1);

        var combinedResults;
        var unsortedResults = [{}]; // to hold the counter and the results themselves as they come back, to later sort
        var directionsResultsReturned = 0;

        var request = {
            origin: start,
            destination: end,
            waypoints: waypts,
            provideRouteAlternatives: true,
            optimizeWaypoints: optimize,
            travelMode: window.google.maps.TravelMode.DRIVING
        };

        var delayFactor = 0;
        (function m_get_directions_route(kk) {
            directionsService.route(request, function(result, status) {
                if (status == window.google.maps.DirectionsStatus.OK) {

                    var unsortedResult = {
                        order: kk,
                        result: result
                    };
                    unsortedResults.push(unsortedResult);

                    directionsResultsReturned++;

                    if (directionsResultsReturned == waypoint_json.length) // we've received all the results. put to map
                    {
                        // sort the returned values into their correct order
                        unsortedResults.sort(function(a, b) {
                            return parseFloat(a.order) - parseFloat(b.order);
                        });
                        var count = 0;
                        for (var key in unsortedResults) {
                            if (unsortedResults[key].result != null) {
                                if (unsortedResults.hasOwnProperty(key)) {
                                    if (count == 0) // first results. new up the combinedResults object
                                        combinedResults = unsortedResults[key].result;
                                    else {
                                        // only building up legs, overview_path, and bounds in my consolidated object. This is not a complete
                                        // directionResults object, but enough to draw a path on the map, which is all I need
                                        combinedResults.routes[0].legs = combinedResults.routes[0].legs.concat(unsortedResults[key].result.routes[0].legs);
                                        combinedResults.routes[0].overview_path = combinedResults.routes[0].overview_path.concat(unsortedResults[key].result.routes[0].overview_path);

                                        combinedResults.routes[0].bounds = combinedResults.routes[0].bounds.extend(unsortedResults[key].result.routes[0].bounds.getNorthEast());
                                        combinedResults.routes[0].bounds = combinedResults.routes[0].bounds.extend(unsortedResults[key].result.routes[0].bounds.getSouthWest());
                                    }
                                    count++;
                                }
                            }
                        }

                        directionsDisplay.setDirections(combinedResults);
                        console.log('combinedResults', combinedResults);
                        //getTravellingDetails(combinedResults);
                        $('#travelling_time_' + zee + '').val(getTravellingDetails(combinedResults)[0]);
                        $('#travelling_distance_' + zee + '').val(getTravellingDetails(combinedResults)[1] + ' km');
                        //showSteps(combinedResults, markerArray, stepDisplay, map, parsedWayPointProperties);
                    }
                } else if (status == window.google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
                    console.log('OVER_QUERY_LIMIT');
                    delayFactor++;
                    setTimeout(function() {
                        m_get_directions_route(kk);
                    }, delayFactor * 1000);
                } else {
                    console.log("Route: " + status);
                }
            });
        })(i);
    }
}

function getTravellingDetails(directionResult) {
    var travellingTime = '';
    var travellingDistance = 0;
    var travellingTime_sec = 0;
    var legs = directionResult.routes[0].legs;
    for (i = 0; i < legs.length; i++) {
        //console.log('directionResult.routes[0].legs[i].duration.value', directionResult.routes[0].legs[i].duration.value);
        travellingTime_sec += directionResult.routes[0].legs[i].duration.value;
        travellingDistance += directionResult.routes[0].legs[i].distance.value;
    }
    //console.log('travellingTime_sec', travellingTime_sec);
    travellingTime_array = convertSecondsToHours(travellingTime_sec);
    if (!isNullorEmpty(travellingTime_array[0])) {
        travellingTime += '' + travellingTime_array[0] + 'h';
    }
    travellingTime += '' + travellingTime_array[1] + 'm';
    travellingTime += '' + travellingTime_array[2] + 's';

    travellingDistance = travellingDistance / 1000;
    return [travellingTime, travellingDistance]

}

function showSteps(directionResult, markerArray, stepDisplay, map, parsedWayPointProperties) {
    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    var myRoute = directionResult.routes[0].legs[0];
    console.log('myRoute', myRoute);
    for (var i = 0; i < myRoute.steps.length; i++) {
        var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
        marker.setMap(map);
        console.log('myRoute.steps[i].start_location', myRoute.steps[i].start_location);
        marker.setPosition(myRoute.steps[i].start_location);
        attachInstructionText(
            stepDisplay, marker, myRoute.steps[i].instructions, map);
    }
}

function attachInstructionText(stepDisplay, marker, text, map) {
    google.maps.event.addListener(marker, 'click', function() {
        // Open an info window when the marker is clicked on, containing the text
        // of the step.
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}

function onclick_runScheduler(zee) {
    window.open(nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar', 'customdeploy_sl_full_calender') + "&zee=" + zee + '');
}

function onclick_smc(zee) {
    window.open(nlapiResolveURL('SUITELET', 'customscript_sl_smc_summary', 'customdeploy_sl_smc_summary') + "&zee=" + zee + '');
}


$(document).on('click', '#applyZee', function(event) {
    var zee = $('.zee_dropdown').selectpicker('val');

    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=887&deploy=1";

    url += "&zee=" + zee + "";

    window.location.href = url;
});

$(document).on('change', '.op_dropdown', function(event) {
    var op = $(this).val();
    var zee = $(this).attr('data-zeeid');
    console.log('zee', zee);
    filterRunDropdown(zee, op);
});

function filterRunDropdown(zee, op) {
    var run_empty = true; //to know if a run exists for this operator
    //console.log('op', op);
    var run_dropdown = $('#run_dropdown_' + zee + '');
    for (k = 0; k < run_dropdown[0].length; k++) {
        var option = run_dropdown[0][k];
        //console.log('option.value', option.value);
        var run_op = $('#' + option.value + '').attr('data-op');
        //console.log('run_op', run_op);
        if (op == 0) { //ALL operators, all the runs can be selected
            $('#' + option.value + '').removeAttr('disabled');
        } else if (!isNullorEmpty(run_op) && run_op == op) { //the run is assigned to this operator
            $('#' + option.value + '').removeAttr('disabled');
            run_empty = false;
        } else if (!isNullorEmpty(run_op) && run_op != op) { //this run is not assigned to this op so can't be selected
            $('#' + option.value + '').attr('disabled', 'disabled');
        }
    }
    console.log('run_empty', run_empty);
    if (run_empty == true && op != 0) {
        $('#no_run').removeAttr('disabled');
        $('#0').attr('disabled', 'disabled');
        $('#run_dropdown_' + zee + '').val('no_run');
        /*run_dropdown.find('#no_run').removeAttr('disabled');
        run_dropdown.find('#0').attr('disabled', 'disabled');
        run_dropdown.find('#run_dropdown_' + zee + '').val('no_run');*/
    } else if (run_empty == false || op == 0) {
        $('#0').removeAttr('disabled');
        $('#no_run').attr('disabled', 'disabled');
        $('#run_dropdown_' + zee + '').val(0);
    }
    return $('option:selected', '#run_dropdown_' + zee + '').val()
}

$(document).on('click', '#apply', function(event) {
    var day = $('option:selected', '#day_dropdown').val();
    var before_time_2 = $('#before_time').val();
    var after_time_2 = $('#after_time').val();
    var run_array = [];
    var op_array = [];
    var optimize_array = [];

    $('.tab-pane').each(function(e) {
        console.log($(this));
        var id = $(this)[0].id;
        //day[day_array.length] = $('option:selected', '#day_dropdown_' + id + '').val();
        run_array[run_array.length] = $('option:selected', '#run_dropdown_' + id + '').val();
        op_array[op_array.length] = $('option:selected', '#op_dropdown_' + id + '').val();
        //before_time_array[before_time_array.length] = $('#before_time_' + id + '').val();
        //after_time_array[after_time_array.length] = $('#after_time_' + id + '').val();
        optimize_array[optimize_array.length] = $('#optimize_' + id + '').prop('checked');
    })
    console.log('day', day);
    console.log('run_array', run_array);
    console.log('op_array', op_array);
    console.log('before_time_2', before_time_2);
    console.log('after_time_2', after_time_2);
    console.log('optimize_array', optimize_array);

    var url = baseURL + "/app/site/hosting/scriptlet.nl?script=887&deploy=1";

    url += "&zee=" + zee_array + "";
    url += "&day=" + day + "";
    url += "&op=" + op_array + "";
    url += "&run=" + run_array + "";
    url += "&before=" + before_time_2 + "";
    url += "&after=" + after_time_2 + "";
    url += "&optimize=" + optimize_array + "";

    window.location.href = url;
});

$(".nav-tabs").on("click", "li a", function(e) {
    var this_zee = $(this).attr('href');
    $(".tabs").each(function() {
        $(this).find(".nav-tabs li").each(function(index, element) {
            var zee_id = $(this).children('a').attr('href');
            console.log('zee_id: ' + zee_id);
            $(this).children('a').css({
                "background-color": "white",
                "color": "#337ab7"
            });
            if ($(this).attr('class') == 'active') {

            } else if (this_zee == zee_id) {
                $(this).children('a').tab('show');
            }
        });

    });
    $(this).css({
        "background-color": "rgb(50, 122, 183)",
        "color": "white"
    });
});

/*$(document).on('click', '.run_summary', function(e) {
    var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');
    var newFilters_runPlan = new Array();
    newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'anyof', zee);
    runPlanSearch.addFilters(newFilters_runPlan);
    var resultSet_runPlan = runPlanSearch.runSearch();

    resultSet_runPlan.forEachResult(function(searchResult_runPlan) {
        var run_array = getRunJSON(zee, run, day, before_time, after_time);
        return true;
    }
})*/

function initAutocomplete() {
    // Create the autocomplete object, restricting the search to geographical location types.
    // types is empty to get all places, not only address. Previously it was types: ['geocode']
    var options = {
        types: [],
        componentRestrictions: {
            country: 'au'
        }
    }
    autocomplete = new google.maps.places.Autocomplete((document.getElementById('address')), options);

    // When the user selects an address from the dropdown, populate the address fields in the form.
    autocomplete.addListener('place_changed', fillInAddress);
}

$(document).on('focus', '#address', function(event) {
    // alert('onfocus')
    initAutocomplete();
});

//Fill the Street No. & Street Name after selecting an address from the dropdown
function fillInAddress() {

    // Get the place details from the autocomplete object.
    var place = autocomplete.getPlace();

    $('#lat').val(place.geometry.location.lat());
    $('#lng').val(place.geometry.location.lng());

    // Get each component of the address from the place details and fill the corresponding field on the form.
    var addressComponent = "";

    for (var i = 0; i < place.address_components.length; i++) {

        if (place.address_components[i].types[0] == 'street_number' || place.address_components[i].types[0] == 'route') {
            addressComponent += place.address_components[i]['short_name'] + " ";
            $('#address').val(addressComponent);
        }
        if (place.address_components[i].types[0] == 'postal_code') {
            $('#postcode').val(place.address_components[i]['short_name']);
        }
        if (place.address_components[i].types[0] == 'administrative_area_level_1') {
            $('#state').val(place.address_components[i]['short_name']);
        }
        if (place.address_components[i].types[0] == 'locality') {
            $('#city').val(place.address_components[i]['short_name']);
        }
    }

    getTerritory(place.geometry.location.lat(), place.geometry.location.lng());


}

function getTerritory(lat, lng) {
    console.time('getTerritory');

    var territory = 'OUT OF TERRITORY';

    $.getJSON("https://1048144.app.netsuite.com/core/media/media.nl?id=3772482&c=1048144&h=4579935b386159057056&_xt=.js", function(data) {
        //$.getJSON("https://1048144-sb3.app.netsuite.com/core/media/media.nl?id=3771516&c=1048144_SB3&h=afd38c5aed85b40b9cc0&_xt=.js", function(data) {
        console.log(data);
        var territories = data.features;
        console.log('territories', territories);
        console.log('territories.length', territories.length);
        for (k = 0; k < territories.length; k++) {
            var polygon_array = territories[k].geometry.coordinates;
            var polygon = [];
            if (polygon_array.length > 1) {
                for (i = 0; i < polygon_array.length; i++) {
                    polygon = polygon.concat(polygon_array[i][0]);
                }
            } else {
                polygon = polygon_array[0];
            }
            console.log('polygon' + territories[k].properties.Territory + '', polygon);
            console.log('polygon.length' + territories[k].properties.Territory + '', polygon.length);
            var isInTerritory = inside([lng, lat], polygon);
            console.log('isInTerritory' + territories[k].properties.Territory + '', isInTerritory);
            if (isInTerritory == true) {
                territory = territories[k].properties.Territory;
                break;
            }
        }
        $('#territory').val(territory);
        console.log('territory', territory);
        console.timeEnd('getTerritory');
    });
}

function inside(point, polygon) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0],
        y = point[1];
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][0],
            yi = polygon[i][1];
        var xj = polygon[j][0],
            yj = polygon[j][1];

        var intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

$(document).on('click', '#viewOnMap', function(event) {
    var position = {
        lat: parseFloat($('#lat').val()),
        lng: parseFloat($('#lng').val())
    }
    var new_marker = new google.maps.Marker({
        position: position,
        map: map,
        //icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        title: 'My New Marker',
        //label: 'NEW',
    });
    search_markers_array[search_markers_array.length] = new_marker; //store the markers created to be able to delete them
    map.setCenter(position);
    map.setZoom(14);
});

$(document).on('click', '#clearMarkers', function(event) {
    for (i = 0; i < search_markers_array.length; i++) {
        var marker = search_markers_array[i];
        marker.setMap(null);
    }
    search_markers_array = [];
});

$(document).on('click', '#runMarkers', function(event) {
    console.log($(this).val());
    if ($(this).val() == 'HIDE RUN MARKERS') {
        for (i = 0; i < run_markers_array.length; i++) {
            var marker = run_markers_array[i];
            marker.setMap(null);
        }
        $('#runMarkers').val('SHOW RUN MARKERS');
    } else if ($(this).val() == 'SHOW RUN MARKERS') {
        for (i = 0; i < run_markers_array.length; i++) {
            var marker = run_markers_array[i];
            marker.setMap(map);
        }
        $('#runMarkers').val('HIDE RUN MARKERS');
    }
    $('#runMarkers').toggleClass('btn-success');
    $('#runMarkers').toggleClass('btn-danger');
});

$(document).on('click', '#territoryMap', function(event) {
    console.log($(this).val());
    if ($(this).val() == 'HIDE TERRITORY MAP') {
        map.data.setStyle({
            visible: false
        });
        $('#territoryMap').val('SHOW TERRITORY MAP');
    } else if ($(this).val() == 'SHOW TERRITORY MAP') {
        map.data.setStyle({
            visible: true
        });
        $('#territoryMap').val('HIDE TERRITORY MAP');
    }
    $('#territoryMap').toggleClass('btn-success');
    $('#territoryMap').toggleClass('btn-danger');
});

$(document).on('click', '#printDirections', function(event) {
    var zee_text_array = nlapiGetFieldValue('zee_text');
    var zee_text = zee_text_array.split(',')[0];
    var day_text = nlapiGetFieldValue('day_text');
    var before_time = nlapiGetFieldValue('beforetime');
    var after_time = nlapiGetFieldValue('aftertime');

    var run_text_array = nlapiGetFieldValue('run_text');
    var run_text = run_text_array.split(',')[0];
    console.log('run_text', run_text);

    if (!isNullorEmpty(run_text)) { //one run
        var op_text_array = nlapiGetFieldValue('op_text');
        var op_text = op_text_array.split(',')[0];
        var title = '' + zee_text + ' - ' + run_text + ' (' + op_text + ') - ' + day_text + '';
    } else { //the all run
        var title = '' + zee_text + ' - ALL - ' + day_text + '';
    }
    if (!isNullorEmpty(before_time)) {
        title += ' - Before ' + onTimeChange(before_time) + '';
    }
    if (!isNullorEmpty(after_time)) {
        title += ' - After ' + onTimeChange(before_time) + '';
    }
    console.log('printing', title);
    $('#directionsPanel').css("overflow", "visible");
    $('#directionsPanel').removeClass('hide');
    printJS({
        printable: 'directionsPanel',
        type: 'html',
        //header: header,
        documentTitle: title,
        targetStyles: ['*'],
        onPrintDialogClose: directionsPanelOverflow,
    })

});

function directionsPanelOverflow() {
    $('#directionsPanel').css("overflow", "auto");
    $('#directionsPanel').addClass('hide');
}

function getRunJSON(zee, run, day, before_time, after_time) {
    //console.log('zee', zee);
    //console.log('run', run);
    //console.log('day', day);
    //console.log('before_time', before_time);
    //console.log('after_time', after_time);
    var serviceLegSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_leg_freq_all_2');

    var newFilters = new Array();
    newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_service_leg_franchisee', null, 'anyof', zee);
    newFilters[newFilters.length] = new nlobjSearchFilter(days_of_week[day], "custrecord_service_freq_stop", "is", "T");
    if (!isNullorEmpty(before_time)) {
        newFilters[newFilters.length] = new nlobjSearchFilter("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "lessthanorequalto", onTimeChange(before_time));
    }
    if (!isNullorEmpty(after_time)) {
        newFilters[newFilters.length] = new nlobjSearchFilter("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "greaterthanorequalto", onTimeChange(after_time));
    }
    if (!isNullorEmpty(run) && run != 0) {
        newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_service_freq_run_plan', 'custrecord_service_freq_stop', 'is', run);
    }


    var stop_count = 0;
    var freq_count = 0;

    var old_stop_name = null;
    var service_id_array = [];
    var service_name_array = [];
    var service_descp_array = [];
    var old_customer_id_array = [];
    var old_customer_text_array = [];
    var old_run_plan_array = [];
    var old_run_plan_text_array = [];
    var old_closing_day = [];
    var old_opening_day = [];
    var old_service_notes = [];

    var stop_id;
    var stop_name;
    var address;
    var stop_duration;
    var stop_notes;
    var stop_lat;
    var stop_lon;
    var service_id;
    var service_text;
    var customer_id;
    var customer_text;
    var ncl;
    var freq_id;
    var freq_mon;
    var freq_tue;
    var freq_wed;
    var freq_thu;
    var freq_fri;
    var freq_adhoc;
    var freq_time_current;
    var freq_time_start;
    var freq_time_end;
    var freq_run_plan;

    var old_stop_id = [];
    var old_stop_name;
    var old_service_time;
    var old_address;
    var old_stop_duration;
    var old_stop_notes = '';
    var old_stop_lat;
    var old_stop_lon;
    var old_service_id;

    var old_service_text;
    var old_customer_id;
    var old_customer_text;
    var old_ncl;
    var old_freq_id = [];
    var old_freq_mon;
    var old_freq_tue;
    var old_freq_wed;
    var old_freq_thu;
    var old_freq_fri;
    var old_freq_adhoc;
    var old_freq_time_current;
    var old_freq_time_start;
    var old_freq_time_end;
    var old_freq_run_plan;
    var old_address;

    var firststop_time;
    var laststop_time;


    var freq = [];
    var old_freq = [];

    var stop_freq_json = '{ "data": [';

    serviceLegSearch.addFilters(newFilters);

    var resultSet = serviceLegSearch.runSearch();

    resultSet.forEachResult(function(searchResult) {
        stop_id = searchResult.getValue('internalid', null, "GROUP");
        stop_name = searchResult.getValue('name', null, "GROUP");
        stop_duration = parseInt(searchResult.getValue('custrecord_service_leg_duration', null, "GROUP"));
        stop_notes = searchResult.getValue('custrecord_service_leg_notes', null, "GROUP");
        stop_lat = searchResult.getValue("custrecord_service_leg_addr_lat", null, "GROUP");
        stop_lon = searchResult.getValue("custrecord_service_leg_addr_lon", null, "GROUP");
        service_id = searchResult.getValue('custrecord_service_leg_service', null, "GROUP");
        service_text = searchResult.getText('custrecord_service_leg_service', null, "GROUP");
        customer_id = searchResult.getValue('custrecord_service_leg_customer', null, "GROUP");
        customer_text = searchResult.getText('custrecord_service_leg_customer', null, "GROUP");
        customer_id_text = searchResult.getValue("entityid", "CUSTRECORD_SERVICE_LEG_CUSTOMER", "GROUP");
        customer_name_text = searchResult.getValue("companyname", "CUSTRECORD_SERVICE_LEG_CUSTOMER", "GROUP");
        ncl = searchResult.getValue('custrecord_service_leg_non_cust_location', null, "GROUP");

        if (!isNullorEmpty(stop_notes)) {
            if (isNullorEmpty(ncl)) {
                stop_notes = '</br><b>Stop Notes</b> - ' + stop_notes + '</br>';
            } else {
                // stop_notes = '</br><b>Stop Notes</b> - '+customer_name_text + ' : ' + stop_notes + '</br>';
                stop_notes = '<b>Stop Notes</b> - ' + stop_notes + '</br>';
            }

        } else {
            stop_notes = '';
        }

        freq_id = searchResult.getValue("internalid", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
        freq_mon = searchResult.getValue("custrecord_service_freq_day_mon", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
        freq_tue = searchResult.getValue("custrecord_service_freq_day_tue", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
        freq_wed = searchResult.getValue("custrecord_service_freq_day_wed", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
        freq_thu = searchResult.getValue("custrecord_service_freq_day_thu", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
        freq_fri = searchResult.getValue("custrecord_service_freq_day_fri", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
        freq_adhoc = searchResult.getValue("custrecord_service_freq_day_adhoc", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
        freq_time_current = convertTo24Hour(searchResult.getValue("custrecord_service_freq_time_current", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP"));
        freq_time_start = convertTo24Hour(searchResult.getValue("custrecord_service_freq_time_start", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP"));
        freq_time_end = convertTo24Hour(searchResult.getValue("custrecord_service_freq_time_end", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP"));
        freq_run_plan = searchResult.getValue("custrecord_service_freq_run_plan", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
        closing_day = searchResult.getValue("custrecord_service_leg_closing_date", null, "GROUP");
        opening_day = searchResult.getValue("custrecord_service_leg_opening_date", null, "GROUP");
        freq_run_plan_text = searchResult.getText("custrecord_service_freq_run_plan", "CUSTRECORD_SERVICE_FREQ_STOP", "GROUP");
        freq_run_st_no = searchResult.getValue("custrecord_service_leg_addr_st_num_name", null, "GROUP");
        freq_run_suburb = searchResult.getValue("custrecord_service_leg_addr_suburb", null, "GROUP");
        freq_run_state = searchResult.getValue("custrecord_service_leg_addr_state", null, "GROUP");
        freq_run_postcode = searchResult.getValue("custrecord_service_leg_addr_postcode", null, "GROUP");

        if (!isNullorEmpty(freq_run_st_no)) {
            address = freq_run_st_no + ', ' + freq_run_suburb + ', ' + freq_run_state + ' - ' + freq_run_postcode;
        } else {
            address = freq_run_suburb + ', ' + freq_run_state + ' - ' + freq_run_postcode;
        }

        if (stop_count == 0) { //GET FIRST STOP TIME
            firststop_time = onTimeChange(freq_time_current);
        }

        freq = [];

        if (freq_mon == 'T') {
            freq[freq.length] = 1
        }

        if (freq_tue == 'T') {
            freq[freq.length] = 2
        }

        if (freq_wed == 'T') {
            freq[freq.length] = 3
        }

        if (freq_thu == 'T') {
            freq[freq.length] = 4
        }

        if (freq_fri == 'T') {
            freq[freq.length] = 5
        }

        if (isNullorEmpty(ncl)) {
            // stop_name = customer_id_text + ' ' + customer_name_text + ' - ' + address;
            stop_name = customer_name_text + ' \\n Address: ' + address;
        }


        if (stop_count != 0 && old_stop_name != stop_name) {
            if (!isNullorEmpty(old_freq_id.length)) {
                var freq_time_current_array = old_freq_time_current.split(':');

                var min_array = convertSecondsToMinutes(old_stop_duration);

                min_array[0] = min_array[0] + parseInt(freq_time_current_array[1]);

                if (isNullorEmpty(old_ncl)) {
                    var bg_color = '#3a87ad';
                } else {
                    var bg_color = '#009688';
                }


                var date = moment().day(day).date();
                var month = moment().day(day).month();
                var year = moment().day(day).year();

                var date_of_week = date + '/' + (month + 1) + '/' + year;

                stop_freq_json += '{"id": "' + old_stop_id + '",';
                stop_freq_json += '"closing_days": "' + old_closing_day + '",';
                stop_freq_json += '"opening_days": "' + old_opening_day + '",';
                stop_freq_json += '"lat": "' + old_stop_lat + '",';
                stop_freq_json += '"lon": "' + old_stop_lon + '",';
                stop_freq_json += '"address": "' + old_address + '",';
                if (isNullorEmpty(old_ncl)) {
                    for (var i = 0; i < service_id_array.length; i++) {
                        if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                            stop_freq_json += '"title": "CLOSED - ' + old_stop_name + '",';
                            stop_freq_json += '"color": "#ad3a3a",';
                        } else {
                            stop_freq_json += '"title": "' + old_stop_name + '",';
                            stop_freq_json += '"color": "' + bg_color + '",';

                        }
                    }
                } else {
                    stop_freq_json += '"title": "' + old_stop_name + '",';
                    stop_freq_json += '"color": "' + bg_color + '",';
                }

                //var start_time = moment().day(day).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                var start_time = old_freq_time_current;
                var end_time = moment().add({
                    seconds: min_array[1]
                }).day(day).hours(freq_time_current_array[0]).minutes(min_array[0]).format();

                stop_freq_json += '"start": "' + start_time + '",';
                stop_freq_json += '"end": "' + end_time + '",';
                stop_freq_json += '"description": "' + old_stop_notes + '",';
                stop_freq_json += '"ncl": "' + old_ncl + '",';
                stop_freq_json += '"freq_id": "' + old_freq_id + '",';
                stop_freq_json += '"services": ['

                for (var i = 0; i < service_id_array.length; i++) {
                    // nlapiLogExecution('DEBUG', 'customer', old_customer_text_array[i]);
                    // nlapiLogExecution('DEBUG', 'closing day', old_closing_day[i]);
                    stop_freq_json += '{';
                    stop_freq_json += '"customer_id": "' + old_customer_id_array[i] + '",';
                    stop_freq_json += '"customer_notes": "' + old_service_notes[i] + '",';
                    if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                        stop_freq_json += '"customer_text": "CLOSED - ' + old_customer_text_array[i] + '",';
                    } else {
                        stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                    }



                    stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                    stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                    stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                    stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                    stop_freq_json += '},'
                }
                stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                stop_freq_json += ']},'



                old_stop_name = null;
                old_address = null;
                old_stop_lat;
                old_stop_lon;
                old_stop_id = [];
                old_closing_day = [];
                old_opening_day = [];
                service_id_array = [];
                service_name_array = [];
                old_customer_id_array = [];
                old_customer_text_array = [];
                old_freq_id = [];
                old_run_plan_array = [];
                old_run_plan_text_array = [];
                old_stop_notes = '';
                old_service_notes = [];


                old_freq = [];
                freq = [];

                if (freq_mon == 'T') {
                    freq[freq.length] = 1
                }

                if (freq_tue == 'T') {
                    freq[freq.length] = 2
                }

                if (freq_wed == 'T') {
                    freq[freq.length] = 3
                }

                if (freq_thu == 'T') {
                    freq[freq.length] = 4
                }

                if (freq_fri == 'T') {
                    freq[freq.length] = 5
                }



                service_id_array[service_id_array.length] = service_id;
                old_service_notes[old_service_notes.length] = stop_notes;
                service_name_array[service_name_array.length] = service_text;
                old_customer_id_array[old_customer_id_array.length] = customer_id;
                old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                old_closing_day[old_closing_day.length] = closing_day;
                old_opening_day[old_opening_day.length] = opening_day;
                // stop_count++;
            }
        } else {

            //var result = arraysEqual(freq, old_freq);
            if (old_service_time != freq_time_current && stop_count != 0) {
                if (!isNullorEmpty(old_freq_id.length)) {
                    var freq_time_current_array = old_freq_time_current.split(':');

                    var min_array = convertSecondsToMinutes(old_stop_duration);

                    min_array[0] = min_array[0] + parseInt(freq_time_current_array[1]);

                    if (isNullorEmpty(old_ncl)) {
                        var bg_color = '#3a87ad';
                    } else {
                        var bg_color = '#009688';
                    }


                    var date = moment().day(day).date();
                    var month = moment().day(day).month();
                    var year = moment().day(day).year();

                    var date_of_week = date + '/' + (month + 1) + '/' + year;

                    stop_freq_json += '{"id": "' + old_stop_id + '",';
                    stop_freq_json += '"closing_days": "' + old_closing_day + '",';
                    stop_freq_json += '"opening_days": "' + old_opening_day + '",';
                    stop_freq_json += '"lat": "' + old_stop_lat + '",';
                    stop_freq_json += '"lon": "' + old_stop_lon + '",';
                    stop_freq_json += '"address": "' + old_address + '",';
                    if (isNullorEmpty(old_ncl)) {
                        for (var i = 0; i < service_id_array.length; i++) {
                            if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                                stop_freq_json += '"title": "CLOSED - ' + old_stop_name + '",';
                                stop_freq_json += '"color": "#ad3a3a",';
                            } else {
                                stop_freq_json += '"title": "' + old_stop_name + '",';
                                stop_freq_json += '"color": "' + bg_color + '",';

                            }
                        }
                    } else {
                        stop_freq_json += '"title": "' + old_stop_name + '",';
                        stop_freq_json += '"color": "' + bg_color + '",';
                    }

                    //var start_time = moment().day(day).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
                    var start_time = old_freq_time_current;
                    var end_time = moment().add({
                        seconds: min_array[1]
                    }).day(day).hours(freq_time_current_array[0]).minutes(min_array[0]).format();


                    stop_freq_json += '"start": "' + start_time + '",';
                    stop_freq_json += '"end": "' + end_time + '",';
                    stop_freq_json += '"description": "' + old_stop_notes + '",';
                    stop_freq_json += '"ncl": "' + old_ncl + '",';
                    stop_freq_json += '"freq_id": "' + old_freq_id + '",';
                    stop_freq_json += '"services": ['

                    for (var i = 0; i < service_id_array.length; i++) {
                        // nlapiLogExecution('DEBUG', 'customer', old_customer_text_array[i]);
                        // nlapiLogExecution('DEBUG', 'closing day', old_closing_day[i]);
                        stop_freq_json += '{';
                        stop_freq_json += '"customer_id": "' + old_customer_id_array[i] + '",';
                        stop_freq_json += '"customer_notes": "' + old_service_notes[i] + '",';
                        if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                            stop_freq_json += '"customer_text": "CLOSED - ' + old_customer_text_array[i] + '",';
                        } else {
                            stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
                        }



                        stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
                        stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
                        stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
                        stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
                        stop_freq_json += '},'
                    }
                    stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
                    stop_freq_json += ']},'



                    old_stop_name = null;
                    old_address = null;
                    old_service_time = null;
                    old_stop_id = [];
                    old_closing_day = [];
                    old_opening_day = [];
                    service_id_array = [];
                    service_name_array = [];
                    old_customer_id_array = [];
                    old_customer_text_array = [];
                    old_run_plan_array = [];
                    old_run_plan_text_array = [];
                    old_freq_id = [];
                    old_freq = [];
                    freq = [];
                    old_stop_notes = '';
                    old_closing_day = [];
                    old_opening_day = [];
                    old_service_notes = [];


                    if (freq_mon == 'T') {
                        freq[freq.length] = 1
                    }

                    if (freq_tue == 'T') {
                        freq[freq.length] = 2
                    }

                    if (freq_wed == 'T') {
                        freq[freq.length] = 3
                    }

                    if (freq_thu == 'T') {
                        freq[freq.length] = 4
                    }

                    if (freq_fri == 'T') {
                        freq[freq.length] = 5
                    }

                    service_id_array[service_id_array.length] = service_id;
                    old_service_notes[old_service_notes.length] = stop_notes;
                    service_name_array[service_name_array.length] = service_text;
                    old_customer_id_array[old_customer_id_array.length] = customer_id;
                    old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                    old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                    old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                    old_closing_day[old_closing_day.length] = closing_day;
                    old_opening_day[old_opening_day.length] = opening_day;
                }
            } else {
                service_id_array[service_id_array.length] = service_id;
                old_service_notes[old_service_notes.length] = stop_notes;
                service_name_array[service_name_array.length] = service_text;
                old_customer_id_array[old_customer_id_array.length] = customer_id;
                old_customer_text_array[old_customer_text_array.length] = customer_id_text + ' ' + customer_name_text;
                old_run_plan_array[old_run_plan_array.length] = freq_run_plan;
                old_run_plan_text_array[old_run_plan_text_array.length] = freq_run_plan_text;
                old_closing_day[old_closing_day.length] = closing_day;
                old_opening_day[old_opening_day.length] = opening_day;
            }

        }



        old_stop_name = stop_name;
        old_service_time = freq_time_current;
        old_address = address;

        old_stop_id[old_stop_id.length] = stop_id;
        old_stop_lat = stop_lat;
        old_stop_lon = stop_lon;


        old_stop_duration = stop_duration;
        old_stop_notes += stop_notes;

        old_ncl = ncl;
        old_freq_id[old_freq_id.length] = freq_id;
        old_freq_mon = freq_mon;
        old_freq_tue = freq_tue;
        old_freq_wed = freq_wed;
        old_freq_thu = freq_thu;
        old_freq_fri = freq_fri;
        old_freq_adhoc = freq_adhoc;
        old_freq_time_current = freq_time_current;
        old_freq_time_start = freq_time_start;
        old_freq_time_end = freq_time_end;
        old_freq_run_plan = freq_run_plan;

        old_freq = freq;

        stop_count++;

        return true;
    });

    if (stop_count > 0) {
        var freq_time_current_array = old_freq_time_current.split(':');
        var laststop_time = onTimeChange(old_freq_time_current); //AM/PM format

        var min_array = convertSecondsToMinutes(old_stop_duration);

        min_array[0] = min_array[0] + parseInt(freq_time_current_array[1]);

        if (isNullorEmpty(old_ncl)) {
            var bg_color = '#3a87ad';
        } else {
            var bg_color = '#009688';
        }


        var date = moment().day(day).date();
        var month = moment().day(day).month();
        var year = moment().day(day).year();

        var date_of_week = date + '/' + (month + 1) + '/' + year;

        stop_freq_json += '{"id": "' + old_stop_id + '",';
        stop_freq_json += '"closing_days": "' + old_closing_day + '",';
        stop_freq_json += '"opening_days": "' + old_opening_day + '",';
        stop_freq_json += '"lat": "' + old_stop_lat + '",';
        stop_freq_json += '"lon": "' + old_stop_lon + '",';
        stop_freq_json += '"address": "' + old_address + '",';
        if (isNullorEmpty(old_ncl)) {
            for (var i = 0; i < service_id_array.length; i++) {
                if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                    stop_freq_json += '"title": "CLOSED - ' + old_stop_name + '",';
                    stop_freq_json += '"color": "#ad3a3a",';
                } else {
                    stop_freq_json += '"title": "' + old_stop_name + '",';
                    stop_freq_json += '"color": "' + bg_color + '",';

                }
            }
        } else {
            stop_freq_json += '"title": "' + old_stop_name + '",';
            stop_freq_json += '"color": "' + bg_color + '",';
        }

        //var start_time = moment().day(day).hours(freq_time_current_array[0]).minutes(freq_time_current_array[1]).seconds(0).format();
        var start_time = old_freq_time_current;
        var end_time = moment().add({
            seconds: min_array[1]
        }).day(day).hours(freq_time_current_array[0]).minutes(min_array[0]).format();


        stop_freq_json += '"start": "' + start_time + '",';
        stop_freq_json += '"end": "' + end_time + '",';
        stop_freq_json += '"description": "' + old_stop_notes + '",';
        stop_freq_json += '"ncl": "' + old_ncl + '",';
        stop_freq_json += '"freq_id": "' + old_freq_id + '",';
        stop_freq_json += '"services": ['

        for (var i = 0; i < service_id_array.length; i++) {
            stop_freq_json += '{';
            stop_freq_json += '"customer_id": "' + old_customer_id_array[i] + '",';
            stop_freq_json += '"customer_notes": "' + old_service_notes[i] + '",';
            if (date_of_week >= old_closing_day[i] && date_of_week < old_opening_day[i]) {
                stop_freq_json += '"customer_text": "CLOSED - ' + old_customer_text_array[i] + '",';
            } else {
                stop_freq_json += '"customer_text": "' + old_customer_text_array[i] + '",';
            }



            stop_freq_json += '"run_plan": "' + old_run_plan_array[i] + '",';
            stop_freq_json += '"run_plan_text": "' + old_run_plan_text_array[i] + '",';
            stop_freq_json += '"service_id": "' + service_id_array[i] + '",';
            stop_freq_json += '"service_text": "' + service_name_array[i] + '"';
            stop_freq_json += '},'
        }
        stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
        stop_freq_json += ']},';


        stop_freq_json = stop_freq_json.substring(0, stop_freq_json.length - 1);
    }

    stop_freq_json += ']}';

    console.log(stop_freq_json);
    var parsedStopFreq = JSON.parse(stop_freq_json);
    //console.log(parsedStopFreq);

    return [parsedStopFreq, firststop_time, laststop_time];
}


function convertSecondsToHours(secs) {
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var hours_array = [];
    hours_array[0] = hours;
    hours_array[1] = minutes;
    hours_array[2] = seconds;
    return hours_array;
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

function onTimeChange(value) {
    // console.log('value: ' + value)
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

function getDate() {
    var date = new Date();
    /*    if (date.getHours() > 6) {
            date = nlapiAddDays(date, 1);
        }*/
    date = nlapiDateToString(date);

    return date;
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