var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var map;

function pageInit() {}

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
            //console.log('polygon_array' + territories[k].properties.Territory + '', polygon_array);
            //console.log('polygon_array.length' + territories[k].properties.Territory + '', polygon_array.length);
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
        //console.log('time', Date.now() - start);
        /*        var territory = territories[0];
                console.log('territory', territory);
                var vs = territory.geometry.coordinates[0];
                console.log('vs', vs);
                var isInTerritory = inside([lng, lat], vs);
                console.log('isInTerritory', isInTerritory);*/
    });


    /*    var position = {
            latLng: new google.maps.LatLng(lat, lng)
        };
        console.log('position', position);
        google.maps.event.trigger(map.data, 'mouseover');
        console.log('done');*/
});

function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0],
        y = point[1];
    //console.log('x', x);
    //console.log('y', y);
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
/*        console.log('i', i);
        console.log('j', j);*/
        var xi = vs[i][0],
            yi = vs[i][1];
        var xj = vs[j][0],
            yj = vs[j][1];

/*        console.log('xi', xi);
        console.log('yi', yi);
        console.log('xj', xj);
        console.log('yj', yj);*/

        var intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};