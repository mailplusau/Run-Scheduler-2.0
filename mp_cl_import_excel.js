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

        /**
         * On page initialisation
         */
        function pageInit() {
        
            $(document).on('change', '.zee_dropdown', function(event) {
                var zee = $(this).val();
                var zee_text = $(this).text();
                var currentScript = currentRecord.get();
                currentScript.setValue({
                    fieldId: 'zee',
                    value: zee
                });              

                createCSV(zee);
                // var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1151&deploy=1";
                // url += "&zee=" + zee + "";
                // window.location.href = url;
            });

        }

        function saveRecord(context) {

            return true;
        }

        function onclick_downloadButton() {
            var currentScript = currentRecord.get();
            var zee = currentScript.getValue({
                fieldId: 'zee',
            });


            if (zee == 0 && role != 1000) {
                alert('Please Select a Zee before downloading a template');
            } else {
                downloadCsv(zee);

                alert('worked');
            }  
        }

        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         */
        function createCSV(zeeVal) {
            var headers = ["Customer ID", "Customer Name", "Service ID", "Service Name", "Price", "Frequency", "PO Box# or DX#", "Stop 1 Location", "Stop 1 Duration", "Stop 1 Time", "Notes", "Stop 2 Location", "Stop 2 Duration", "Stop 2 Time", "Notes", "Driver Name", "Run (AM or PM)"]
            headers = headers.slice(0, headers.length); // .join(', ')

            var csv = headers + "\n";
            
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
                var custid = searchResult.getValue({ name: "custrecord_service_customer", join: null, summary: search.Summary.GROUP});
                var companyname = searchResult.getValue({ name: "companyname", join: "CUSTRECORD_SERVICE_CUSTOMER", summary: search.Summary.GROUP});
                var service_id = searchResult.getValue({ name: "internalid", join: null, summary: search.Summary.GROUP});
                var service_name = searchResult.getText({ name: "custrecord_service", join: null, summary: search.Summary.GROUP});
                var service_price = searchResult.getValue({ name: "custrecord_service_price", join: null, summary: search.Summary.GROUP});
                
                var row = new Array();
                row[0] = custid; row[1]= companyname; row[2] = service_id; row[3] = service_name; row[4] = service_price;
                csv += row.join(',');
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

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            onclick_downloadButton: onclick_downloadButton,
            
        };  
    }

    
);