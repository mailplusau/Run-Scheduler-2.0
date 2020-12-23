/**
 
 *@NApiVersion 2.0
 *@NScriptType Suitelet

 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/format'], 
function(ui, email, runtime, search, record, http, log, redirect, format) {
    var baseURL = 'https://1048144.app.netsuite.com';
    if (runtime.EnvType == "SANDBOX") {
        baseURL = 'https://1048144-sb3.app.netsuite.com';
    }
    var zee = 0;
    var role = runtime.getCurrentUser().role;
    if (role == 1000) {
        //Franchisee
        zee = runtime.getCurrentUser();
    }

    function onRequest(context) {  
        
        if (context.request.method === 'GET') {
            var form = ui.createForm({
                title: 'Run Scheduler - Customer List View'
            });
            
            var inlineQty = '';
            var inlinehtml2 = '';

            inlinehtml2 += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2392606&c=1048144&h=a4ffdb532b0447664a84&_xt=.css"/><script type="text/javascript"  src="https://cdn.datatables.net/v/dt/dt-1.10.18/datatables.min.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css"';
            inlinehtml2 += 'rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css">';

            inlinehtml2 += '<div class="se-pre-con"></div><button type="button" class="btn btn-sm btn-info instruction_button" data-toggle="collapse" data-target="#demo">Click for Instructions</button><div id="demo" style="background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:96%;position:absolute" class="collapse"><b><u>IMPORTANT INSTRUCTIONS:</u></b><ul><li>Functionalities available on the Customer listing/table:<ul><li><b>Sort</b><ul><li>Click on column headers to sort customer list according to the values in the columns. This is default to "Customer Name".</li><li>Hold "Shift" and click another column to sort according to multiple columns.</li></u';
            inlinehtml2 += 'l></li><li><b>Search</b><ul><li>You can search for specific customer by typing into the "Search" field</li></ul></li></ul></li><li>Clickable Actions available per customer:</li><ul><li><button type="button" class="btn-xs btn-success " disabled ><span class="span_class glyphicon glyphicon-plus"></span></button> - <ul><li>On click, outlines the Service(s) and Price(s) for each customer.</li></ul></li><li><input type="button" class="btn-xs btn-danger" disabled value="SETUP STOP" /> - <ul><li>The Service for the customer has not been scheduled. On clicking, will allow you to schedule the Service</li></ul></li><li><input type="button" class="btn-xs btn-primary" disabled value="EDIT STOP" /> - <ul><li>Ability to Edit the Schedule of the Service for the customer.</li></ul></li></ul></li></ul></ul></div>';

            
            //If role is Admin or System Support, dropdown to select zee
            if (role != 1000) {

                inlinehtml2 += '<div class="col-xs-4 admin_section" style="width: 20%;left: 40%;position: absolute;"><b>Select Zee</b> <select class="form-control zee_dropdown" >';
        
                //WS Edit: Updated Search to SMC Franchisee (exc Old/Inactives)
                //Search: SMC - Franchisees
                var searched_zee = search.load({
                    id: 'customsearch_smc_franchisee',
                    type: 'partner'
                });
        
                var resultSet_zee = searched_zee.run();
        
                var count_zee = 0;
        
                var zee_id;
        
                inlinehtml2 += '<option value=""></option>'
        
                resultSet_zee.each(function(searchResult_zee) {
                    zee_id = searchResult_zee.getValue('internalid');
                    // WS Edit: Updated entityid to companyname
                    zee_name = searchResult_zee.getValue('companyname');
        
                    if (request.getParameter('zee') == zee_id) {
                        inlinehtml2 += '<option value="' + zee_id + '" selected="selected">' + zee_name + '</option>';
                    } else {
                        inlinehtml2 += '<option value="' + zee_id + '">' + zee_name + '</option>';
                    }
        
                    return true;
                });
        
                inlinehtml2 += '</select></div>';
            }

            if (!isNullorEmpty(context.request.parameters.zee)) {
                zee = context.request.parameters.zee;
            }
  
            form.addField({
                id: 'zee',
                type: ui.FieldType.TEXT,
                label: 'zee'
            }).updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            }).defaultValue = parseInt(zee);

            form.addField({
                id: 'custpage_html2',
                type: ui.FieldType.INLINEHTML,
                label: 'custpage_html2'
            }).setPadding(1).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlinehtml2;
            
            inlineQty += '<br><br><table border="0" cellpadding="15" id="customer" class="display tablesorter table table-striped" cellspacing="0" style="width: 100%;"><thead style="color: white;background-color: #607799;"><tr><th><b>SELECT</b></th><th><b>EDIT</b></th><th><b>ID</b></th><th><b>CUSTOMER NAME</b></th><th class=""><b>CUSTOMER SCHEDULED</b></th></tr></thead>';

             /**
             * Description - Get the list of Customer that have Trial or Signed Status for a particular zee
             */

            // var zeeRecord = nlapiLoadRecord('partner', parseInt(zee));
            // var name = zeeRecord.getFieldValue('companyname');

            // inlineQty += '</tbody>';
            inlineQty += '</table><br/>';

            form.addField({
                id: 'preview_table',
                type: ui.FieldType.INLINEHTML,
                label: 'preview_table'
            }).updateLayoutType({
                layoutType: ui.FieldLayoutType.OUTSIDEBELOW
            }).updateBreakType({
                breakType: ui.FieldBreakType.STARTROW
            }).defaultValue = inlineQty;
            form.addButton({
                id : 'back',
                label : 'Back',
                functionName : 'onclick_back()'
            });

            form.clientScriptFileId = 3060183;
            context.response.writePage(form);
  
        } else {

        }
    }

    
    /**
     * [getDate description] - Function to get the current date
     * @return {[String]} [description] - Return the current date
     */
    function getDate() {
        var date = new Date();
        if (date.getHours() > 6) {
            date.setDate(date.getDate() + 1); 
        }

        format.format({
            value: date,
            type: format.Type.DATE,
            timezone: format.Timezone.AUSTRALIA_SYDNEY
        })

        return date;
    }

    function getStartDate() {
        var today = format.parse({value:getDate(), type: format.Type.DATE})

        var startdate = today.setDate(today.getDate() + 2);
        
        if (startdate.getDay() == 0) {
            startdate = startdate.setDate(startdate.getDate() + 1); 
        } else if (startdate.getDay() == 6) {
            startdate = startdate.setDate(startdate.getDate() + 2);
        }
        return format.format({
            value: startdate,
            type: format.Type.DATE,
            timezone: format.Timezone.AUSTRALIA_SYDNEY
        });
    }

    function isNullorEmpty(strVal) {
        return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
    }
    
    return {
        onRequest: onRequest
    };

});