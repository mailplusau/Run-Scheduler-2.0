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