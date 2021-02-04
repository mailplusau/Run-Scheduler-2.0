/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description: Scheduled script to delete an entire run
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
            var run_id = runtime.getCurrentScript().getParameter({ name: 'custscript_delete_run_run_id' });          
            
            var freqSearch = search.load({
                id: 'customsearch_rp_servicefreq',
                type: 'customrecord_service_freq'
            });

            freqSearch.filters.push(search.createFilter({
                name: 'custrecord_service_freq_run_plan',
                operator: search.Operator.EQUALTO,
                values: run_id
            }));

            var freqResults = freqSearch.run();
            
            freqResults.each(function(search_result) {
                var freqLegId = search_result.getValue({name: 'internalid'});
                var freqRec = record.load({
                    type: 'customrecord_service_freq',
                    id: freqLegId,
                });

                freqRec.setValue({fieldId: 'isinactive', value: true});
                return true;

            });

            var serviceSearch = search.load({
                id: 'customsearch_rp_serviceleg',
                type: 'customrecord_service_leg'
            });

            serviceSearch.filters.push(search.createFilter({
                name: 'custrecord_service_freq_run_plan',
                operator: search.Operator.EQUALTO,
                values: run_id
            }));

            var serviceResults = serviceSearch.run();
            
            serviceResults.each(function(search_result) {
                var serviceLegId = search_result.getValue({name: 'internalid'});
                var serviceRec = record.load({
                    type: 'customrecord_service_freq',
                    id: serviceLegId,
                });

                serviceRec.setValue({fieldId: 'isinactive', value: true});
                return true;

            });
                
            record.delete({
                type: 'customrecord_run_plan',
                id: run_id
            }); 
            
        }


        return {
            execute: main
        }
    }
);