/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 2.00         2020-10-18 18:08:08         Anesu
 *
 * Description: Import an excel file of stops to add into an existing run   
 * 
 * @Last Modified by:   Anesu Chakaingesu
 * @Last Modified time: 2020-10-22 16:49:26
 * 
 */


define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format', 'N/file'],
    function(runtime, search, record, log, task, currentRecord, format, file) {
        var zee = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        role = runtime.getCurrentUser().role;

        if (role == 1000) {
            zee = runtime.getCurrentUser().id;
        } else if (role == 3) { //Administrator
            zee = 6; //test
        } else if (role == 1032) { // System Support
            zee = 425904; //test-AR
        }

        var indexInCallback = 0;
        var currRec = currentRecord.get();
        var ctx = runtime.getCurrentScript();

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

        return {
            execute: onclick_exportRun()
        }
    });
