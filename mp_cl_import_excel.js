 /**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: Import an excel file of stops to add into an existing run
 * @Last Modified by: Sruti Desai
 * 
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
function(error, runtime, search, url, record, format, email, currentRecord ) {
    var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var role = runtime.getCurrentUser().role;

        var load_record_interval;
        var tableSet = [];

        /**
         * On page initialisation
         */
        function pageInit() {
            
            var dataTable = $('#import_excel').DataTable({
                data: tableSet,
                columns: [
                    { title: 'Customer ID'}, //0
                    { title: 'Customer Name'}, //1
                    { title: 'Service ID'}, // 2
                    { title: 'Service Name'}, // 3 
                    { title: 'Price'}, // 4
                    { title: 'Frequency'}, // 5
                    { title: 'PO Box #1'}, // 6
                    { title: 'Stop 1 Location Type'}, // 7 
                    { title: 'Stop 1 Location'}, // 8
                    { title: 'Stop 1 Duration'}, // 9
                    { title: 'Stop 1 Time'}, // 10
                    { title: 'Stop 1 Tranfer'}, // 11
                    { title: 'Notes'}, // 12
                    { title: 'PO Box #2'}, // 13
                    { title: 'Stop 2 Location Type'}, // 14 
                    { title: 'Stop 2 Location'}, // 15
                    { title: 'Stop 2 Duration'}, // 16
                    { title: 'Stop 2 Time'}, // 17
                    { title: 'Stop 2 Tranfer'}, // 18
                    { title: 'Notes'}, // 19
                    { title: 'Driver Name'}, // 20
                    { title: 'Run Name'} // 21
                ],
                columnDefs: [{
                        targets: [0],
                        className: 'bolded'
                    },
                    {
                        targets: [-1, 2, 7, 11, 18],
                        visible: false,
                        searchable: false
                    }
                ]
            });

            var currentScript = currentRecord.get();            
            var ss_id = currentScript.getValue({fieldId: 'scheduled_script'});
            if (!isNullorEmpty(ss_id)) {
                sleep(ss_id);
            }
            
            

            //loadImportRecord();
            //load_record_interval = setInterval(loadImportRecord, 2000);

            $(document).on('change', '.zee_dropdown', function(event) {
                var zee = $(this).val();
                var zee_text = $(this).text();
                var currentScript = currentRecord.get();            

                //createCSV(zee);
                var url = "https://1048144-sb3.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1140&deploy=1";
                url += "&zee=" + zee + "";
                window.location.href = url;

                currentScript.setValue({
                    fieldId: 'zee',
                    value: zee
                });  

               
            });

            $(document).on('change', '.run_dropdown', function(event) {
                var run = $(this).val();
                console.log(run);
                var zee = $('option:selected', '.zee_dropdown').val();
                var currentScript = currentRecord.get();
                  
                var url = "https://1048144-sb3.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1140&deploy=1";
            
                url += "&zee=" + zee + "&run=" + run;
            
                window.location.href = url;
                currentScript.setValue({
                    fieldId: 'zee',
                    value: zee
                });   
                currentScript.setValue({
                    fieldId: 'run',
                    value: run
                }); 
            });


        }


        function sleep(ss_id) {
            
            var currentScript = currentRecord.get();
            var excel_lines = currentScript.getValue({fieldId: 'excel_lines'});
            var importSearch = search.load({
                type: 'customrecord_import_excel',
                id: 'customsearch_import_excel_table_2'
            });
            // var res = importSearch.run();
            //var search_count = importSearch.runPaged().count;
            //var search_count = res._getResultset.list.length;
            
            console.log("excel_lines", Math.floor(excel_lines)); 
            //loadImportRecord();
            var search_count = importSearch.runPaged().count;
            console.log("search_count", search_count);
            
            // var ssStatus = task.checkStatus({
            //     taskId: ss_id
            // });

            //console.log(ssStatus); //Failed, Pending

            progressBar(search_count, excel_lines);
            if (Math.floor(excel_lines) == search_count) {
                loadImportRecord();
            } else {
                currentScript.getValue({fieldId: 'scheduled_script'})
                setTimeout(sleep, 15000);
            }
                
            
        }

        function progressBar(search_count, excel_lines) {
            var percentage = (search_count/excel_lines)*100;
            var roundedPercent = Math.round(percentage * 10) / 10;
            var elem = document.getElementById("progress-records");   
            elem.style.width = roundedPercent + '%'; 
            elem.innerHTML = roundedPercent * 1  + '%';

            

          }

        function saveRecord(context) {

            return true;
        }

        function loadImportRecord(){
            var tableSet = [];

            console.log("test");
            var importSearch = search.load({
                type: 'customrecord_import_excel',
                id: 'customsearch_import_excel_table_2'
            });
            var id = 0;
            var res2 = importSearch.run();
            // console.log("tt", res2.length);
            // console.log("ttt", res2.getRange.length);
            //console.log("tttt", res2.__proto__.getRange.length);
            console.log("abc", res2);
            console.log("sdsd", res2._getResultset.list.length);


            res2.each(function (res){
                var id = res.getValue({name: 'internalid' });
                console.log(id);
                var custId = res.getValue('custrecord_import_excel_custid');
                id = custId;
                var companyName = res.getValue('custrecord_import_excel_company');
                var service_id = res.getValue({
                    name: 'custrecord_import_excel_service_id'
                });
                var service_name = res.getValue({
                    name: 'custrecord_import_excel_service_name'
                });
                var price = res.getValue({
                    name: 'custrecord_import_excel_price'
                });
                var frequency = res.getValue({
                    name: 'custrecord_import_excel_freq'
                });
                var poBox1 = res.getValue({
                    name: 'custrecord_import_excel_po_box1'
                });
                var poBox2 = res.getValue({
                    name: 'custrecord_import_excel_po_box2'
                });
                var stop1_location_type = res.getValue({
                    name: 'custrecord_import_excel_stop1_type'
                });
                var stop1_location = res.getValue({
                    name: 'custrecord_import_excel_stop1_location'
                });
                var stop1_time = res.getValue({
                    name: 'custrecord_import_excel_stop1_time'
                });
                var stop1_duration = res.getValue({
                    name: 'custrecord_import_excel_stop1_duration'
                });
                var stop1_notes = res.getValue({
                    name: 'custrecord_import_excel_stop1_notes'
                });
                var stop2_location_type = res.getValue({
                    name: 'custrecord_import_excel_stop2_type'
                });
                var stop2_location = res.getValue({
                    name: 'custrecord_import_excel_stop2_location'
                });
                var stop2_time = res.getValue({
                    name: 'custrecord_import_excel_stop2_time'
                });
                var stop2_duration = res.getValue({
                    name: 'custrecord_import_excel_stop2_duration'
                });
                var stop2_notes = res.getValue({
                    name: 'custrecord_import_excel_stop2_notes'
                });
                var driver = res.getValue({
                    name: 'custrecord_import_excel_driver'
                });
                var run_name = res.getValue({
                    name: 'custrecord_import_excel_run_name'
                });
                var stop1_transfer = res.getValue({
                    name: 'custrecord_import_excel_stop1_transfer'
                });
                var stop2_transfer = res.getValue({
                    name: 'custrecord_import_excel_stop2_transfer'
                });
                tableSet.push([custId, companyName, service_id, service_name, price, frequency,  poBox1, stop1_location_type,stop1_location, stop1_time, stop1_duration, stop1_notes, stop1_transfer, poBox2, stop2_location_type, stop2_location, stop2_time, stop2_duration, stop2_transfer, stop2_notes, driver, run_name])

                console.log(companyName);
                return true;
            });


            console.log("tableset", tableSet);
            var datatable = $('#import_excel').DataTable();
            datatable.clear();
            datatable.rows.add(tableSet);
            datatable.draw();
            
        }

        function onclick_downloadButton() {
            var currentScript = currentRecord.get();
            var zee = currentScript.getValue({
                fieldId: 'zee',
            });


            if (zee == 0 && role != 1000) {
                alert('Please Select a Zee before downloading a template');
            } else {
                alert('Please wait while your template for ' + zee + ' is being downloaded');

                var sep = "sep=;";
                var headers = ["Customer Internal ID", "Customer ID", "Customer Name", "Service ID", "Service Name", "Price", "Frequency", "Stop 1: Customer or Non-Customer Location", "PO Box# or DX#", "Stop 1 Location", "Stop 1 Duration", "Stop 1 Time", "Stop 1 Transfer", "Notes", "Stop 2: Customer or Non-Customer Location", "PO Box# or DX#", "Stop 2 Location", "Stop 2 Duration", "Stop 2 Time", "Stop 2 Transfer", "Notes", "Driver Name", "Run Name"]
                headers = headers.join(';');
                var csv = sep + "\n" + headers + "\n";

                var jsonSearch = search.load({
                    id: 'customsearch_export_run_json',
                    type: 'customrecord_export_run_json'
                });
    
                jsonSearch.filters.push(search.createFilter({
                    name: 'custrecord_export_run_franchisee',
                    operator: search.Operator.EQUALTO,
                    values: zee
                }));

                // jsonSearch.filters.push(search.createFilter({
                //     name: 'custrecord_export_run_template',
                //     operator: search.Operator.EQUALTO,
                //     values: true
                // }));

                console.log("test");
                var jsonSearchResults = jsonSearch.run();

                jsonSearchResults.each(function(searchResult) {
                    console.log("in");
                    console.log(searchResult.getValue({name: 'custrecord_export_run_template'}));
                    if (searchResult.getValue({name: 'custrecord_export_run_template'}) !== 'T') {
                        return true;
                    }
                    var run_json_info = JSON.parse(searchResult.getValue({name: 'custrecord_export_run_json_info'}));
                    for (i in run_json_info) {
                        var row = new Array();
                        row[0] = run_json_info[i].custInternalId;
                        row[1] = run_json_info[i].custId;
                        row[2] = run_json_info[i].custName;
                        row[3] = run_json_info[i].serviceId;
                        row[4] = run_json_info[i].serviceName;
                        row[5] = run_json_info[i].price;
                        row = row.join(';');
                        csv += row + "\n";
                    }
                    
                });
                
    
                console.log("finished");
                var val1 = currentRecord.get();
                val1.setValue({
                    fieldId: 'custpage_table_csv',
                    value: csv
                });

                downloadTemplate(zee);

                
            }  
        }

        function downloadTemplate(zeeVal) {
            var val1 = currentRecord.get();
            var csv = val1.getValue({
                fieldId: 'custpage_table_csv',
            });

            console.log(csv);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            var content_type = 'text/csv';
            var csvFile = new Blob([csv], { type: content_type });
            var url = window.URL.createObjectURL(csvFile);
            var filename = zeeVal + '_zee_template.csv';
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);

        }

        function onclick_deleteRun() {
            var currentScript = currentRecord.get();
            var zee_id = currentScript.getValue({ fieldId: 'zee'});   
            var run_id = currentScript.getValue({ fieldId: 'run'});
            if (zee_id == 0 && role != 1000) {
                alert('Please Select a Zee before downloading a template');
            } else if (isNullorEmpty(currentScript.getValue({fieldId: 'run'}))) {
                alert('Please select a run first');
            } 
            else {
                var freqSearch = search.load({
                    id: 'customsearch_rp_servicefreq',
                    type: 'customrecord_service_freq'
                });
    
                freqSearch.filters.push(search.createFilter({
                    name: 'custrecord_service_freq_run_plan',
                    operator: search.Operator.IS,
                    values: run_id
                }));
    
                var freqResults = freqSearch.run();
                
                freqResults.each(function(search_result) {
                    var freqLegId = search_result.getValue({name: 'internalid'});
                    var serviceLegId = search_result.getValue({name: 'custrecord_service_freq_stop'});
                    var record = 
                    record.delete({
                        type: 'customrecord_service_freq',
                        id: freqLegId
                    });
                    record.delete({
                        type: 'customrecord_service_leg',
                        id: serviceLegId
                    });
    
    
    
                });
                 
                record.delete({
                    type: 'customrecord_run_plan',
                    id: run_id
                }); 
    
                alert('Run ' + run_id + ' has successfully been deleted');
            }
            
        }

        function onclick_exportRun() {
            var currentScript = currentRecord.get();
            if(isNullorEmpty(currentScript.getValue({fieldId: 'zee'}))) {
                alert('Please select a zee first');
            } else if (isNullorEmpty(currentScript.getValue({fieldId: 'run'}))) {
                alert('Please select a run first');
            } else {
                var run_id = currentScript.getValue({fieldId: 'run'});
                alert('Please wait for the run ' + run_id + ' to download');
                var sep = "sep=;";
                var headers = ["Customer Internal ID", "Customer ID", "Customer Name", "Service ID", "Service Name", "Price", "Frequency", "Stop 1: Customer or Non-Customer Location", "PO Box# or DX#", "Stop 1 Location", "Stop 1 Duration", "Stop 1 Time", "Stop 1 Transfer", "Notes", "Stop 2: Customer or Non-Customer Location", "PO Box# or DX#", "Stop 2 Location", "Stop 2 Duration", "Stop 2 Time", "Stop 2 Transfer", "Notes", "Driver Name", "Run Name"]
                headers = headers.join(';');
                var csv = sep + "\n" + headers + "\n";

                var jsonSearch = search.load({
                    id: 'customsearch_export_run_json',
                    type: 'customrecord_export_run_json'
                });
    
                jsonSearch.filters.push(search.createFilter({
                    name: 'custrecord_export_run_id',
                    operator: search.Operator.EQUALTO,
                    values: run_id
                }));
                var jsonSearchResults = jsonSearch.run();

                jsonSearchResults.each(function(searchResult) {
                    var run_json_info = JSON.parse(searchResult.getValue({name: 'custrecord_export_run_json_info'}))
                    for (i in run_json_info) {
                        var row = new Array();
                        row[0] = run_json_info[i].custInternalId;
                        row[1] = run_json_info[i].custId;
                        row[2] = run_json_info[i].custName;
                        row[3] = run_json_info[i].serviceId;
                        row[4] = run_json_info[i].serviceName;
                        row[5] = run_json_info[i].price;
                        row[6] = run_json_info[i].freq;
                        row[7] = run_json_info[i].stop1LocationType;
                        row[8] = run_json_info[i].poBox1;
                        row[9] = run_json_info[i].stop1Location;
                        row[10] = run_json_info[i].stop1Duration;
                        row[11] = run_json_info[i].stop1Time;
                        row[12] = run_json_info[i].stop1Transfer;
                        row[13] = run_json_info[i].stop1Notes;
                        row[14] = run_json_info[i].stop2LocationType;
                        row[15] = run_json_info[i].poBox2;
                        row[16] = run_json_info[i].stop2Location;
                        row[17] = run_json_info[i].stop2Duration;
                        row[18] = run_json_info[i].stop2Time;
                        row[19] = run_json_info[i].stop2Transfer;
                        row[20] = run_json_info[i].stop2Notes;
                        row[21] = run_json_info[i].driverName;
                        row[22] = run_json_info[i].runName;

                        row = row.join(';');
                        csv += row + "\n";
                    }
                    
                });
                
    
                console.log("finished");
                var val1 = currentRecord.get();
                val1.setValue({
                    fieldId: 'custpage_export_run_csv',
                    value: csv
                });
                exportRunDownload();

            }
            
            


        }

        function exportRunDownload() {
            var val1 = currentRecord.get();
            var csv = val1.getValue({
                fieldId: 'custpage_export_run_csv',
            });
            var runVal = val1.getValue({
                fieldId: 'run',
            });
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            var content_type = 'text/csv';
            var csvFile = new Blob([csv], { type: content_type });
            var url = window.URL.createObjectURL(csvFile);
            var filename = runVal + '_run_export.csv';
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);

            console.log("finished2");

        }



        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }


        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            onclick_exportRun: onclick_exportRun,
            onclick_downloadButton: onclick_downloadButton,
            onclick_deleteRun: onclick_deleteRun
            
            
        };  
    }

    
);