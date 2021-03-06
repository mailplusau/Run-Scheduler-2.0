/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * Module Description
 * 
 * @Last Modified by:   Anesu Chakaingesu
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task', 'N/currentRecord', 'N/format'], 
    function(runtime, search, record, log, task, currentRecord, format) {
        var usage_threshold = 1000; 
        var adhoc_inv_deploy = 'customdeploy_ss_unlink_stop_job_2';
        var prev_inv_deploy = null;
        var ctx = runtime.getCurrentScript();

        function execute(){
            log.audit({
                title: 'prev_deployment',
                details: ctx.getParameter({
                    name: 'custscript_rp_prev_deployment_unlink'
                })
            })
            if (!isNullorEmpty(ctx.getParameter({ name: 'custscript_rp_prev_deployment_unlink' }))) {
                prev_inv_deploy = ctx.getParameter({
                    name: 'custscript_rp_prev_deployment_unlink'
                })
            } else {
                prev_inv_deploy = 'customscript_ss_unlink_stop_job_2';
            }


            var count = 0;
            var old_leg_id;
            var old_freq_id;
            var job_id_array = [];
            var freq_id_array = [];

            //SEARCH : App Service Leg - Unlink Stop/Job
            var stopSearch = search.load({
                id: 'customsearch_unlink_stop_job',
                type: 'customrecord_service_leg'
            });
            var resultSetStop = stopSearch.run();
            resultSetStop.each(function(searchResult) {
                log.debug({
                    title: 'In the Loop',
                    details: any
                })
                var usage_loopstart_cust = ctx.getRemainingUsage();
                log.audit({
                    title: 'usage_loopstart_cust',
                    details: usage_loopstart_cust
                });

                if (usage_loopstart_cust < usage_threshold) {
                    var params = {
                        custscript_rp_prev_deployment: 'customscript_ss_unlink_stop_job_2'
                    }

                    // reschedule = rescheduleScript(prev_inv_deploy, adhoc_inv_deploy, params);
                    var reschedule = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        deploymentId: adhoc_inv_deploy,
                        scriptid: prev_inv_deploy,
                        params: params
                    });
                    reschedule.submit();
                    var reschedule_id = task.checkStatus({
                        taskId: reschedule
                    })

                    log.audit({
                        title: 'Reschedule Return',
                        details: reschedule_id
                    })
                    if (reschedule_id == false) {

                        return false;
                    }
                }

                var leg_id = searchResult.getValue({ name: 'internalid' });
                var job_id = searchResult.getValue({ name: 'internalid', join: 'CUSTRECORD159', summary: null});
                var freq_id = searchResult.getValue({ name: 'internalid', join: 'CUSTRECORD_SERVICE_FREQ_STOP', sumarry: null});
                log.debug({
                    title: 'count',
                    details: count
                })
                log.debug({
                    title: 'leg_id',
                    details: leg_id
                });
                log.debug({
                    title: 'old_leg_id',
                    details: old_leg_id
                });

                if (count == 0) {
                    if (!isNullorEmpty(job_id)) {
                        job_id_array[0] = job_id;
                    }
                    if (!isNullorEmpty(freq_id)) {
                        freq_id_array[0] = freq_id;
                    }
                } else {
                    if (leg_id == old_leg_id) {
                        if (!isNullorEmpty(job_id)) {
                            job_id_array[job_id_array.length] = job_id;
                        }
                        if (!isNullorEmpty(freq_id) && old_freq_id != freq_id) {
                            freq_id_array[freq_id_array.length] = freq_id;
                        }
                    } else if (leg_id != old_leg_id) {
                        log.debug({
                            title: 'leg_id',
                            details: leg_id
                        })
                        log.debug({
                            title: 'old_leg_id',
                            details: old_leg_id
                        })
                        log.debug({
                            title: 'job_id_array',
                            details: job_id_array
                        })
                        log.debug({
                            title: 'freq_id_array',
                            details: freq_id_array
                        })

                        for (i = 0; i < job_id_array.length; i++) {
                            log.debug({
                                title: 'job_id_array[i]',
                                details: job_id_array[i]
                            })
                            var jobRecord = record.load({
                                id: job_id_array[i],
                                type: 'customrecord_job'
                            });
                            var stop = jobRecord.getValue({ fieldId: 'custrecord_job_stop'});
                            log.debug({ title: 'stop', details: stop});
                            jobRecord.setValue({ fieldId: 'custrecord_job_stop', value: null});
                            jobRecord.setValue({ fieldId: 'custrecord159', value: null});
                            jobRecord.save();
                        }
                        for (i = 0; i < freq_id_array.length; i++) {
                            log.debug({
                                title: 'freq_id_array[i]',
                                details: freq_id_array[i]
                            });
                            record.delete({
                                type: 'customrecord_service_freq',
                                id: freq_id_array[i]
                            });
                        }
                        var legRecord = record.load({
                            type: 'customrecord_service_leg',
                            id: old_leg_id
                        });
                        legRecord.setValue({ fieldId: 'custrecord_service_leg_trf_linked_stop', value: null});
                        old_leg_id = legRecord.save();
                        log.debug({
                            title: 'old_leg_id',
                            details: old_leg_id
                        });
                        record.delete({
                            type: 'customrecord_service_leg',
                            id: old_leg_id
                        });

                        job_id_array = [];
                        freq_id_array = [];

                        if (!isNullorEmpty(job_id)) {
                            job_id_array[job_id_array.length] = job_id;
                        }
                        if (!isNullorEmpty(freq_id)) {
                            freq_id_array[freq_id_array.length] = freq_id;
                        }
                    }
                }
                old_leg_id = leg_id;
                old_freq_id = freq_id;
                log.debug({
                    title: 'old_leg_id',
                    details: old_leg_id
                })
                count++;
                return true;
            });

            if (count > 0) {
                log.debug({
                    title: 'last one'
                })
                for (i = 0; i < job_id_array.length; i++) {
                    log.debug({
                        title: 'job_id_array[i]',
                        details: job_id_array[i]
                    })
                    var jobRecord = record.load({
                        id: job_id_array[i],
                        type: 'customrecord_job'
                    });
                    var stop = jobRecord.getValue({ fieldId: 'custrecord_job_stop'});
                    log.debug({ title: 'stop', details: stop});
                    jobRecord.setValue({ fieldId: 'custrecord_job_stop', value: null});
                    jobRecord.setValue({ fieldId: 'custrecord159', value: null});
                    jobRecord.save();
                }
                for (i = 0; i < freq_id_array.length; i++) {
                    log.debug({
                        title: 'freq_id_array[i]',
                        details: freq_id_array[i]
                    })
                    record.delete({
                        type: 'customrecord_service_leg',
                        id: old_leg_id
                    });
                }
                var jobRecord = record.load({
                    id: job_id_array[i],
                    type: 'customrecord_job'
                });
                jobRecord.setValue({
                    fieldId: 'custrecord_service_leg_trf_linked_stop',
                    value: null
                });
                old_leg_id = jobRecord.save();
            }
        }

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }


        return {
            execute: execute
        } 
});