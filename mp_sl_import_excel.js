/**
 * 
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Description: Import an excel file of stops to add into an existing run
 * @Last Modified by: Sruti Desai
 * 
 */


define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format', 'N/file', 'N/error'], 
function(ui, email, runtime, search, record, http, log, redirect, format, file, error) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var zee = 0;
    var role = runtime.getCurrentUser().role;
    if (role == 1000) {
        //Franchisee
        zee = runtime.getCurrentUser();
    } 

    function onRequest(context) {  
        
        if (context.request.method === 'GET') {
            var form = ui.createForm({
                title: 'Import Excel'
            });
            form.addButton({
                id : 'import',
                label : 'IMPORT EXCEL',
                functionName : 'onclick_importButton()'
            });
            form.addField({
                id: 'upload_rs_csv',
                label: 'IMPORT EXCEL',
                type: ui.FieldType.FILE
            });

            
            form.addSubmitButton({
                label: 'Submit'
            });
            form.clientScriptFileId = 4620348; //PROD = 4620348, SB = ??

            context.response.writePage(form);


        } else {
            var fileObj = context.request.files.upload_rs_csv;

            if (!isNullorEmpty(fileObj)) {
                fileObj.folder = 2661964;
                var file_type = fileObj.fileType;
                if (file_type == 'CSV') {
                    file_type == 'txt';

                    var file_name = getDate() + '_' + 'testNSW' + '.' + file_type;
                } 
                fileObj.name = file_name;

                if (file_type == 'CSV') {
                    // Create file and upload it to the file cabinet.
                    var f_id = fileObj.save();
                } else {
                    throw error.create({
                        message: 'Must be in CSV format',
                        name: 'CSV_ERROR',
                        notifyOff: true
                    });
                }
            }
            //var file = nlapiLoadFile(id);
            var file1 = file.load({
                id: f_id
            });

            var iterator = file1.lines.iterator();

            // skip first line (header)
            iterator.each(function () {return false;});

            iterator.each(function (line) {
                var rs_values = line.value.split(',');
                var custId = rs_values[0];
                var companyName = rs_values[1];
                var service = rs_values[2];
                var price = rs_values[3];
                var frequency = rs_values[4];
                var poBox = rs_values[5];
                var stop1_location = rs_values[6];
                var stop1_time = rs_values[7];
                var stop2_location = rs_values[8];
                var stop2_time = rs_values[9];
                var notes = rs_values[10];
                var driver = rs_values[11];

                log.debug({
                    title: 'comp',
                    details: companyName
                })
                log.debug({
                    title: 'lineVals',
                    details: rs_values
                });
                return true;
            });

        }
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }
    
    function getDate() {
        var date = (new Date());
        // if (date.getHours() > 6) {
        //     date = nlapiAddDays(date, 1);

        // }
        // date.setHours(date.getHours() + 17);
        var date_string = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate() + '_' + date.getHours() + '' + date.getMinutes();

        return date_string;
    }

    return {
        onRequest: onRequest
    };

});