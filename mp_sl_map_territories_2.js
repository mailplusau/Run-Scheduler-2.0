/**
 * 
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Description: 
 * @Last Modified by: Sruti Desai
 * 
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
        zee = runtime.getCurrentUser();
    } else if (role == 3) { //Administrator
        zee = 0; //test
    } else if (role == 1032) { // System Support
        zee = 6; //test-AR
    }

    function onRequest(context) {  
        
        if (context.request.method === 'GET') {
            var form = ui.createForm({
                title: 'Map Territories'
            });

            var inlineQty = '<meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><script src="fm.selectator.jquery.js"></script><script src="//api.tiles.mapbox.com/mapbox.js/plugins/leaflet-omnivore/v0.3.1/leaflet-omnivore.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><link href="https://1048144.app.netsuite.com/core/media/media.nl?id=1988776&c=1048144&h=58352d0b4544df20b40f&mv=j11m86u8&_xt=.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><script sr';
            inlineQty += 'c="https://maps.googleapis.com/maps/api/js?key=AIzaSyA92XGDo8rx11izPYT7z2L-YPMMJ6Ih1s0&callback=initMap&libraries=places"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/OverlappingMarkerSpiderfier/1.0.3/oms.min.js"></script></script><link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.2.0/dist/leaflet.js"></script><style>.info {padding: 6px 8px;font: 14px/16px Arial, Helvetica, sans-serif;background: white;background: rgba(255,255,255,0.8);box-shadow: 0 0 15px rgba(0,0,0,0.2);border-radius: 5px;}.info h5 { margin: 0 0 5px;color: #777;}.table {border-radius: 5px;width: 50%;margin: 0px auto;float: none;} #loader {position: absolute;top: 0;bottom: 0;width: 100%;background-color: rgba(245, 245, 245, 0.7);z-index: 200; }#loader img {width: 66px;height: 66px;position: absolute;top: 50%;left: 50%;margin: -33px 0 0 -33px;}</style>';

            inlineQty += '<div class="container" id="main_container" style="padding-top: 3%;">';
            inlineQty += '<div class="form-group row">';
            inlineQty += '<div class="col-sm-3"><div class="input-group"><span class="input-group-addon">LAT</span><input class="form-control" id="lat" type="textarea"></div></div>';
            inlineQty += '<div class="col-sm-3"><div class="input-group"><span class="input-group-addon">LNG</span><input class="form-control" id="lng" type="textarea"></div></div>';
            inlineQty += '<div class="col-sm-3"><input class="form-control btn btn-primary" id="try" type="button" value="TRY"></div>';
            inlineQty += '<div class="col-sm-3"><div class="input-group"><span class="input-group-addon">TERRITORY</span><input class="form-control" id="territory" type="textarea" disabled></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlineQty;

            form.clientScriptFileId = 4597375; // PROD = 4597375, SB = 
            context.response.writePage(form);

        } else {

        }
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }
    
    return {
        onRequest: onRequest
    };

});