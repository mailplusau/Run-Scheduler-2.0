/**
 * 
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Description: Import an excel file of stops to add into an existing run
 * @Last Modified by: Sruti Desai
 * 
 */


define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format', 'N/file', 'N/error', 'N/task'], 
function(ui, email, runtime, search, record, http, log, redirect, format, file, error, task) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var zee = 0;
    var role = runtime.getCurrentUser().role;
    if (role == 1000) {
        //Franchisee
        zee = runtime.getCurrentUser().id;
    } 

    function onRequest(context) {  
        
        if (context.request.method === 'GET') {
            // Load jQuery
            var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
            // Load Tooltip
            inlineHtml += '<script src="https://unpkg.com/@popperjs/core@2"></script>';

            // Load Bootstrap
            inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
            inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
            // Load DataTables
            inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

            // Load Bootstrap-Select
            inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
            inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';

            // Load Netsuite stylesheet and script
            inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
            inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
            inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            inlineHtml += '<style>.mandatory{color:red;}</style>';   

            
            var form = ui.createForm({
                title: 'Delete Run'
            });
            form.addButton({
                id : 'import',
                label : 'Import Excel',
                functionName : 'onclick_importExcel()'
            });

            form.addSubmitButton({
                label: 'Delete Run'
            });

            
            if (role == 1000) {
                form.addField({
                    id: 'zee',
                    type: ui.FieldType.TEXT,
                    label: 'zee'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = runtime.getCurrentUser().id;
            } 
            
            if (!isNullorEmpty(context.request.parameters.zee) && context.request.parameters.zee != 0) {
                form.addField({
                    id: 'zee',
                    type: ui.FieldType.TEXT,
                    label: 'zee'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = context.request.parameters.zee;
            } else {
                form.addField({
                    id: 'zee',
                    type: ui.FieldType.TEXT,
                    label: 'zee'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = zee;
            }
                        
            if (!isNullorEmpty(context.request.parameters.run) && context.request.parameters.run != 0) {
                form.addField({
                    id: 'run',
                    type: ui.FieldType.TEXT,
                    label: 'run'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = context.request.parameters.run;
                
                var freqSearch = search.load({
                    id: 'customsearch_rp_servicefreq',
                    type: 'customrecord_service_freq'
                });
    
                freqSearch.filters.push(search.createFilter({
                    name: 'custrecord_service_freq_run_plan',
                    operator: search.Operator.IS,
                    values: context.request.parameters.run
                }));
                
                var initial_count = freqSearch.runPaged().count;
                
                form.addField({
                    id: 'initial_count',
                    type: ui.FieldType.TEXT,
                    label: 'initial_count'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = initial_count;

            } else {
                form.addField({
                    id: 'run',
                    type: ui.FieldType.TEXT,
                    label: 'run'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
            }

            form.addField({
                id: 'scheduled_script',
                type: ui.FieldType.TEXT,
                label: 'scheduled_script'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            //Important Instructions box
            inlineHtml += '<br></br>'
            inlineHtml += '<div></div>';
            inlineHtml += '<div class="form-group test_section">';
            //inlineHtml += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button>';
            //inlineHtml += '<div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 20px 30px 30px 30px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
            inlineHtml += '<div style=\"background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 20px 30px 30px 30px\"><b><u>Important Instructions:</u></b>';
            inlineHtml += '<ul><li><b><u>Please do not alter the columns titled Customer Internal ID, Customer Id, Customer Name, Service Id, Service Name and Price</u></b></li>';
            inlineHtml += '<li><b><u>Frequency</u></b>: If the frequency of the service is multiple days then separate with a / i.e. Mon/Tue/Wed/Thurs/Fri. </li>';
            inlineHtml += '<li><b><u>Frequency</u></b>: Frequency field can take input of Daily and Adhoc as well</li>';
            inlineHtml += '<li><b><u>Customer or Non-Customer</u></b>: Please only enter in "Customer" or "Non-Customer" in this field </li>';
            inlineHtml += '<li><b><u>Location (Customer)</u></b>: For a Customer Location please enter all address details in this single field i.e. "379-381 Victoria Street, Wetherill Park, NSW, 2164" </li>';
            inlineHtml += '<li><b><u>Location (Non-Customer)</u></b>: For a Non-Customer Location please enter the exact name of the stop i.e. "ARNCLIFFE LPO" </li>';
            inlineHtml += '<li><b><u>Duration</u></b>: Enter length of time in seconds only i.e. "120", where 120 is equal to 2 minutes </li>';
            inlineHtml += '<li><b><u>Time</u></b>: Enter the time leg will occur in 12 hour time with a ":" separating the minutes and hours, and AM/PM following the time. i.e. "12:30PM" or "8:46AM" </li>';
            inlineHtml += '<li><b><u>Notes</u></b>: Enter the necessary notes (in any format) required for each stop in the relevant fields </li>';
            inlineHtml += '<li><b><u>Run Name</u></b>: Enter the exact Run-Name as it appears on Netsuite i.e. "Danilo\'s" or "Mascot" or "Multi Run" </li>';
            inlineHtml += '<li><b><u>Non-Mandatory Fields</u></b>: Po Box, Notes, Transfer </li>';
            inlineHtml += '<li><b><u>Download Template</u></b>: If you are a franchisee click on the "Download Template" button to download a template for your franchise. If you are not a franchisee, select a zee from the dropdown and then click on the download template button to download a template for that specific zee </li>';
            inlineHtml += '<li><b><u>Delete Run</u></b>: Select a zee and then select a run from the relevant dropdowns. After clicking the Delete Run button, this entire run will be deleted. </li>';
            inlineHtml += '<li><b><u>Export Run</u></b>: Select a zee and then select a run from the relevant dropdowns. After clicking the Export Run button, the entire run will be exported into a csv </li>';
            inlineHtml += '<li><b><u>Non-Mandatory Fields</u></b>: Po Box, Notes, Transfer </li>';
            inlineHtml += '<li>If you have any issues, please contact Head Office</li>';
            inlineHtml += '</ul></div></div><br/>';

            inlineHtml += progressBar();
            
            if (role != 1000) {
                inlineHtml += franchiseeDropdownSection(context.request.parameters.zee);
            }
            
            if (!isNullorEmpty(context.request.parameters.zee)) {
                inlineHtml += runDropdownSection(context.request.parameters.zee, context.request.parameters.run);
            }          

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.STARTROW
            }).defaultValue = inlineHtml;

            
            

            form.clientScriptFileId = 4692509; //PROD = 4692509, SB = 

            context.response.writePage(form);


        } else {
            var zee = context.request.parameters.zee;
            var run = context.request.parameters.run;
            log.debug({
                title: 'zee',
                details: zee
            });

            log.debug({
                title: 'run',
                details: run
            });
            // CALL SCHEDULED SCRIPT
            var scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
            scriptTask.scriptId = 'customscript_ss_delete_run';
            scriptTask.deploymentId = 'customdeploy_ss_delete_run';
            scriptTask.params = {
                custscript_delete_run_run_id_set: run
            };
            var ss_id = scriptTask.submit();
            
            var myTaskStatus = task.checkStatus({
                taskId: ss_id
            });
            
            // Load jQuery
            var inlineHtml = '<script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>';
            // Load Tooltip
            inlineHtml += '<script src="https://unpkg.com/@popperjs/core@2"></script>';

            // Load Bootstrap
            inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
            inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
            // Load DataTables
            inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';

            // Load Bootstrap-Select
            inlineHtml += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/css/bootstrap-select.min.css">';
            inlineHtml += '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.14/dist/js/bootstrap-select.min.js"></script>';

            // Load Netsuite stylesheet and script
            inlineHtml += '<link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/>';
            inlineHtml += '<script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script>';
            inlineHtml += '<link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            inlineHtml += '<style>.mandatory{color:red;}</style>';   

            
            var form = ui.createForm({
                title: 'Delete Run'
            });
            form.addButton({
                id : 'import',
                label : 'Import Excel',
                functionName : 'onclick_importExcel()'
            });

            form.addSubmitButton({
                label: 'Delete Run'
            });

            
            if (role == 1000) {
                form.addField({
                    id: 'zee',
                    type: ui.FieldType.TEXT,
                    label: 'zee'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = runtime.getCurrentUser().id;
            } if (!isNullorEmpty(context.request.parameters.zee) && context.request.parameters.zee != 0) {
                form.addField({
                    id: 'zee',
                    type: ui.FieldType.TEXT,
                    label: 'zee'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = context.request.parameters.zee;
            } else {
                form.addField({
                    id: 'zee',
                    type: ui.FieldType.TEXT,
                    label: 'zee'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = zee;
            }
             
            form.addField({
                id: 'scheduled_script',
                type: ui.FieldType.TEXT,
                label: 'scheduled_script'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = true;

            if (!isNullorEmpty(context.request.parameters.run) && context.request.parameters.run != 0) {
                form.addField({
                    id: 'run',
                    type: ui.FieldType.TEXT,
                    label: 'run'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                }).defaultValue = context.request.parameters.run;
                

            } else {
                form.addField({
                    id: 'run',
                    type: ui.FieldType.TEXT,
                    label: 'run'
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
            }


            //Important Instructions box
            inlineHtml += '<br></br>'
            inlineHtml += '<div></div>';
            inlineHtml += '<div class="form-group test_section">';
            //inlineHtml += '<button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button>';
            //inlineHtml += '<div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 20px 30px 30px 30px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b>';
            inlineHtml += '<div style=\"background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 20px 30px 30px 30px\"><b><u>Important Instructions:</u></b>';
            inlineHtml += '<ul><li><b><u>Please do not alter the columns titled Customer Internal ID, Customer Id, Customer Name, Service Id, Service Name and Price</u></b></li>';
            inlineHtml += '<li><b><u>Frequency</u></b>: If the frequency of the service is multiple days then separate with a / i.e. Mon/Tue/Wed/Thurs/Fri. </li>';
            inlineHtml += '<li><b><u>Frequency</u></b>: Frequency field can take input of Daily and Adhoc as well</li>';
            inlineHtml += '<li><b><u>Customer or Non-Customer</u></b>: Please only enter in "Customer" or "Non-Customer" in this field </li>';
            inlineHtml += '<li><b><u>Location (Customer)</u></b>: For a Customer Location please enter all address details in this single field i.e. "379-381 Victoria Street, Wetherill Park, NSW, 2164" </li>';
            inlineHtml += '<li><b><u>Location (Non-Customer)</u></b>: For a Non-Customer Location please enter the exact name of the stop i.e. "ARNCLIFFE LPO" </li>';
            inlineHtml += '<li><b><u>Duration</u></b>: Enter length of time in seconds only i.e. "120", where 120 is equal to 2 minutes </li>';
            inlineHtml += '<li><b><u>Time</u></b>: Enter the time leg will occur in 12 hour time with a ":" separating the minutes and hours, and AM/PM following the time. i.e. "12:30PM" or "8:46AM" </li>';
            inlineHtml += '<li><b><u>Notes</u></b>: Enter the necessary notes (in any format) required for each stop in the relevant fields </li>';
            inlineHtml += '<li><b><u>Run Name</u></b>: Enter the exact Run-Name as it appears on Netsuite i.e. "Danilo\'s" or "Mascot" or "Multi Run" </li>';
            inlineHtml += '<li><b><u>Non-Mandatory Fields</u></b>: Po Box, Notes, Transfer </li>';
            inlineHtml += '<li><b><u>Download Template</u></b>: If you are a franchisee click on the "Download Template" button to download a template for your franchise. If you are not a franchisee, select a zee from the dropdown and then click on the download template button to download a template for that specific zee </li>';
            inlineHtml += '<li><b><u>Delete Run</u></b>: Select a zee and then select a run from the relevant dropdowns. After clicking the Delete Run button, this entire run will be deleted. </li>';
            inlineHtml += '<li><b><u>Export Run</u></b>: Select a zee and then select a run from the relevant dropdowns. After clicking the Export Run button, the entire run will be exported into a csv </li>';
            inlineHtml += '<li><b><u>Non-Mandatory Fields</u></b>: Po Box, Notes, Transfer </li>';
            inlineHtml += '<li>If you have any issues, please contact Head Office</li>';
            inlineHtml += '</ul></div></div><br/>';

            inlineHtml += progressBar();
            
            if (role != 1000) {
                inlineHtml += franchiseeDropdownSection(context.request.parameters.zee);
            }
            
            if (!isNullorEmpty(context.request.parameters.zee)) {
                inlineHtml += runDropdownSection(context.request.parameters.zee, context.request.parameters.run);
            }          

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.STARTROW
            }).defaultValue = inlineHtml;

            
            

            form.clientScriptFileId = 4692509; //PROD = 4692509, SB = 

            context.response.writePage(form);


        }
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }
    

    /**
     * The Franchisee dropdown list.
     * @param   {Number}    zee_id
     * @return  {String}    `inlineQty`
     */
    function franchiseeDropdownSection(params_zee) {
        var inlineQty = '<div class="form-group zee_dropdown_section >';

        //inlineQty += '<div class="row">';
        // Franchisee dropdown field
        inlineQty += '<div class="zee_dropdown_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="zee_dropdown_text">FRANCHISEE</span>';
        inlineQty += '<select id="zee_dropdown" class="form-control zee_dropdown" required>';
        inlineQty += '<option></option>';

        // Load the franchisees options
        var zeesSearch = search.load({
            id: 'customsearch_job_inv_process_zee',
            type: search.Type.PARTNER
        });

        var zeesSearchResults = zeesSearch.run();
        zeesSearchResults.each(function (zeesSearchResult) {
            var opt_zee_id = zeesSearchResult.getValue('internalid');
                var opt_zee_name = zeesSearchResult.getValue('companyname');
                
            var selected_option = '';
            if (role == 1000) {
                zee_id = runtime.getCurrentUser().id; //Get Franchisee ID-- REMOVE TO TEST
                selected_option = (opt_zee_id == zee_id) ? 'selected' : '';
            }
            if (!isNullorEmpty(params_zee)) {
                selected_option = (params_zee == opt_zee_id) ? 'selected' : '';
            }
            
            inlineQty += '<option value="' + opt_zee_id + '" ' + selected_option + '>' + opt_zee_name + '</option>';
            return true;
        });

        inlineQty += '</select>';
        inlineQty += '</div></div></div>';

        return inlineQty;
    }

    function runDropdownSection(zee, params_run) {
        // var inlineQty = '<div class="container select_run">';
        // inlineQty += '<div class="form-group container"><div class="row">';
        // inlineQty += '<div class="input-group">';
        // inlineQty += '<span class="input-group-addon">SELECT RUN</span>';
        // inlineQty += '<select class="form-control run_dropdown" >';

        var inlineQty = '<div class="form-group select_run >';

        //inlineQty += '<div class="row">';
        // Franchisee dropdown field
        inlineQty += '<div class="select_dropdown_div">';
        inlineQty += '<div class="input-group">';
        inlineQty += '<span class="input-group-addon" id="zee_dropdown_text">SELECT RUN</span>';
        inlineQty += '<select class="form-control run_dropdown" >';

        var runPlanSearch = search.load({
            id: 'customsearch_app_run_plan_active',
            type: 'customrecord_run_plan'
        })
        var zee_record = record.load({
            type: record.Type.PARTNER,
            id: parseInt(zee),
            isDynamic: true,
        });
        var multi = zee_record.getValue({ fieldId: 'custentity_zee_multiple_territory' })

        if (!isNullorEmpty(multi)) {
            runPlanSearch.filters.push(search.createFilter({
                name: 'custrecord_run_franchisee',
                operator: search.Operator.ANYOF,
                values: zee
            }));

        } else {
            runPlanSearch.filters.push(search.createFilter({
                name: 'custrecord_run_franchisee',
                operator: search.Operator.IS,
                values: zee
            }));
        }

        var resultSet_runPlan = runPlanSearch.run();
        var count_zee = 0;
        inlineQty += '<option value="' + 0 + '"></option>'
        resultSet_runPlan.each(function(searchResult_runPlan) {
            runinternalid = searchResult_runPlan.getValue('internalid');
            runname = searchResult_runPlan.getValue('name');

            if (params_run == runinternalid) {
                inlineQty += '<option value="' + runinternalid + '" selected="selected">' + runname + '</option>';
            } else {
                inlineQty += '<option value="' + runinternalid + '">' + runname + '</option>';
            }

            return true;
        });
        
        inlineQty += '</select></div></div></div>';

        return inlineQty;
    }

    /**
     * The table that will display the differents invoices linked to the franchisee and the time period.
     * @return  {String}    inlineQty
     */
    function dataTable() {
        var inlineQty = '<style>table#import_excel {font-size: 12px;text-align: center;border: none;}.dataTables_wrapper {font-size: 14px;}table#import_excel th{text-align: center;} .bolded{font-weight: bold;}</style>';
        inlineQty += '<table id="import_excel" class="table table-responsive table-striped customer tablesorter" style="width: 100%;">';
        inlineQty += '<thead style="color: white;background-color: #607799;">';
        inlineQty += '<tr class="text-center">';
        inlineQty += '</tr>';
        inlineQty += '</thead>';

        inlineQty += '<tbody id="result_import" class="result-import"></tbody>';

        inlineQty += '</table>';
        return inlineQty;
    }

    /**
     * Display the progress bar. Initialized at 0, with the maximum value as the number of records that will be moved.
     * Uses Bootstrap : https://www.w3schools.com/bootstrap/bootstrap_progressbars.asp
     * @param   {String}    nb_records_total    The number of records that will be moved
     * @return  {String}    inlineQty : The inline HTML string of the progress bar.
     */
    function progressBar() {
        var inlineQty = '<div class="progress hide">';
        inlineQty += '<div class="progress-bar progress-bar-striped progress-bar-warning" id="progress-records" role="progressbar" aria-valuenow="0" style="width:0%">0%</div>';
        inlineQty += '</div>';
        
        return inlineQty;
    }

    function getDate() {
        var date = (new Date());
        // if (date.getHours() > 6) {
        //     date = nlapiAddDays(date, 1);

        // }
        // date.setHours(date.getHours() + 17);
        var date_string = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate() + '_' + date.getHours() + '' + date.getMinutes();

        return date_string;
    }

    return {
        onRequest: onRequest
    };

});
