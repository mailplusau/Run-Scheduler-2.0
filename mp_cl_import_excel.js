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

            load_record_interval = setInterval(loadImportRecord, 5000);

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

        function saveRecord(context) {

            return true;
        }

        function loadImportRecord(){
            console.log("test");
            var importSearch = search.create({
                type: 'customrecord_import_excel',
                id: 'customsearch_import_excel_table_2'
            });
            var id = 0;
            importSearch.run().each(function (res){

                
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
                //tableSet.push(["a", "a", "a", "a", "a", "a",  "a", "a","a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a"])
                return true;
            });


            console.log("tableset", tableSet);
            var datatable = $('#import_excel').DataTable();
            datatable.clear();
            datatable.rows.add(tableSet);
            datatable.draw();
            // if (tableSet.length > 1) {
            //     console.log("interval");
            //     clearInterval(load_record_interval);

            // } else {
            //     console.log("timeout");
            // if (!isNullorEmpty(id) && id != 0) {
            //     console.log("interval");
            //     clearInterval(load_record_interval);
            // } else {
            //     console.log("timeout");
            //     setTimeout(loadImportRecord, 1000);

            // }
            clearInterval(load_record_interval);


            //}

            //return true;
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
                createCSV(zee)
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
            record.delete({
                type: 'customrecord_run_plan',
                id: run_id
            }); 
        }
        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            onclick_downloadButton: onclick_downloadButton,
            onclick_deleteRun: onclick_deleteRun
            
        };  
    }

    
);