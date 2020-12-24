/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Description: Change the Daily App Job Creation field on Franchisee record to "NO"         
 * 
 * @Last Modified by:   Sruti Desai
 * 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'],
    function(runtime, search, record, log, task, currentRecord, format) {
        var usage_threshold = 30; //20
        var usage_threshold_invoice = 1000; //1000
        var adhoc_inv_deploy = 'customdeploy2';
        var prev_inv_deploy = null;
        var zee = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://system.sandbox.netsuite.com';
        }

        role = runtime.getCurrentUser().role;
        function rescheduleCurrentScript() {
            var scheduledScriptTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                deploymentId: adhoc_inv_deploy,
                scriptId: prev_inv_deploy,
                params: params
            });
            scheduledScriptTask.scriptId = runtime.getCurrentScript().id;
            scheduledScriptTask.deploymentId = runtime.getCurrentScript().deploymentId;
            return scheduledScriptTask.submit();
        }
    
        function main() {
            var scriptObj = runtime.getCurrentScript();
            log.audit({
                title: 'prev_deployment',
                details: scriptObj.getParameter({
                    name: 'custscript_rp_prev_deployment'
                })
            });
            
            
            if (!isNullorEmpty(scriptObj.getParameter({ name: 'custscript_rp_prev_deployment' }))) {
                prev_inv_deploy = scriptObj.getParameter({ name: 'custscript_rp_prev_deployment' });
            } else {
                prev_inv_deploy = scriptObj.deploymentId;
            }

             //SEARCH: RP - Zee - App Job Created
            var zeeSearch = search.load({
                id: 'customsearch_rp_zee_app_job_created',
                type: 'partner'
            });
            
            var resultZee = zeeSearch.run();
            resultZee.each(function(searchResult) {

                var usage_loopstart_cust = scriptObj.getRemainingUsage();


                if (usage_loopstart_cust < usage_threshold) {

                    var params = {
                        custscript_rp_prev_deployment: scriptObj.deploymentId
                    }
                    
                    //reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
                    var rescheduledScriptTask = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        deploymentId: adhoc_inv_deploy,
                        scriptId: prev_inv_deploy,
                        params: params
                    });
                    rescheduledScriptTask.scriptId = runtime.getCurrentScript().id;
                    rescheduledScriptTask.deploymentId = runtime.getCurrentScript().deploymentId;
                    var reschedule = rescheduledScriptTask.submit();


                    log.audit({
                        title: 'Reschedule Return',
                        details: task.checkStatus({
                            taskId: reschedule
                        })
                    });

                    if (task.checkStatus({ taskId: reschedule}) == false) {
                        return false;
                    }
                }

                var zee_id = searchResult.getValue("internalid");
                var zee_record = record.load({
                    type: record.Type.PARTNER,
                    id: zee_id,
                });
                
                zee_record.setValue({ fieldId: 'custentity_zee_app_job_created', value: 2 });
                
                zee_record.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });

                return true;
            });
        }
        return {
            execute: main
        }
    }
);