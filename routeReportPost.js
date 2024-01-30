document.addEventListener("DOMContentLoaded", function() {
   // Retrieve elements
   var apiKeyInput = document.getElementById('apiKeyInput');
   var setApiKeyButton = document.getElementById('setApiKeyButton');
   var clearApiKeyButton = document.getElementById('clearApiKeyButton');
   var expandButton = document.getElementById('expandButton');
   var requestUrlInput = document.getElementById('requestUrlInput');
   var requestUrlSubmitButton = document.getElementById('requestUrlSubmitButton');
   var requestUrlCopyButton = document.getElementById('requestUrlCopyButton');
   var statusDiv = document.getElementById('statusDiv');
   var errorDiv = document.getElementById('errorDiv');

   // Event listener for 'SET' button
   setApiKeyButton.addEventListener('click', function() {
      var apiKey = apiKeyInput.value.trim();
      if (apiKey !== '') {
         // Store API key in localStorage
         localStorage.setItem('apiKey', apiKey);

         // Disable input
         apiKeyInput.disabled = true;
      }
   });

   // Event listener for 'CLEAR' button
   clearApiKeyButton.addEventListener('click', function() {
      // Clear API key from localStorage
      localStorage.removeItem('apiKey');

      // Clear input value and enable input
      apiKeyInput.value = '';
      apiKeyInput.disabled = false;
   });

   // Event listener for 'EXPAND' button
   expandButton.addEventListener('click', function() {
      toggleVisibility();
   });

   // Event listener for 'SUBMIT' button
   requestUrlSubmitButton.addEventListener('click', function() {
      makeApiCall();
   });

   // Event listener for 'COPY' button
   requestUrlCopyButton.addEventListener('click', function() {
      // Select the input field
      requestUrlInput.select();

      try {
         // Copy the selected text to the clipboard
         document.execCommand('copy');
         console.log('Text copied to clipboard');
      } catch (err) {
         console.error('Unable to copy text to clipboard', err);
      }

      // For modern browsers, use the Clipboard API
      if (navigator.clipboard) {
         navigator.clipboard.writeText(requestUrlInput.value)
            .then(() => {
               console.log('Text successfully copied to clipboard');
            })
            .catch(err => {
               console.error('Unable to copy text to clipboard', err);
            });
      }
   });

   // Add event listener for COPY button
   var responseCopyButton = document.getElementById('responseCopyButton');
   responseCopyButton.addEventListener('click', function() {
      // Select the response text area
      var responseTextArea = document.getElementById('responseTextArea');
      responseTextArea.select();

      try {
         // Copy the selected text to the clipboard
         document.execCommand('copy');
         console.log('Response copied to clipboard');
      } catch (err) {
         console.error('Unable to copy response to clipboard', err);
      }
   });
   

   // Add event listener for SAVE button
   var responseSaveButton = document.getElementById('responseSaveButton');
   responseSaveButton.addEventListener('click', function() {
      // Retrieve the response text
      var responseText = document.getElementById('responseTextArea').value;

      // Create a Blob containing the response text
      var blob = new Blob([responseText], { type: 'json' });

      // Create a link element for downloading
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);

      // Prompt user to save the file
      link.download = 'api_response.json';
      link.click();

      console.log('Response saved to file');
   });


   // Event listeners for checkbox changes in reportTypeDiv and queryParamsDiv
   var reportTypeCheckboxes = document.querySelectorAll('.checklistContainer input[type="checkbox"]');
   reportTypeCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', updateRequestUrl);
   });

   var queryParamsCheckboxes = document.querySelectorAll('#queryParams input[type="checkbox"]');
   queryParamsCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', updateRequestUrl);
   });

   // Event listener for the hazMatTypes multi-selection dropdown
   var hazMatTypesDropdown = document.getElementById('hazMatTypes');
   hazMatTypesDropdown.addEventListener('change', updateRequestUrl);
   

   // Function to construct and display the API request URL
   function updateRequestUrl() {
      var baseUrl = 'https://pcmiler.alk.com/apis/rest/v1.0/Service.svc/route/routeReports';

      

      // Get report types
      var reportTypes = Array.from(reportTypeCheckboxes)
         .filter(function (checkbox) {
            return checkbox.checked;
         })
         .map(function (checkbox) {
            return (checkbox.name);
         });

      console.log('Checked Report Types = ' + reportTypes);

      // Get query parameters
      var queryParams = Array.from(queryParamsCheckboxes)
         .filter(function (checkbox) {
            return checkbox.checked;
         })
         .map(function (checkbox) {
            // Reference the id of the corresponding element in column 3
            var paramValue = document.getElementById(checkbox.name).value;
            return checkbox.name + '=' + encodeURIComponent(paramValue);
         });

      console.log('Checked Parameters = ' + queryParams);

      // Get HazMat Types checkbox
      var hazMatTypesCheckbox = document.querySelector('input[name="hazMatTypes"]');

      // Check if HazMat Types checkbox is checked
      if (hazMatTypesCheckbox.checked) {
         // Get selected values from hazMatTypes multi-selection dropdown
         var hazMatTypesValues = Array.from(hazMatTypesDropdown.selectedOptions)
            .map(function (option) {
                  return encodeURIComponent(option.value);
            });

         // Construct the hazMatTypes parameter
         var hazMatTypesParam = hazMatTypesValues.length > 0 ? 'hazMatTypes=' + hazMatTypesValues.join(',') : '';

         // Remove any existing hazMatTypesParam
         queryParams = queryParams.filter(function (param) {
            return !param.startsWith('hazMatTypes=');
         });

         // Append hazMatTypesParam directly without 'hazMatTypes=' prefix
         if (hazMatTypesParam !== '') {
            queryParams.push(hazMatTypesParam);
         }
      }

      // Combine all parameters
      var allParams = [];

      // Add reportTypes if selected
      if (reportTypes.length > 0) {
         allParams.push('reports=' + reportTypes.join(','));
      }

      // Add other queryParams
      if (queryParams.length > 0) {
         allParams = allParams.concat(queryParams);
      }

      // Construct the request URL
      var fullUrl = baseUrl;

      // Add '?' only if there are parameters
      if (allParams.length > 0) {
         fullUrl += '?' + allParams.join('&');
      }

      console.log(fullUrl);

      // Display the request URL
      requestUrlInput.value = fullUrl;
   }


   // Function to make the API call
   function makeApiCall() {
      // Retrieve API key from apiKeyInput within apiKeyInputDiv
      var apiKeyInput = document.getElementById('apiKeyInput');
      var apiKey = apiKeyInput.value.trim();
  
      // Check if API key is available
      if (!apiKey) {
          errorDiv.textContent = 'API Key is missing. Please set the API Key first.';
          return;
      }


      // Set up headers
      var myHeaders = new Headers();
      myHeaders.append('Authorization', apiKey);
      myHeaders.append('Content-Type', 'application/json'); // Set the content type to JSON


      // Set up request options
      var requestOptions = {
         method: 'POST',
         headers: myHeaders,
         body: JSON.stringify(/* your request body data here */),  // Add this line with your actual request body
         redirect: 'follow'

      

      // Create the JSON body
      var requestBody = JSON.stringify(params);

      // Set up request options
      var requestOptions = {
         method: 'POST', // Change the method to POST
         headers: myHeaders,
         body: requestBody, // Set the JSON body
         redirect: 'follow'
      };

      // Clear status and error messages
      statusDiv.textContent = '';
      errorDiv.textContent = '';

      // Make the API call
      fetch(url.origin, requestOptions) // Use the origin of the URL for the endpoint
         .then(response => {
            // Display status code
            statusDiv.textContent = 'Status Code: ' + response.status;

            // Check for successful response
            if (response.ok) {
                  return response.text();
            } else {
                  // Display error message
                  return response.text().then(error => {
                     errorDiv.textContent = 'Error: ' + error;
                  });
            }
         })
         .then(data => {
            // Display the response
            var responseTextArea = document.getElementById('responseTextArea');
            responseTextArea.textContent = data;
         })
         .catch(error => {
            // Display error if fetch fails
            errorDiv.textContent = 'Fetch Error: ' + error;
         });
   }


   function constructRequestBody() {
      // Construct the JSON structure for the request body based on your requirements
      var requestBody = {
          "ReportRoutes": [{
              "RouteId": "",
              "Stops": [{
                  "Address": {
                      "StreetAddress": "",
                      "City": "Philadelphia",
                      "State": "PA",
                      "Zip": "19123",
                      "County": "",
                      "Country": "US",
                      "SPLC": "",
                      "CountryPostalFilter": 0,
                      "AbbreviationFormat": 0,
                      "StateName": "",
                      "StateAbbreviation": "",
                      "CountryAbbreviation": ""
                  },
                  "Coords": {
                      "Lat": "",
                      "Lon": ""
                  },
                  "Region": 4,
                  "Label": "Origin",
                  "PlaceName": "",
                  "PlaceId": "",
                  "Costs": {
                      "CostOfStop": 0,
                      "HoursPerStop": 0,
                      "Loaded": true,
                      "OnDuty": true,
                      "UseOrigin": true
                  },
                  "ID": "Origin",
                  "IsViaPoint": false,
                  "SideOfStreetAdherence": 0
              },
              // ... Add more stops as needed
              ]
          }]
      };


   // Function to toggle visibility of additional query parameters
   function toggleVisibility() {
      var additionalRows = document.querySelectorAll('.hidden-row');
      additionalRows.forEach(function(row) {
         row.style.display = (row.style.display === 'none' || row.style.display === '') ? 'table-row' : 'none';
      });

      // Update the button text based on the current state
      var expandButton = document.getElementById('expandButton');
      var buttonText = expandButton.textContent === 'Expand' ? 'Collapse' : 'Expand';
      expandButton.textContent = buttonText;
   }

   
});

