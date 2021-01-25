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
            var inlineHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css"><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';
            // Load DataTables
            inlineHtml += '<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css">';
            inlineHtml += '<script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>';
            inlineHtml += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
            inlineHtml += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
            inlineHtml += '<div></div>';    

            var form = ui.createForm({
                title: 'Import Excel'
            });
            form.addButton({
                id : 'import',
                label : 'DOWNLOAD TEMPLATE',
                functionName : 'onclick_downloadButton()'
            });
            
            form.addSubmitButton({
                label: 'Submit'
            });

            if (role != 1000) {
                inlineHtml += franchiseeDropdownSection();
            }

            
            form.addField({
                id: 'zee',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zee;

            form.addField({
                id: 'zee_text',
                type: ui.FieldType.TEXT,
                label: 'zee_text'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = zee;

            

            form.addField({
                id: 'custpage_table_csv',
                type: ui.FieldType.TEXT,
                label: 'Table CSV'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlineHtml;

            form.addField({
                id: 'upload_rs_csv',
                label: 'IMPORT EXCEL',
                type: ui.FieldType.FILE
            }); 

            var searched_address = search.load({
                id: 'customsearch_smc_address',
                type: search.Type.CUSTOMER
            });
            
            searched_address.filters.push(search.createFilter({
                name: 'internalid',
                operator: search.Operator.IS,
                values: 7595
            }));

            var resultSet_addresses = searched_address.run();
            

            

            resultSet_addresses.each(function(searchResult_address) {

                log.debug({
                    title: 'entire thing',
                    details: searchResult_address
                });
                var addr_id = searchResult_address.getValue({name: 'addressinternalid', join: 'Address'});
                //potentially might be getText
                var addr_label = searchResult_address.getValue({ name: "addresslabel",join: "Address" });
                
                //sometimes is postal i.e. PO and else it is "ground floor etc"
                var addr1 = searchResult_address.getValue({name: 'address1',join: 'Address'});
                //street num name
                var addr2 = searchResult_address.getValue({name: 'address2',join: 'Address'});

                var city = searchResult_address.getValue({name: 'city',join: 'Address'});

                var state = searchResult_address.getValue({name: 'state',join: 'Address'});

                var zip = searchResult_address.getValue({name: 'zipcode',join: 'Address'});
                var lat = searchResult_address.getValue({name: 'custrecord_address_lat',join: 'Address'});
                var lon = searchResult_address.getValue({name: 'custrecord_address_lon',join: 'Address'}).toLowerCase();
                
                log.debug({ title: 'addr_id', details: addr_id });
                log.debug({ title: 'addr_label', details: addr_label });
                log.debug({ title: 'addr1', details: addr1 });
                log.debug({ title: 'addr2', details: addr2 });
                log.debug({ title: 'addr2', details: addr2 });
                log.debug({ title: 'city', details: city });
                log.debug({ title: 'state', details: state });
                log.debug({ title: 'zip', details: zip });

                return true;
            });

            form.clientScriptFileId = 4602504; //PROD = 4620348, SB = 4602504

            context.response.writePage(form);


        } else {
            var fileObj = context.request.files.upload_rs_csv;
            var zee = context.request.parameters.zee;
              
            if (!isNullorEmpty(fileObj)) {
                fileObj.folder = 2644902; //2644902, 2661964
                var file_type = fileObj.fileType;
                if (file_type == 'CSV') {
                    file_type == 'csv';


                    var file_name = zee + '_zee_rs_upload' + '.' + file_type;
                } 
                fileObj.name = file_name;

                if (file_type == 'CSV') {
                    // Create file and upload it to the file cabinet.
                    var f_id = fileObj.save();
                } else {
                    throw error.create({
                        message: 'Must be in CSV format',
                        name: 'CSV_ERROR',
                        notifyOff: true
                    });
                }
            }

            log.debug({
                title: 'fileid',
                details: f_id
            });

            log.debug({
                title: 'zee',
                details: zee
            });
            // CALL SCHEDULED SCRIPT
            var scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
            scriptTask.scriptId = 'customscript_ss_import_excel';
            scriptTask.deploymentId = 'customdeploy_ss_import_excel';
            scriptTask.params = {
                custscript_import_excel_file_id: f_id,
                custscript_import_excel_zee_id: zee
            };
            scriptTask.submit();
            

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
    function franchiseeDropdownSection() {
        var inlineQty = '<div class="form-group container zee_dropdown_section >';

        inlineQty += '<div class="row">';
        // Franchisee dropdown field
        inlineQty += '<div class="col-xs-12 zee_dropdown_div">';
        inlineQty += '<div class="input-group col-xs-12">';
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
            inlineQty += '<option value="' + opt_zee_id + '" ' + selected_option + '>' + opt_zee_name + '</option>';
            return true;
        });

        inlineQty += '</select>';
        inlineQty += '</div></div></div></div>';

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
