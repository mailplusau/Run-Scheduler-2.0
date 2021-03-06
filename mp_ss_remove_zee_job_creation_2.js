/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Description: Change the Daily App Job Creation field on Franchisee record to "NO"         
 * 
 * @Last Modified by:   Anesu Chakaingesu
 * 
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'],
    function(runtime, search, record, log, task, currentRecord, format) {
        var usage_threshold = 30; //20
        var usage_threshold_invoice = 1000; //1000
        var adhoc_inv_deploy = 'customdeploy_ss_remove_zee_job_creation';
        var prev_inv_deploy = null;
        var ctx = runtime.getCurrentScript();

        function main() {
            
            if (!isNullorEmpty(ctx.getParameter({ name: '	custscript_rp_prev_deployment_zee_job' }))) {
                prev_inv_deploy = ctx.getParameter({ name: '	custscript_rp_prev_deployment_zee_job' });
            } else {
                prev_inv_deploy = 'customscript_ss_remove_zee_job_creation';
            }

             //SEARCH: RP - Zee - App Job Created
            var zeeSearch = search.load({
                id: 'customsearch_rp_zee_app_job_created',
                type: 'partner'
            });
            // zeeSearch.filters.push(search.createFilter({
            //     name: 'internalid',
            //     operator: search.Operator.IS,
            //     values: 780481
            // })); // Test Value of TEST - ACT zee 
            // zeeSearch.filters.push(search.createFilter({
            //     name: 'internalid',
            //     operator: search.Operator.IS,
            //     values: 6
            // })); // Test Value of TEST zee 
            var resultZee = zeeSearch.run();
            resultZee.each(function(searchResult) {

                var usage_loopstart_cust = ctx.getRemainingUsage();


                if (usage_loopstart_cust < usage_threshold) {

                    var params = {
                        	custscript_rp_prev_deployment_zee_job: 'customscript_ss_remove_zee_job_creation'
                    }
                    
                    //reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
                    var rescheduledScriptTask = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        deploymentId: adhoc_inv_deploy,
                        scriptId: prev_inv_deploy,
                        params: params
                    });
                    var reschedule = rescheduledScriptTask.submit();

                    // if (task.checkStatus({ taskId: reschedule}) == false) {
                        return false;
                    // }
                }

                var zee_id = searchResult.getValue({ name: 'internalid'});
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

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }

        return {
            execute: main
        }
    }
);