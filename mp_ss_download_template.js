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
            var zeesSearch = search.load({
                id: 'customsearch_job_inv_process_zee',
                type: search.Type.PARTNER
            });
            deleteRecords();

            var zeesSearchResults = zeesSearch.run();
            zeesSearchResults.each(function(searchResult) {
                var run_id = searchResult.getValue({name: 'internalid'});
                var zee = searchResult.getValue({name: 'custrecord_run_franchisee'});
                var run_name = searchResult.getValue({name: 'name'});
                createCSV(zee); 
                return true;
            });
                      

        }
        
        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         */
        function createCSV(zeeVal) {

            var runRecord = record.create({
                type: 'customrecord_export_run_json',
                isDynamic: true,
            });

            runRecord.setValue({ fieldId: 'custrecord_export_run_franchisee', value: zeeVal});
            runRecord.setValue({ fieldId: 'custrecord_export_run_template', value: true});
            
            var serviceSearch = search.load({
                id: 'customsearch_rp_services',
                type: 'customrecord_service'
            });

            serviceSearch.filters.push(search.createFilter({
                name: 'custrecord_service_franchisee',
                operator: search.Operator.ANYOF,
                values: zeeVal
            }));


            var resultSetCustomer = serviceSearch.run();
            var run_json = [];

            resultSetCustomer.each(function(searchResult) {
                var run_info = {"custInternalId": null, "custId": null, "custName": null, "serviceId": null, "serviceName": null , "price": null};

                var internal_custid = searchResult.getValue({ name: "custrecord_service_customer", join: null, summary: search.Summary.GROUP});

                var custRecord = record.load({type: record.Type.CUSTOMER, id: internal_custid })
                var custid = custRecord.getValue({ fieldId: 'entityid'});

                var companyname = searchResult.getValue({ name: "companyname", join: "CUSTRECORD_SERVICE_CUSTOMER", summary: search.Summary.GROUP});
                var service_id = searchResult.getValue({ name: "internalid", join: null, summary: search.Summary.GROUP});
                var service_name = searchResult.getText({ name: "custrecord_service", join: null, summary: search.Summary.GROUP});
                var service_price = searchResult.getValue({ name: "custrecord_service_price", join: null, summary: search.Summary.GROUP});
                
                run_info.custInternalId = internal_custid;
                run_info.custId = custid;
                run_info.custName = companyname;
                run_info.serviceId = service_id;
                run_info.serviceName = service_name;
                run_info.price = service_price;

                run_json.push(run_info);

                return true;
            });

            runRecord.setValue({ fieldId: 'custrecord_export_run_json_info', value: JSON.stringify(run_json)});
            var id = runRecord.save({
                enableSourcing: true,
            });

            log.debug({
                title: 'runRecord id',
                details: id
            });

        }
        
        function deleteRecords() {
            log.debug({
                title: 'DELETE STRING ACTIVATED'
            });
            var exportRunSearch = search.load({
                type: 'customrecord_export_run_json',
                id: 'customsearch_export_run_json'
            });
            exportRunSearch.run().each(function(result) {
                
                var index = result.getValue('internalid');
                if (result.getValue('custrecord_export_run_template') === 'T') {
                    deleteResultRecord(index);
                }
              
                return true;
            });

            
        }

        function deleteResultRecord(index) {           
            // Deleting a record consumes 4 governance units.
            record.delete({
                type: 'customrecord_export_run_json',
                id: index
            });
            
        }

        return {
            execute: main
        }
    }
);


