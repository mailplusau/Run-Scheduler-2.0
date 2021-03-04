 /**
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * 
 * Description: Import an excel file of stops to add into an existing run
 * @Last Modified by: Sruti Desai
 * 
 */

define(['N/error', 'N/runtime', 'N/search', 'N/url', 'N/record', 'N/format', 'N/email', 'N/currentRecord'],
function(error, runtime, search, url, record, format, email, currentRecord ) {
        var baseURL = 'https://1048144.app.netsuite.com';
        if (runtime.EnvType == "SANDBOX") {
            baseURL = 'https://1048144-sb3.app.netsuite.com';
        }
        var role = runtime.getCurrentUser().role;

        var load_record_interval;
        var tableSet = [];

        /**
         * On page initialisation
         */
        function pageInit() {
            //$('.progress').hide();

            var currentScript = currentRecord.get();            
            var ss_id = currentScript.getValue({fieldId: 'scheduled_script'});
            if (!isNullorEmpty(ss_id)) {
                $('.progress').addClass('show');
                setTimeout(function(){ deleteMove(); }, 1000);
            }
        
            $(document).on('change', '.zee_dropdown', function(event) {
                var zee = $(this).val();
                var zee_text = $(this).text();
                var currentScript = currentRecord.get();            

                //prod = 1180, sb = 
                //var url = 'https://1048144-sb3.app.netsuite.com' + "/app/site/hosting/scriptlet.nl?script=1180&deploy=1";
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1180&deploy=1";

                url += "&zee=" + zee + "";
                window.location.href = url;

                currentScript.setValue({
                    fieldId: 'zee',
                    value: zee
                });  

               
            });

            $(document).on('change', '.run_dropdown', function(event) {
                var run = $(this).val();
                console.log(run);
                var zee = $('option:selected', '.zee_dropdown').val();
                var currentScript = currentRecord.get();
                //prod = 1180, sb =

                //var url = 'https://1048144-sb3.app.netsuite.com' + "/app/site/hosting/scriptlet.nl?script=1180&deploy=1";
                var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1180&deploy=1";

                url += "&zee=" + zee + "&run=" + run;
            
                window.location.href = url;
                currentScript.setValue({
                    fieldId: 'zee',
                    value: zee
                });   
                currentScript.setValue({
                    fieldId: 'run',
                    value: run
                }); 
            });


        }

        function deleteMove() {
            var currentScript = currentRecord.get();

            var freqSearch = search.load({
                id: 'customsearch_rp_servicefreq',
                type: 'customrecord_service_freq'
            });

            freqSearch.filters.push(search.createFilter({
                name: 'custrecord_service_freq_run_plan',
                operator: search.Operator.IS,
                values: currentScript.getValue({fieldId: 'run'})
            }));
            
            var initial_count = freqSearch.runPaged().count;
            console.log("initial", initial_count);
            var totalTime = initial_count*300;
            console.log("total", totalTime);
            var elem = document.getElementById("progress-records");
            var width = 0;
            var id = setInterval(frame, totalTime);
            function frame() {
                if (width >= 98) {
                    clearInterval(id);
                    deleteProgress(initial_count);
                    
                } else {
                    width++;
                    elem.style.width = width + "%";
                    elem.innerHTML = width + "%";
                }
            }
            
        }
        function deleteProgress(initial_count) {
            
            var currentScript = currentRecord.get();
            var run_id = currentScript.getValue({fieldId: 'run'});

            var freqSearch = search.load({
                id: 'customsearch_rp_servicefreq',
                type: 'customrecord_service_freq'
            });

            freqSearch.filters.push(search.createFilter({
                name: 'custrecord_service_freq_run_plan',
                operator: search.Operator.IS,
                values: run_id
            }));
            var initial_count = freqSearch.runPaged().count;
            console.log("initial_count", Math.floor(initial_count)); 
            var search_count = freqSearch.runPaged().count;
            console.log("search_count", search_count);

            if (search_count != 0) {
                setTimeout(deleteProgress, 10000);
            } else {
                $(".progress-bar").removeClass("progress-bar-warning");
                $(".progress-bar").addClass("progress-bar-success");
                progressBar2(search_count, initial_count);
            }
                
            
        }

        function progressBar2(search_count, initial_count) {
            console.log("in progress");
            if (search_count == 0) {
                console.log("finished");
                var percentage = (1/1)*100;
                var roundedPercent = Math.round(percentage * 10) / 10;
                var elem = document.getElementById("progress-records");   
                elem.style.width = roundedPercent + '%'; 
                elem.innerHTML = roundedPercent * 1  + '%';
            } else {
                console.log("in else");
                search_count = initial_count - search_count;
                var percentage = (search_count/initial_count)*100;
                console.log(percentage);
                var roundedPercent = Math.round(percentage * 10) / 10;
                var elem = document.getElementById("progress-records");   
                elem.style.width = roundedPercent + '%'; 
                elem.innerHTML = roundedPercent * 1  + '%';
            }

        }
        

        function saveRecord(context) {
            var currentScript = currentRecord.get();            
            if(isNullorEmpty(currentScript.getValue({fieldId: 'zee'}))) {
                alert('Please select a zee first');
            } else if (isNullorEmpty(currentScript.getValue({fieldId: 'run'}))) {
                alert('Please select a run first');
            } else {
                alert('Please wait while run ' + currentScript.getValue({fieldId: 'run'}) + ' is being deleted');
                return true;
            }
            
        }


        function onclick_importExcel() {
            var url = baseURL + "/app/site/hosting/scriptlet.nl?script=1151&deploy=1";
            window.open(url, "_blank");
        }



        function isNullorEmpty(strVal) {
            return (strVal == null || strVal == '' || strVal == 'null' || strVal == undefined || strVal == 'undefined' || strVal == '- None -');
        }


        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            onclick_importExcel: onclick_importExcel,
            
            
        };  
    }

    
);