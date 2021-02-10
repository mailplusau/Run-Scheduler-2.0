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
            log.debug({
                title: 'ss started',
            });
            var run_id = runtime.getCurrentScript().getParameter({ name: 'custscript_delete_run_run_id' });                   
            
            // record.delete({
            //     type: 'customrecord_run_plan',
            //     id: run_id
            // }); 
            

            deleteRecords(run_id);

            log.debug({
                title: 'finished',
                details: 'finished'
            })
        }

        function deleteRecords(run_id) {
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
                var usageLimit = runtime.getCurrentScript().getRemainingUsage();
                  
                if (usageLimit < 100) {
                    log.audit({
                        title: 'usageLimit',
                        details: usageLimit
                    })
                    log.audit({
                        title: 'dataset',
                        details: dataset
                    });
                    
                    reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: 'customscript_ss_delete_run',
                        deploymentId: 'customdeploy_ss_delete_run'
                    });
                    
                    log.audit({
                        title: 'Attempting: Rescheduling Script',
                        details: reschedule
                    });

                    reschedule.submit();
                    
                    return false;
                } else {
                    var freqRec = record.load({
                        type: 'customrecord_service_freq',
                        id: freqLegId,
                    });
                    var stop = freqRec.getValue({fieldId: 'custrecord_service_freq_stop'});
                    var serviceID = freqRec.getValue({fieldId: 'custrecord_service_freq_service'});
                    var stopRec = record.load({
                        type: 'customrecord_service_leg',
                        id: stop,
                    });
                    var serviceRec = record.load({
                        type: 'customrecord_service',
                        id: serviceID,
                    });

                    var custRecord = record.load({ type: record.Type.CUSTOMER, id: freqRec.getValue({fieldId: 'custrecord_service_freq_customer'}) });
                    custRecord.setValue({fieldId: 'custentity_run_scheduled', value: 2});
                    
                    serviceRec.setValue({ fieldId: 'custrecord_service_run_scheduled', value: 2});
                    stopRec.setValue({fieldId: 'isinactive', value: true});
                    freqRec.setValue({fieldId: 'isinactive', value: true});

                    stopRec.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    custRecord.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    freqRec.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    //dataset.push(freqLegId);
                    return true;

                }
                
        

            });
        }

        return {
            execute: main
        }
    }
);