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
                createCSV(zee);
                downloadCsv(zee);

                
            }  
        }

        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         */
        function createCSV(zeeVal) {
            var sep = "sep=;";
            var headers = ["Customer Internal ID", "Customer ID", "Customer Name", "Service ID", "Service Name", "Price", "Frequency", "Stop 1: Customer or Non-Customer Location", "PO Box# or DX#", "Stop 1 Location", "Stop 1 Duration", "Stop 1 Time", "Stop 1 Transfer", "Notes", "Stop 2: Customer or Non-Customer Location", "PO Box# or DX#", "Stop 2 Location", "Stop 2 Duration", "Stop 2 Time", "Stop 2 Transfer", "Notes", "Driver Name", "Run Name"]
            headers = headers.join(';');
            //slice(0, headers.length); // .join(', ')

            var csv = sep + "\n" + headers + "\n";
            
            var serviceSearch = search.load({
                id: 'customsearch_rp_services',
                type: 'customrecord_service'
            });

            var defaultFilters = serviceSearch.filters;
            defaultFilters.push(search.createFilter({
                name: 'custrecord_service_franchisee',
                operator: search.Operator.ANYOF,
                values: zeeVal
            }));


            serviceSearch.filters = defaultFilters;
            var resultSetCustomer = serviceSearch.run();
            
            resultSetCustomer.each(function(searchResult) {
                var internal_custid = searchResult.getValue({ name: "custrecord_service_customer", join: null, summary: search.Summary.GROUP});

                var custRecord = record.load({type: record.Type.CUSTOMER, id: internal_custid })
                var custid = custRecord.getValue({ fieldId: 'entityid'});

                var companyname = searchResult.getValue({ name: "companyname", join: "CUSTRECORD_SERVICE_CUSTOMER", summary: search.Summary.GROUP});
                var service_id = searchResult.getValue({ name: "internalid", join: null, summary: search.Summary.GROUP});
                var service_name = searchResult.getText({ name: "custrecord_service", join: null, summary: search.Summary.GROUP});
                var service_price = searchResult.getValue({ name: "custrecord_service_price", join: null, summary: search.Summary.GROUP});
                
                var row = new Array();
                row[0] = internal_custid; row[1]= custid; row[2] = companyname; row[3] = service_id; row[4] = service_name; row[5] = service_price;
                csv += row.join(';');
                csv += "\n";
                return true;
            });

            var val1 = currentRecord.get();
            val1.setValue({
                fieldId: 'custpage_table_csv',
                value: csv
            });


            return true;
        }


        function downloadCsv(zeeVal) {
            var val1 = currentRecord.get();
            var csv = val1.getValue({
                fieldId: 'custpage_table_csv',
            });
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
            if (isNullorEmpty(currentScript.getValue({fieldId: 'run'}))) {
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

            }
            
            var freqSearch = search.load({
                id: 'customsearch_rp_servicefreq_excel_export',
                type: 'customrecord_service_freq'
            });

            freqSearch.filters.push(search.createFilter({
                name: 'custrecord_service_freq_run_plan',
                operator: search.Operator.IS,
                values: run_id
            }));

            var freqSearchResults = freqSearch.run();

            var freqSearch2 = search.load({
                id: 'customsearch_rp_servicefreq_excel_export',
                type: 'customrecord_service_freq'
            });

            freqSearch2.filters.push(search.createFilter({
                name: 'custrecord_service_freq_run_plan',
                operator: search.Operator.IS,
                values: run_id
            }));


            var freqIDs = [];
            freqSearchResults.each(function(searchResult) {
                var internalId = searchResult.getValue({name: 'internalid'});
                console.log("aa");
                if (freqIDs.includes(internalId)) {
                    console.log("continue");
                    return;
                }
                console.log("bb");
                freqIDs.push(internalId);
                

                var row = new Array();
                row[0] = searchResult.getValue({name: 'custrecord_service_freq_customer'});

                var custRecord = record.load({type: record.Type.CUSTOMER, id: row[0] })
                row[1]= custRecord.getValue({ fieldId: 'entityid'});

                row[2] = custRecord.getValue({ fieldId: 'companyname'});

                row[3] = searchResult.getValue({name: 'custrecord_service_freq_service'}); 
                var serviceRecord = record.load({type: 'customrecord_service', id: row[3] })

                row[4] = serviceRecord.getValue({fieldId: 'name'}); 

                row[5] = serviceRecord.getValue({fieldId: 'custrecord_service_price'});

                var mon = searchResult.getValue({name: 'custrecord_service_freq_day_mon'});
                var tue = searchResult.getValue({name: 'custrecord_service_freq_day_tue'});
                var wed = searchResult.getValue({name: 'custrecord_service_freq_day_wed'});
                var thurs = searchResult.getValue({name: 'custrecord_service_freq_day_thu'});
                var fri = searchResult.getValue({name: 'custrecord_service_freq_day_fri'});
                var adhoc = searchResult.getValue({name: 'custrecord_service_freq_day_adhoc'});


                if (mon === true && tue === true && wed === true && thurs === true && fri === true ) {
                    row[6] = "Daily";  
                } else if (adhoc === true ) {
                    row[6] = "Adhoc";
                } else {
                    var freqArr = [];
                    if (mon === true) {
                        freqArr.push("Mon"); 
                    }
                    if (tue === true) {
                        freqArr.push("Tue"); 
                    }
                    if (wed === true) {
                        freqArr.push("Wed"); 
                    }
                    if (thurs === true) {
                        freqArr.push("Thurs"); 
                    }
                    if (fri === true) {
                        freqArr.push("Fri"); 
                    }
                    var freqString = freqArr.join("/");
                    row[6] = freqString;
                }

                var stop1_id = searchResult.getValue({name: 'custrecord_service_freq_stop'});
                var stopRecord = record.load({type: 'customrecord_service_leg', id: stop1_id });
                var location_type = stopRecord.getValue({ fieldId: 'custrecord_service_leg_location_type'});
                if (location_type === 1) {
                    row[7] = "Customer";
                    row[8] = stopRecord.getValue({ fieldId: 'custrecord_service_leg_addr_postal'});
                    var addrArr = [];
                    if (!isNullorEmpty(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_subdwelling'}))) {
                        addrArr.push(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_subdwelling'}));
                    }
                    addrArr.push(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_st_num_name'}));
                    addrArr.push(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_suburb'}));
                    addrArr.push(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_state'}));
                    addrArr.push(stopRecord.getValue({fieldId: 'custrecord_service_leg_addr_postcode'}));
                    row [9] = addrArr.join(',');
                } else {
                    row[7] = "Non-Customer";
                    row[8] = stopRecord.getValue({ fieldId: 'custrecord_service_leg_addr_postal'});
                    row[9] = stopRecord.getValue({ fieldId: 'name'});
                }

                row[10] = stopRecord.getValue({ fieldId: 'custrecord_service_leg_duration'});
                row[11] = searchResult.getValue({name: 'custrecord_service_freq_time_start'});
                row[12] = stopRecord.getText({ fieldId: 'custrecord_service_leg_trf_type'});
                row[13] = stopRecord.getValue({ fieldId: 'custrecord_service_leg_notes'});


                freqSearch2.filters.push(search.createFilter({
                    name: 'custrecord_service_freq_service',
                    operator: search.Operator.IS,
                    values: searchResult.getValue({name: 'custrecord_service_freq_service'}) 
                }));

                var freqSearchResults2 = freqSearch2.run();
                freqSearchResults2.each(function(searchResult2) {
                    var internalId = searchResult2.getValue({name: 'internalid'});
                    if (!freqIDs.includes(internalId)) {
                        freqIDs.push(internalId);
                        var stop2_id = searchResult2.getValue({name: 'custrecord_service_freq_stop'});
                        var stopRecord2 = record.load({type: 'customrecord_service_leg', id: stop2_id });
                        var location_type = stopRecord2.getValue({ fieldId: 'custrecord_service_leg_location_type'});
                        if (location_type === 1) {
                            row[14] = "Customer";
                            row[15] = stopRecord2.getValue({ fieldId: 'custrecord_service_leg_addr_postal'});
                            var addrArr2 = [];
                            if (!isNullorEmpty(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_subdwelling'}))) {
                                addrArr2.push(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_subdwelling'}));
                            }
                            addrArr2.push(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_st_num_name'}));
                            addrArr2.push(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_suburb'}));
                            addrArr2.push(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_state'}));
                            addrArr2.push(stopRecord2.getValue({fieldId: 'custrecord_service_leg_addr_postcode'}));
                            row[16] = addrArr2.join(',');
                        } else {
                            row[14] = "Non-Customer";
                            row[15] = stopRecord2.getValue({ fieldId: 'custrecord_service_leg_addr_postal'});
                            row[16] = stopRecord2.getValue({ fieldId: 'name'});
                        }

                        row[17] = stopRecord2.getValue({ fieldId: 'custrecord_service_leg_duration'});
                        row[18] = searchResult2.getValue({name: 'custrecord_service_freq_time_start'});
                        row[19] = stopRecord2.getText({ fieldId: 'custrecord_service_leg_trf_type'});
                        row[20] = stopRecord2.getValue({ fieldId: 'custrecord_service_leg_notes'});

                    }
                });

                
                
                
                row[21] = searchResult.getText({name: 'custrecord_service_freq_operator'});
                row[22] = searchResult.getText({name: 'custrecord_service_freq_run_plan'});//check? may have to load record from id

                csv += row.join(';');
                csv += "\n";
                return true;
            });

            console.log("finished");
            var val1 = currentRecord.get();
            val1.setValue({
                fieldId: 'custpage_export_run_csv',
                value: csv
            });


            exportRunDownload();
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
            
            
        };  
    }

    
);