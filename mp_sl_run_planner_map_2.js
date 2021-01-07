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
    var zee_array = [];

    var role = runtime.getCurrentUser().role;
    if (role == 1000) {
        //Franchisee
        zee_array = [runtime.getCurrentUser()];
    } else if (role == 3) { //Administrator
        zee_array = []; //test
    } else if (role == 1032) { // System Support
        zee_array = []; //test-AR
    }

    var zee_text_array = [];
    var day;
    var before_time;
    var after_time;
    var run_array = [];
    var run_text_array = [];
    var op_array = [];
    var op_text_array = [];
    var optimize_array = [];

    var color_array = ['blue', 'red', 'green', 'orange', 'black'];


    function onRequest(context) {  
        
        if (context.request.method === 'GET') {
            //PARAMETERS
            var zee_string = context.request.parameters.zee;
            if (!isNullorEmpty(zee_string)) {
                zee_array = zee_string.split(',');
            }

            var day = context.request.parameters.day;
            if (isNullorEmpty(day)) {
                var day = getDay();
                if (day == 0 || day == 6) {
                    day = 1; //Monday
                }
            }

            var before_time = context.request.parameters.before;
            var after_time = context.request.parameters.after;
            
            var op_string = context.request.parameters.op;
            if (!isNullorEmpty(op_string)) {
                op_array = op_string.split(',');
            }
            var run_string = context.request.parameters.run;
            if (!isNullorEmpty(run_string)) {
                run_array = run_string.split(',');
            }
            
            var optimize_string = context.request.parameters.optimize;
            if (!isNullorEmpty(optimize_string)) {
                optimize_array = optimize_string.split(',');
            }

            
            for (i = 0; i < zee_array.length; i++) { //create all the arrays with same size as the zee array
                if (isNullorEmpty(op_array[i])) {
                    op_array[i] = 0;
                }
                if (isNullorEmpty(run_array[i])) {
                    run_array[i] = 0;
                } else if (run_array[i] != 0 && run_array[i] != 'no_run') {
                    run_record = record.load({
                        type: 'customrecord_run_plan',
                        id: parseInt(run_array[i]),
                    });
                    
                    op_array[i] = run_record.getValue({
                        fieldId: 'custrecord_run_operator'
                    });
                }
               
                if (isNullorEmpty(optimize_array[i])) {
                    optimize_array[i] = false;
                }
            }
            log.debug({
                title: 'zee_array',
                details: zee_array
            });
            log.debug({
                title: 'zee_array.length',
                details: zee_array.length
            });

            log.debug({
                title: 'day',
                details: day
            });

            log.debug({
                title: 'op_array',
                details: op_array
            });

            log.debug({
                title: 'run_array',
                details: run_array
            });

            log.debug({
                title: 'before_time',
                details: before_time
            });

            log.debug({
                title: 'after_time',
                details: after_time
            });

            log.debug({
                title: 'optimize_array',
                details: optimize_array
            });

            var form = ui.createForm({
                title: 'Your Franchise Service Network'
            });

            var inlineQty = '<meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><script src="//api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><link href="https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&mv=j11m';
            inlineQty += '86u8&_xt=.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA92XGDo8rx11izPYT7z2L-YPMMJ6Ih1s0&callback=initMap&libraries=places"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/OverlappingMarkerSpiderfier/1.0.3/oms.min.js"></script></script><link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.2.0/dist/leaflet.js"></script>';
            inlineQty += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css"><script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';
            inlineQty += '<style>.info {padding: 6px 8px;font: 14px/16px Arial, Helvetica, sans-serif;background: white;background: rgba(255,255,255,0.8);box-shadow: 0 0 15px rgba(0,0,0,0.2);border-radius: 5px;}.info h5 { margin: 0 0 5px;color: #777;}.table {border-radius: 5px;width: 50%;margin: 0px auto;float: none;} #loader {position: absolute;top: 0;bottom: 0;width: 100%;background-color: rgba(245, 245, 245, 0.7);z-index: 200; }#loader img {width: 66px;height: 66px;position: absolute;top: 50%;left: 50%;margin: -33px 0 0 -33px;}</style>';

            inlineQty += '<div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true"><div class="modal-dialog modal-sm" role="document" style="width :max-content"><div class="modal-content" style="width :max-content; max-width: 900px"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title panel panel-info" id="exampleModalLabel">Run Summary</h4><br> </div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';

            inlineQty += '<div class="se-pre-con"></div><button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo" style="margin-top: 10px;">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
            inlineQty += '<ul><li><input type="button" class="btn btn-xs btn-success" id="apply" value="APPLY" disabled/> - <ul><li>Click to apply the details : day, run, time.</li></ul></li>';
            inlineQty += '</ul></div>';

            inlineQty += '<div class="container" id="main_container" style="padding-top: 3%;"><div class="container row_parameters">';
            
            //SELECT FRANCHISEE
            if (role != 1000) {
                inlineQty += '<div class="form-group row"><div class="col-sm-10"><div class="input-group"><span class="input-group-addon">SELECT ZEE</span><select class="form-control zee_dropdown selectpicker" multiple data-actions-box="false" data-max-options="5">';

                var searched_zee = search.load({
                    id: 'customsearch_job_inv_process_zee',
                    type: 'partner'
                });
                
                var resultSet_zee = searched_zee.run();
                var count_zee = 0;

                inlineQty += '<option value="' + 0 + '"></option>'

                resultSet_zee.each(function(searchResult_zee) {

                    zeeid = searchResult_zee.getValue('internalid');
                    zee_name = searchResult_zee.getValue('entityid');

                    if (isInArray(zeeid, zee_array)) {
                        inlineQty += '<option value="' + zeeid + '" selected="selected">' + zee_name + '</option>';
                        zee_text_array[zee_array.indexOf(zeeid)] = zee_name;

                    } else {
                        inlineQty += '<option value="' + zeeid + '">' + zee_name + '</option>';
                    }
                    return true;
                });

                inlineQty += '</select></div></div>';
                inlineQty += '<div class="col-sm-2"><input type="button" class="btn btn-primary" id="applyZee" value="APPLY ZEE" style="width: 100%;"/></div>';

                inlineQty += '</div>';
            } else { //FRANCHISEE LOG IN
                var zee_record = record.load({
                    type: record.Type.PARTNER,
                    id: zee_array[0],
                });
                
                zee_text_array[0] = zee_record.getValue({
                    fieldId: 'companyname'
                });
                
            }       

            if (zee_array.length != 0) {
                inlineQty += '</br>';
                inlineQty += '</br>';
                inlineQty += '<div class="form-group row">';
                inlineQty += '<div class="col-sm-12 heading1"><h4><span class="label label-default col-sm-12">RUN DETAILS</span></h4></div>';
                inlineQty += '</div>';
                inlineQty += '<div class="form-group row">';
                
                //SELECT DAY - today by default
                var day_name = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                inlineQty += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon">SELECT DAY</span><select class="form-control day_dropdown" id="day_dropdown">';
                for (i = 1; i < 6; i++) { //from Monday to Friday
                    if (i == day) {
                        inlineQty += '<option value="' + i + '" selected="selected">' + day_name[i] + '</option>';
                        var day_text = day_name[i];
                    } else {
                        inlineQty += '<option value="' + i + '">' + day_name[i] + '</option>';
                    }
                }
                inlineQty += '</select></div></div>';

                //SELECT TIME
                if (!isNullorEmpty(before_time)) {
                    before_time = convertTo24Hour(before_time);
                }
                if (!isNullorEmpty(after_time)) {
                    after_time = convertTo24Hour(after_time);
                }

                inlineQty += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon">BEFORE</span><input id="before_time" class="form-control before_time" type="time" value="' + before_time + '"/>';
                inlineQty += '</div></div>';
                inlineQty += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon">AFTER</span><input id="after_time" class="form-control after_time" type="time" value="' + after_time + '"/>';
                inlineQty += '</div></div>';

                inlineQty += '</div>';

                inlineQty += '<div class="form-group row">';
                inlineQty += '<div class="tabs" ><ul class="nav nav-tabs nav-justified" style="padding-top: 3%; margin-left: 0px">';
                var tab_content = '';
                var no_data_html = '';
                for (k = 0; k < zee_array.length; k++) {
                    if (k == 0) {
                        var active_class = 'active';
                        var backgroundcolor = 'rgb(50, 122, 183)';
                        var color = 'white';
                    } else {
                        var active_class = '';
                        var backgroundcolor = 'white';
                        var color = 'rgb(50, 122, 183)';
                    }
                    inlineQty += '<li role="presentation" class="' + active_class + '"><a href="#' + zee_array[k] + '" data-freq="" style="background-color:' + backgroundcolor + '; color: ' + color + ';"><b>' + zee_text_array[k] + '</b></a></li>';

                    tab_content += '<div role="tabpanel" class="tab-pane ' + active_class + '" id="' + zee_array[k] + '">';

                    tab_content += '<div class="form-group row">';
                    //SELECT OPERATOR
                    tab_content += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon">SELECT OPERATOR</span><select class="form-control op_dropdown" id="op_dropdown_' + zee_array[k] + '" data-zeeid="' + zee_array[k] + '">';
                    var operatorSearch = search.load({
                        id: 'customsearch_rta_operator_load',
                        type: 'customrecord_operator'
                    });

                    operatorSearch.filters.push(search.createFilter({
						name: 'custrecord_operator_franchisee',
						operator: search.Operator.ANYOF,
						values: zee_array[k]
                    }));
                    
                    var operatorSet = operatorSearch.run();
                    tab_content += '<option value="' + 0 + '">ALL</option>';

                    operatorSet.each(function(operatorResult) {
                        
                        var operator_id = operatorResult.getValue({
                            name: 'internalid',
                            summary: search.Summary.GROUP,
                        });
                        
                        var operator_name = operatorResult.getValue({
                            name: 'name',
                            summary: search.Summary.GROUP,
                        });
                        if (op_array[k] == operator_id) {
                            tab_content += '<option value="' + operator_id + '" selected="selected">' + operator_name + '</option>';
                            op_text_array[op_text_array.length] = operator_name;
                        } else {
                            tab_content += '<option value="' + operator_id + '">' + operator_name + '</option>';
                        }
                        return true;
                    });
                    tab_content += '</select></div></div>';

                    //SELECT RUN
                    tab_content += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon">SELECT RUN</span><select class="form-control run_dropdown" id="run_dropdown_' + zee_array[k] + '" data-zeeid="' + zee_array[k] + '">';
                    var runPlanSearch = search.load({
                        id: 'customsearch_app_run_plan_active',
                        type: 'customrecord_run_plan'
                    });
                    
                    runPlanSearch.filters.push(search.createFilter({
						name: 'custrecord_run_franchisee',
						operator: search.Operator.ANYOF,
						values: zee_array[k]
                    }));
                   
                    var resultSet_runPlan = runPlanSearch.run();

                    tab_content += '<option id="no_run" value="no_run" data-op=""></option>';
                    tab_content += '<option id="0" value="' + 0 + '" data-op="">ALL</option>';
                    resultSet_runPlan.each(function(searchResult_runPlan) {
                        runinternalid = searchResult_runPlan.getValue('internalid');
                        runname = searchResult_runPlan.getValue('name');
                        run_op = searchResult_runPlan.getValue('custrecord_run_operator');
                        if (run_array[k] == runinternalid) {
                            tab_content += '<option id="' + runinternalid + '" value="' + runinternalid + '" selected="selected" data-op="' + run_op + '">' + runname + '</option>';
                            run_text_array[run_text_array.length] = runname;
                        } else {
                            tab_content += '<option id="' + runinternalid + '" value="' + runinternalid + '" data-op="' + run_op + '">' + runname + '</option>';
                        }
                        return true;
                    });
                    tab_content += '</select></div></div>';

                    //OPTIMIZE RUN
                    if (optimize_array[k] == 'true') {
                        tab_content += '<div class="col-sm-4"><div class="input-group"><input type="text" readonly value="Run Optmised" class="form-control input-group-addon"/> <span class="input-group-addon"><input class="optimize" type="checkbox" id="optimize_' + zee_array[k] + '" checked/></span></div></div>';
                    } else {
                        tab_content += '<div class="col-sm-4"><div class="input-group"><input type="text" readonly value="Run Optimised" class="form-control input-group-addon"/> <span class="input-group-addon"><input class="optimize" type="checkbox" id="optimize_' + zee_array[k] + '"/></span></div></div>';
                    }

                    tab_content += '</div>';

                    tab_content += '</br>';
                    tab_content += '<div class="form-group row row_time hide">';
                    tab_content += '<div class="col-xs-3 firststop"><div class="input-group"><span class="input-group-addon">START</span><input id="firststop_' + zee_array[k] + '" class="form-control" readonly/></div></div>';
                    tab_content += '<div class="col-xs-3 laststop"><div class="input-group"><span class="input-group-addon">END</span><input id="laststop_' + zee_array[k] + '" class="form-control" readonly/></div></div>';
                    tab_content += '<div class="col-xs-3 travelling_time"><div class="input-group"><span class="input-group-addon">TRAVELLING TIME</span><input id="travelling_time_' + zee_array[k] + '" class="form-control" readonly/></div></div>';
                    tab_content += '<div class="col-xs-3 travelling_distance"><div class="input-group"><span class="input-group-addon">DISTANCE</span><input id="travelling_distance_' + zee_array[k] + '" class="form-control" readonly/></div></div>';

                    tab_content += '</div>';
                    tab_content += '</div>';

                    //RUN NOT SCHEDULED HTML

                    no_data_html += '<div class="container run_not_scheduled hide" id="run_not_scheduled_' + zee_array[k] + '">'
                    no_data_html += '<h3 style="text-align: center;">' + zee_text_array[k] + ' - This run is not scheduled. Please use the <a href=' + nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar', 'customdeploy_sl_full_calender') + '&zee=' + zee_array[k] + '>Run Scheduler</a> to set it up.</h3>';
                    no_data_html += '</div>';
                    //OPERATOR NOT ASSIGNED TO ANY RUN HTML
                    no_data_html += '<div class="container op_not_assigned hide" id="op_not_assigned_' + zee_array[k] + '">'
                    no_data_html += '<h3 style="text-align: center;">' + zee_text_array[k] + ' - This operator is not assigned to any run. Please use the <a href=' + nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar', 'customdeploy_sl_full_calender') + '&zee=' + zee_array[k] + '>Run Scheduler</a> to set it up.</h3>';
                    no_data_html += '</div>';
                }



                inlineQty += '</ul>';
                inlineQty += '<div class="tab-content" style="padding-top: 3%;">';
                inlineQty += tab_content;
                inlineQty += '</div></div>';
                inlineQty += '</div>';

                //APPLY BUTTON
                inlineQty += '<div class="form-group row">';
                inlineQty += '<div class="col-xs-5"></div>';
                inlineQty += '<div class="col-sm-2"><input type="button" class="btn btn-primary" id="apply" value="APPLY" style="width: 100%;"/></div>';
                inlineQty += '</div>';
                inlineQty += '</div>';

                inlineQty += no_data_html;


            }

            //SEARCH FOR AN ADDRESS
            inlineQty += '<div class="container row_address">'
            inlineQty += '<div class="form-group row">';
            inlineQty += '<div class="col-sm-12 heading1"><h4><span class="label label-default col-sm-12">SEARCH FOR A PLACE</span></h4></div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group row">';
            inlineQty += '<div class="col-xs-8"><div class="input-group"><span class="input-group-addon">STREET NO. & NAME</span><input id="address" class="form-control address" /></div></div>';

            inlineQty += '</div>';

            inlineQty += '<div class="form-group row">';
            inlineQty += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">CITY</span><input id="city" readonly class="form-control city" /></div></div>';
            inlineQty += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">STATE</span><input id="state" readonly class="form-control state" /></div></div>';
            inlineQty += '<div class="col-xs-2 post_code_section"><div class="input-group"><span class="input-group-addon">POSTCODE</span><input id="postcode" readonly class="form-control postcode" /></div></div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group row">';
            inlineQty += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">LAT</span><input id="lat" readonly class="form-control lat" /></div></div>';
            inlineQty += '<div class="col-xs-3"><div class="input-group"><span class="input-group-addon">LNG</span><input id="lng" readonly class="form-control lng" /></div></div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group row">';
            inlineQty += '<div class="col-xs-4"><div class="input-group"><span class="input-group-addon">TERRITORY</span><input id="territory" readonly class="form-control territory" /></div></div>';
            inlineQty += '</div>';

            inlineQty += '</br>';

            inlineQty += '<div class="form-group row">';
            inlineQty += '<div class="col-xs-3"></div>';
            inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-warning" id="clearMarkers" value="CLEAR MARKERS" style="width: 100%;"/></div>';
            inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-primary" id="viewOnMap" value="VIEW ON MAP" style="width: 100%;"/></div>';
            if (role != 1000) {
                inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-danger" id="territoryMap" value="HIDE TERRITORY MAP" style="width: 100%;"/></div>';
            }
            inlineQty += '<div class="col-xs-2"><input type="button" class="btn btn-danger hide" id="runMarkers" value="HIDE RUN MARKERS" style="width: 100%;"/></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';
    
            //MAP
            var directionsPanel_html = '';
            var print_section = '';
            if (zee_array.length == 1) { //show the directionsPanel only if one zee selected
                directionsPanel_html += '<div class="col-sm-6 hide" id="directionsPanel" style="height:500px; overflow:auto"></div>';
                print_section += '</br><div class="row print_section hide"><div class="col-xs-10"></div><div class="col-xs-2"><input type="button" class="btn btn-info" id="printDirections" value="PRINT DIRECTIONS" style="width: 100%;"/></div></div></div>';
            }
            inlineQty += '</br>';
            inlineQty += '<div class="container map_section hide"><div class="row">';
            inlineQty += '<div class="col-sm-12" id="map" style="height: 500px"><div id="loader"><img src="https://1048144.app.netsuite.com/core/media/media.nl?id=2089999&c=1048144&h=e0aef405c22b65dfe546" alt="loader" /></div></div>';
            inlineQty += '<div id="legend">';
            inlineQty += '<div class="hide legend_icons" style="background-color: rgb(255, 255, 255);box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;border-radius: 2px;left: 0px;margin-left: 5px;padding: 3px;"><div><svg height="23" width="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="black" fill="#575756"/></svg><span style="font-family: sans-serif;">Non Customer Location</span></div><div><svg height="23" width="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="black" fill="#008675"/></svg><span style="font-family: sans-serif;">Customer Location</span></div>';
            for (i = 0; i < zee_array.length; i++) {
                inlineQty += '<div><svg height="15" width="32"><line x1="2" y1="10" x2="25" y2="10" style="stroke:' + color_array[i] + ';stroke-width:2" /></svg><span style="font-family: sans-serif;">' + zee_text_array[i] + '</span></div>';
            }
            inlineQty += '</div>';
            inlineQty += '<div style="background-color: rgb(255, 255, 255);box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;border-radius: 2px;left: 0px;margin-left: 5px;padding: 3px;"><input class="form-control" type="textarea" placeholder="Territory" id="zee_territory"/></div>';
            inlineQty += '</div>';

            inlineQty += directionsPanel_html;
            inlineQty += '</div>';
            inlineQty += print_section;

            inlineQty += '</div>'; //close main container

            form.addField({
                id: 'zee',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zee_array.join(',');


            form.addField({
                id: 'zee_text',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zee_text_array.join(',');

            form.addField({
                id: 'day',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = day;

            form.addField({
                id: 'day_text',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = day_text;

            form.addField({
                id: 'op',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = op_array.join(',');

            form.addField({
                id: 'op_text',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = op_text_array.join(',');

            form.addField({
                id: 'run',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = run_array.join(',');

            form.addField({
                id: 'run_text',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = run_text_array.join(',');

            form.addField({
                id: 'beforetime',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = before_time;
            
            form.addField({
                id: 'aftertime',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = after_time;

            form.addField({
                id: 'optimisation',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = optimize_array.join(',');

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlineQty;


            form.clientScriptFileId = 4597783; //PROD = 4597783, SB = 
            
            //form.addSubmitButton('Submit');
            log.debug({
                title: 'zee_array',
                details: zee_array
            });

            log.debug({
                title: 'zee_array.length',
                details: zee_array.length
            });

            if (role == 1000) { //Franchisee
                form.addButton({
                    id : 'run_scheduler',
                    label : 'Run Scheduler',
                    functionName : 'onclick_runScheduler(' + zee_array[0] + ')'
                });

                form.addButton({
                    id : 'smc',
                    label : 'Service Management Console',
                    functionName : 'onclick_smc(' + zee_array[0] + ')'
                });
            }
            
            context.response.writePage(form);


        } else {

        }
    }

    function getDay() {
        var date = new Date();
        if (date.getHours() > 6) {
            date.setDate(date.getDate() + 1); 
        }
        var day = date.getDay();
    
        return day;
    }

    function convertTo24Hour(time) {
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
    
    function isInArray(elem, array) {
        var boolean = false;
        for (i = 0; i < array.length; i++) {
            if (array[i] == elem) {
                boolean = true;
                break;
            }
        }
        return boolean
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }
    
    return {
        onRequest: onRequest
    };

});