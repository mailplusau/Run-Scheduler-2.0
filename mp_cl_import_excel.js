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
            //$('.progress').hide();
            
            
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
                        targets: [-1, 2, 7, 11, 14, 18, 20],
                        visible: false,
                        searchable: false
                    }
                ]
            });

            var currentScript = currentRecord.get();            
            var ss_id = currentScript.getValue({fieldId: 'scheduled_script'});
            if (!isNullorEmpty(ss_id)) {
                $('.progress').addClass('show');
                //var t0 = performance.now();
                setTimeout(function(){ move(); }, 1000);
                //var t1 = performance.now();
            }
            $(document).ready(function(){

                $("#del_run").click(function(){
                    console.log("test");
                    var currentScript = currentRecord.get();            
                    if(isNullorEmpty(currentScript.getValue({fieldId: 'zee'}))) {
                        alert('Please select a zee first');
                    } else if (isNullorEmpty(currentScript.getValue({fieldId: 'run'}))) {
                        alert('Please select a run first');
                    } else {
                        $('.progress').addClass('show');

                        alert('Please wait while run ' + currentScript.getValue({fieldId: 'run'}) + ' is being deleted');
                        setTimeout(function(){ deleteMove(); }, 1000);
                    }
                });
            });

            
            
            // $('.collapse').on('shown.bs.collapse', function() {
            //     $("#customer_wrapper").css("padding-top", "500px");
            //     $(".admin_section").css("padding-top","500px");

                
            // })
            
            // $('.collapse').on('hide.bs.collapse', function() {
            //     $("#customer_wrapper").css("padding-top", "0px");
            //     $(".admin_section").css("padding-top","0px");
            // })
        
            $(document).on('change', '.zee_dropdown', function(event) {
                var zee = $(this).val();
                var zee_text = $(this).text();
                var currentScript = currentRecord.get();            

                //prod = 1151, sb = 1140
                //var url = 'https://1048144-sb3.app.netsuite.com' + "/app/site/hosting/scriptlet.nl?script=1140&deploy=1";
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1151&deploy=1";

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
                //prod = 1151, sb = 1140

                //var url = 'https://1048144-sb3.app.netsuite.com' + "/app/site/hosting/scriptlet.nl?script=1140&deploy=1";
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1151&deploy=1";

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

        function deleteMove() {
            var currentScript = currentRecord.get();

            var freqSearch = search.load({
                id: 'customsearch_rp_servicefreq',
                type: 'customrecord_service_freq'
            });

            freqSearch.filters.push(search.createFilter({
                name: 'custrecord_service_freq_run_plan',
                operator: search.Operator.IS,
                values: currentScript.getValue({fieldId: 'run'})
            }));
            
            var initial_count = freqSearch.runPaged().count;
            console.log("initial", initial_count);
            var totalTime = initial_count*295;
            console.log("total", totalTime);
            var elem = document.getElementById("progress-records");
            var width = 0;
            var id = setInterval(frame, totalTime);
            function frame() {
                if (width >= 95) {
                    clearInterval(id);
                    deleteProgress(initial_count);
                    
                } else {
                    width++;
                    elem.style.width = width + "%";
                    elem.innerHTML = width + "%";
                }
            }
            
        }
        function deleteProgress(initial_count) {
            
            var currentScript = currentRecord.get();
            var run_id = currentScript.getValue({fieldId: 'run'});

            var freqSearch = search.load({
                id: 'customsearch_rp_servicefreq',
                type: 'customrecord_service_freq'
            });

            freqSearch.filters.push(search.createFilter({
                name: 'custrecord_service_freq_run_plan',
                operator: search.Operator.IS,
                values: run_id
            }));
            var initial_count = freqSearch.runPaged().count;
            console.log("initial_count", Math.floor(initial_count)); 
            var search_count = freqSearch.runPaged().count;
            console.log("search_count", search_count);

            if (search_count != 0) {
                setTimeout(deleteProgress, 10000);
            } else {
                $(".progress-bar").removeClass("progress-bar-warning");
                $(".progress-bar").addClass("progress-bar-success");
                progressBar2(search_count, initial_count);
            }
                
            
        }

        function progressBar2(search_count, initial_count) {
            console.log("in progress");
            if (search_count == 0) {
                console.log("finished");
                var percentage = (1/1)*100;
                var roundedPercent = Math.round(percentage * 10) / 10;
                var elem = document.getElementById("progress-records");   
                elem.style.width = roundedPercent + '%'; 
                elem.innerHTML = roundedPercent * 1  + '%';
            } else {
                console.log("in else");
                search_count = initial_count - search_count;
                var percentage = (search_count/initial_count)*100;
                console.log(percentage);
                var roundedPercent = Math.round(percentage * 10) / 10;
                var elem = document.getElementById("progress-records");   
                elem.style.width = roundedPercent + '%'; 
                elem.innerHTML = roundedPercent * 1  + '%';
            }

        }
        function move() {
            var currentScript = currentRecord.get();
            var excel_lines = currentScript.getValue({fieldId: 'excel_lines'});
            var totalTime = excel_lines*360;
            console.log("total time", totalTime);
            var elem = document.getElementById("progress-records");
            var width = 0;
            var id = setInterval(frame, totalTime);
            function frame() {
                if (width == 25 ) {
                    if (errorCheck()) {
                        console.log("error 25");

                        clearInterval(id);
                    } else {
                        console.log("error not 25");

                        width++;
                        elem.style.width = width + "%";
                        elem.innerHTML = width + "%";
                    }
                } else if (width == 50 ) {
                    if (errorCheck() === true) {
                        clearInterval(id);
                    } else {
                        width++;
                        elem.style.width = width + "%";
                        elem.innerHTML = width + "%";
                    }
                } else if (width == 75) {
                    if (errorCheck() === true) {
                        clearInterval(id);
                    } else {
                        width++;
                        elem.style.width = width + "%";
                        elem.innerHTML = width + "%";
                    }
                }
                else if (width >= 95) {
                    clearInterval(id);
                    if (errorCheck() === false) {
                        sleep();
                    } 
                    
                } else {
                    width++;
                    elem.style.width = width + "%";
                    elem.innerHTML = width + "%";
                }
            }
            
        }

        function errorCheck() {
            console.log("in error");

            var errorSearch = search.load({
                id: 'customsearch_excel_error',
                type: 'customrecord_excel_error'
            });
            var error_count = errorSearch.runPaged().count;
            if (error_count > 1) {
                console.log("in if");
                $(".progress-bar").removeClass("progress-bar-warning");
                $(".progress-bar").addClass("progress-bar-danger");
                var elem = document.getElementById("progress-records");
                elem.style.width = "100%";
                elem.innerHTML = "ERROR";

                loadImportRecord();
                var errorSearchRes = errorSearch.run();
                var errorMessage = "Your Import Excel File generated errors:\n";
                errorSearchRes.each(function (searchResult) {
                    errorMessage += searchResult.getValue({name: "custrecord_error_message"}) + "\n";
                    errorMessage += searchResult.getValue({name: "custrecord_suitescript_error"}) + "\n";
                });
                var index = 0;
                errorSearchRes.each(function (searchResult) {
                    if (index == 0) {
                        index++;
                        return true;
                    }
                    var internalid = searchResult.getValue({name: "id"});
                    record.delete({
                        type: 'customrecord_excel_error',
                        id: internalid
                    });
                    return true;
                });
                email.send({
                    author: runtime.getCurrentUser().id,
                    body: errorMessage,
                    recipients: runtime.getCurrentUser().email,
                    subject: "Import Excel Error"
                });
                alert(errorMessage + "\nPlease fix error and re import file");

                return true;
            } else {
                return false;
            }
            
        }

        function sleep() {
            var importSearch = search.load({
                type: 'customrecord_import_excel',
                id: 'customsearch_import_excel_table_2'
            });
            
            var currentScript = currentRecord.get();
            var excel_lines = currentScript.getValue({fieldId: 'excel_lines'});
            var search_count = importSearch.runPaged().count;
            
            console.log("excel_lines", Math.floor(excel_lines)); 
            console.log("search_count", search_count);

            if (Math.floor(excel_lines) == search_count) {
                $(".progress-bar").removeClass("progress-bar-warning");
                $(".progress-bar").addClass("progress-bar-success");
                progressBar(search_count, excel_lines);
                loadImportRecord();
            } else {
                if (errorCheck() === false ) {
                    setTimeout(sleep, 10000); 
                }
            }
                
        }

        function progressBar(search_count, excel_lines) {
            console.log("in progress");
            
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
                tableSet.push([custId, companyName, service_id, service_name, price, frequency,  poBox1, stop1_location_type,stop1_location, stop1_duration, stop1_time, stop1_transfer, stop1_notes, poBox2, stop2_location_type, stop2_location, stop2_duration, stop2_time, stop2_transfer, stop2_notes, driver, run_name])

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
                    operator: search.Operator.IS,
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
                    run_json_info.sort(sortByProperty());

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

        function sortByProperty(){  
            return function(a,b){  
               if((a.custName).toLowerCase() > (b.custName).toLowerCase())  
                  return 1;  
               else if((a.custName).toLowerCase() < (b.custName).toLowerCase())  
                  return -1;  
           
               return 0;  
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

        // function onclick_deleteRun() {
        //     var currentScript = currentRecord.get();
        //     var zee_id = currentScript.getValue({ fieldId: 'zee'});   
        //     var run_id = currentScript.getValue({ fieldId: 'run'});
        //     if (zee_id == 0 && role != 1000) {
        //         alert('Please Select a Zee before downloading a template');
        //     } else if (isNullorEmpty(currentScript.getValue({fieldId: 'run'}))) {
        //         alert('Please select a run first');
        //     } 
        //     else {
                
    
        //         alert('Run ' + run_id + ' has successfully been deleted');
        //     }
            
        // }

        function onclick_exportRun() {
            var currentScript = currentRecord.get();
            if(isNullorEmpty(currentScript.getValue({fieldId: 'zee'}))) {
                alert('Please select a zee first');
            } else if (isNullorEmpty(currentScript.getValue({fieldId: 'run'}))) {
                alert('Please select a run first');
            } else {
                var zee = currentScript.getValue({fieldId: 'zee'});
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
                    operator: search.Operator.IS,
                    values: run_id
                }));

                var jsonSearchResults = jsonSearch.run();

                jsonSearchResults.each(function(searchResult) {
                    if (searchResult.getValue({name: 'custrecord_export_run_template'}) === 'T') {
                        return true;
                    }
                    var run_json_info = JSON.parse(searchResult.getValue({name: 'custrecord_export_run_json_info'}))
                    run_json_info.sort(sortByProperty());
                    for (i in run_json_info) {
                        if (run_json_info[i].custFranchise != 0 && run_json_info[i].custFranchise != zee) {
                            continue;
                        }

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
            
            
        };  
    }

    
);