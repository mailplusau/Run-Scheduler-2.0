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
        var map;
        /**
         * On page initialisation
         */
        function pageInit() {
            jQuery();
        }

        function jQuery() {
            $(document).on('click', '#try', function(event) {
                console.time('getTerritory');
                var lat = parseFloat($('#lat').val());
                var lng = parseFloat($('#lng').val());
                console.log('lat', lat);
                console.log('lng', lng);
    
                var territory = 'not assigned';
    
                $.getJSON("https://1048144.app.netsuite.com/core/media/media.nl?id=3772482&c=1048144&h=4579935b386159057056&_xt=.js", function(data) {
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
    
            });
        }
        
        


        function inside(point, vs) {
            // ray-casting algorithm based on
            // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        
            var x = point[0],
                y = point[1];
            var inside = false;
            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                var xi = vs[i][0],
                    yi = vs[i][1];
                var xj = vs[j][0],
                    yj = vs[j][1];
        
                var intersect = ((yi > y) != (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
        
            return inside;
        };

        function saveRecord(context) {

            return true;
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