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
        var ctx = runtime.getCurrentScript();

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

            var zeesSearchResults = zeesSearch.run();

            var data_set = ctx.getParameter({ name: 'custscript_template_data_set' })
            if (isNullorEmpty(data_set)) {
                log.audit({
                    title: 'deleting',
                    details: 'deleting'
                });
                deleteRecords();
                data_set = [];

            } else {
                data_set = JSON.parse(data_set);
            }

            zeesSearchResults.each(function(searchResult) {
                var zee = searchResult.getValue({name: 'internalid'});
                                
                if (data_set.indexOf(zee) == -1){
                    log.debug({
                        title: 'zee',
                        details: zee
                    });
                    data_set.push(zee);
                    createCSV(zee, data_set);
                }
            
                return true;
            });
                      

            log.debug({
                title: 'script complete',
                details: 'script complete'
            })
        }

        /**
         * Create the CSV and store it in the hidden field 'custpage_table_csv' as a string.
         */
        function createCSV(zeeVal, data_set) {
            var runRecord = record.create({
                type: 'customrecord_export_run_json',
                isDynamic: true,
            });

            runRecord.setValue({ fieldId: 'custrecord_export_run_franchisee', value: zeeVal});
            runRecord.setValue({ fieldId: 'custrecord_export_run_template', value: true});
            
            var serviceSearch = search.load({
                id: 'customsearch_customer_services',
                type: 'customrecord_service'
            });

            serviceSearch.filters.push(search.createFilter({
                name: 'custrecord_service_franchisee',
                operator: search.Operator.IS,
                values: zeeVal
            }));


            var resultSetCustomer = serviceSearch.run();
            var run_json = [];

            var reschedule;
            resultSetCustomer.each(function(searchResult) {
                var usageLimit = ctx.getRemainingUsage();
                  
                if (usageLimit < 100) {
                    log.audit({
                        title: 'usageLimit',
                        details: usageLimit
                    })
                    data_set.pop();
                    log.audit({
                        title: 'data_set',
                        details: data_set
                    });
                    params = {
                        custscript_template_data_set: JSON.stringify(data_set)
                    };
                    reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_ss_download_template',
                        deploymentId: 'customdeploy_ss_download_template',
                        params: params
                    });
                    
                    log.audit({
                        title: 'Attempting: Rescheduling Script',
                        details: reschedule
                    });

                    reschedule.submit();
                    
                    return false;
                } else {
                    var run_info = {"custInternalId": null, "custId": null, "custName": null, "serviceId": null, "serviceName": null , "price": null};


                    var internal_custid = searchResult.getValue({name: 'internalid', join: "CUSTRECORD_SERVICE_CUSTOMER"});
                        var custid = searchResult.getValue({name: 'entityid', join: "CUSTRECORD_SERVICE_CUSTOMER"});
                        var companyname = searchResult.getValue({name: 'companyname', join: "CUSTRECORD_SERVICE_CUSTOMER"});
                        var service_id = searchResult.getValue({name: 'internalid'});

                        var service_name = searchResult.getValue({name: 'name', join: "CUSTRECORD_SERVICE"});
                        var service_price = searchResult.getValue({name: 'custrecord_service_price'});

                        

                    run_info.custInternalId = internal_custid;
                    run_info.custId = custid;
                    run_info.custName = companyname;
                    run_info.serviceId = service_id;
                    run_info.serviceName = service_name;
                    run_info.price = service_price;
    
                    run_json.push(run_info);
                    return true;

                }
                

            });

            if (isNullorEmpty(reschedule)) {
                runRecord.setValue({ fieldId: 'custrecord_export_run_json_info', value: JSON.stringify(run_json)});
                var id = runRecord.save({
                    enableSourcing: true,
                });
    
                log.debug({
                    title: 'runRecord id',
                    details: id
                });
            }
            
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

        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }

        return {
            execute: main
        }
    }
);


