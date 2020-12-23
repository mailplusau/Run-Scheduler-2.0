/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * 
 * Module Description
 * 
 * NSVersion    Date                        Author         
 * 2.00         2020-10-22 09:33:08         Anesu
 *
 * Description: Automation of Debt Collection Process   
 * 
 * @Last Modified by:   Anesu
 * @Last Modified time: 2020-10-22 16:49:26
 * 
 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime', 'N/search', 'N/record', 'N/http', 'N/log', 'N/redirect', 'N/task'],
    function(ui, email, runtime, search, record, http, log, redirect, task) {
        var zee = 0;
        var role = 0;

        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }

        role = runtime.getCurrentUser().role;

        if (role == 1000) {
            zee = runtime.getCurrentUser().id;
        } else if (role == 3) { //Administrator
            zee = 6; //test
        } else if (role == 1032) { // System Support
            zee = 425904; //test-AR
        }

        var table;

        var currRecord = currentRecord.get();

        function pageInit(){
            //To show loader while the page is laoding
            $(window).load(function() {
                // Animate loader off screen
                $(".se-pre-con").fadeOut("slow");;
            });

            
            var main_table = document.getElementsByClassName("uir-outside-fields-table");
            var main_table2 = document.getElementsByClassName("uir-inline-tag");
        
            for (var i = 0; i < main_table.length; i++) {
                main_table[i].style.width = "50%";
            }
        
            for (var i = 0; i < main_table2.length; i++) {
                main_table2[i].style.position = "absolute";
                main_table2[i].style.left = "10%";
                main_table2[i].style.width = "80%";
                main_table2[i].style.top = "275px";
            }

            $(document).on('click', '.same_as_above', function() {
                if ($(this).is(':checked')) {
                    console.log('test')
            
                    var prev_closing_date = $(this).closest('tr').prev('tr').find('.closing_date').val();
                    var prev_opening_date = $(this).closest('tr').prev('tr').find('.opening_date').val();
            
                    console.log($(this).prev('tr'))
            
                    console.log(prev_opening_date)
                    console.log(prev_closing_date)
            
                    $(this).closest('tr').find('.closing_date').val(prev_closing_date);
                    $(this).closest('tr').find('.opening_date').val(prev_opening_date);
                } else {
                    $(this).closest('tr').find('.closing_date').val(null);
                    $(this).closest('tr').find('.opening_date').val(null);
                }
            })
        }

        function onclick_back() {
            var params = {
            }
            params = JSON.stringify(params);
            // var upload_url = baseURL + nlapiResolveURL('SUITELET', 'customscript_sl_full_calendar', 'customdeploy_sl_full_calender') + '&unlayered=T&custparam_params=' + params + '&zee=' + parseInt(nlapiGetFieldValue('zee'));
            var upload_url = baseURL + url.resolveScript({
                deploymentId: 'customdeploy_sl_full_calender',
                scriptId: 'customscript_sl_full_calendar'
            }) + '&unlayered=T&custparam_params=' + params + '&zee=' + parseInt(currRecord.getValue({ fieldId: 'zee'}));
            window.open(upload_url, "_self", "height=750,width=650,modal=yes,alwaysRaised=yes");
        }
        
        function GetFormattedDate(stringDate) {
        
            var todayDate = nlapiStringToDate(stringDate);
            var month = pad(todayDate.getMonth() + 1);
            var day = pad(todayDate.getDate());
            var year = (todayDate.getFullYear());
            return year + "-" + month + "-" + day;
        }
        
        function saveRecord() {
        
            var entity_id_elem = document.getElementsByClassName("entity_id");
            var closing_date_elem = document.getElementsByClassName("closing_date");
            var opening_date_elem = document.getElementsByClassName("opening_date");
        
            for (var i = 0; i < entity_id_elem.length; i++) {
        
                var cust_id = closing_date_elem[i].getAttribute('data-custid');
        
                var closing_date = closing_date_elem[i].value;
                var opening_date = opening_date_elem[i].value;
        
                console.log(closing_date);
                console.log(opening_date);
                console.log(cust_id);
        
                if (!isNullorEmpty(closing_date) && !isNullorEmpty(opening_date)) {
        
                    // var serviceFreqSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_rp_cust_hol_closure_dates');
                    // var addFilterExpression = new nlobjSearchFilter('custrecord_service_leg_franchisee', null, 'anyof', zee);
                    // var addFilterExpression = new nlobjSearchFilter('custrecord_service_leg_customer', null, 'anyof', cust_id);
                    // serviceFreqSearch.addFilter(addFilterExpression);
                    // var resultSetCustomer = serviceFreqSearch.runSearch();
                    var serviceFreqSearch = search.load({ type: 'customrecord_service_leg', id: 'customsearch_rp_cust_hol_closure_dates'})
                    var addFilterExpression_1 = search.createFilter({
                        name: 'custrecord_service_leg_franchisee',
                        join: null,
                        operator: search.Operator.ANYOF,
                        values: zee
                    });
                    var addFilterExpression_2 = search.createFilter({
                        name: 'custrecord_service_leg_customer',
                        join: null,
                        operator: search.Operator.ANYOF,
                        values: cust_id
                    });
                    serviceFreqSearch.filters.push(addFilterExpression_1);
                    serviceFreqSearch.filters.push(addFilterExpression_2);
                    var resultSetCustomer = serviceFreqSearch.run();

                    resultSetCustomer.each(function(searchResult) {
                        // var service_freq_id = searchResult.getValue("id");
                        var service_leg_internalid = searchResult.getValue({ fieldId: "internalid"});
        
                        var customer_id = searchResult.getValue({ fieldId: "internalid", join: "CUSTRECORD_SERVICE_LEG_CUSTOMER"});
                        var entity_id = searchResult.getValue({ fieldId: "entityid", join: "CUSTRECORD_SERVICE_LEG_CUSTOMER"});
                        var companyname = searchResult.getValue({ fieldId: "companyname", join: "CUSTRECORD_SERVICE_LEG_CUSTOMER"});
        
                        // var service_leg_record = nlapiLoadRecord('customrecord_service_leg', service_leg_internalid);
                        var service_leg_record = search.load({ type: 'customrecord_service_leg', id: service_leg_internalid});
        
                        var splitClosingDate = closing_date.split('-');
                        var closingdate = splitClosingDate[2] + '/' + splitClosingDate[1] + '/' + splitClosingDate[0];
        
                        var splitOpeningDate = opening_date.split('-');
                        var openingdate = splitOpeningDate[2] + '/' + splitOpeningDate[1] + '/' + splitOpeningDate[0];
        
                        console.log(closing_date);
                        console.log(opening_date);
        
                        service_leg_record.setValue('custrecord_service_leg_closing_date', closingdate);
                        service_leg_record.setValue('custrecord_service_leg_opening_date', openingdate);
        
                        // nlapiSubmitRecord(service_leg_record);
                        service_leg_record.save();
        
                        return true;
                    });
                }
        
            }
        
            return true;
        }

        function isNullorEmpty(val) {
            if (val == '' || val == null) {
                return true;
            } else {
                return false;
            }
        }

        // function AddJavascript(jsname, pos) {
        //     var tag = document.getElementsByTagName(pos)[0];
        //     var addScript = document.createElement('script');
        //     addScript.setAttribute('type', 'text/javascript');
        //     addScript.setAttribute('src', jsname);
        //     tag.appendChild(addScript);
        // }

        return {
            onRequest: onRequest
        }
});

