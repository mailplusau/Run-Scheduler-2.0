/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * 
 * @Last Modified by:   Sruti Desai
 * 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'],
    function(runtime, search, record, log, task, currentRecord, format) {
        var zee = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        role = runtime.getCurrentUser().role;

        function main() {
            var zee = runtime.getCurrentScript().getParameter({ name: 'custscript_download_template_zee_id' });
            var csv = createCSV(zee);

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

            return csv;
        }
        
        return {
            execute: main
        }
    }
);


