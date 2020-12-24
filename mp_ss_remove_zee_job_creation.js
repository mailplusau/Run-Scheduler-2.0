/**
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 1.00         2019-11-12 11:27:02         Ankith
 *
 * Description: Change the Daily App Job Creation field on Franchisee record to "NO"         
 * 
 * @Last Modified by:   Ankith
 * @Last Modified time: 2019-11-12 14:39:25
 *
 */

var usage_threshold = 30; //20
var usage_threshold_invoice = 1000; //1000
var adhoc_inv_deploy = 'customdeploy2';
var prev_inv_deploy = null;
var ctx = nlapiGetContext();

function main() {

    nlapiLogExecution('AUDIT', 'prev_deployment', ctx.getSetting('SCRIPT', 'custscript_rp_prev_deployment'));
    if (!isNullorEmpty(ctx.getSetting('SCRIPT', 'custscript_rp_prev_deployment'))) {
        prev_inv_deploy = ctx.getSetting('SCRIPT', 'custscript_rp_prev_deployment');
    } else {
        prev_inv_deploy = ctx.getDeploymentId();
    }

    //SEARCH: RP - Zee - App Job Created
    var zeeSearch = nlapiLoadSearch('partner', 'customsearch_rp_zee_app_job_created');

    var resultZee = zeeSearch.runSearch();
    resultZee.forEachResult(function(searchResult) {

        var usage_loopstart_cust = ctx.getRemainingUsage();


        if (usage_loopstart_cust < usage_threshold) {

            var params = {
                custscript_rp_prev_deployment: ctx.getDeploymentId()
            }

            reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
            nlapiLogExecution('AUDIT', 'Reschedule Return', reschedule);
            if (reschedule == false) {

                return false;
            }
        }

        var zee_id = searchResult.getValue("internalid");
        var zee_record = nlapiLoadRecord('partner', zee_id);
        zee_record.setFieldValue('custentity_zee_app_job_created', 2);
        nlapiSubmitRecord(zee_record, false, true);

        return true;
    });
}