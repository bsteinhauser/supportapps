document.addEventListener("DOMContentLoaded", function() {
   // Retrieve elements
   var apiKeyInput = document.getElementById('apiKeyInput');
   var setApiKeyButton = document.getElementById('setApiKey');
   var clearApiKeyButton = document.getElementById('clearApiKey');
   var requestUrlInput = document.getElementById('requestUrlInput');
   var requestUrlSubmitButton = document.getElementById('requestUrlSubmit');
   var requestUrlCopyButton = document.getElementById('requestUrlCopy');
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

   // Event listeners for checkbox changes in reportTypeDiv and queryParamsDiv
   var reportTypeCheckboxes = document.querySelectorAll('.checklistContainer input[type="checkbox"]');
   reportTypeCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', updateRequestUrl);
   });

   var queryParamsCheckboxes = document.querySelectorAll('#queryParams input[type="checkbox"]');
   queryParamsCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', updateRequestUrl);
   });

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

   // Function to construct and display the API request URL
   function updateRequestUrl() {
      var baseUrl = 'https://pcmiler.alk.com/apis/rest/v1.0/Service.svc/route/routeReports';

      // Get report types
      var reportTypes = Array.from(reportTypeCheckboxes)
         .filter(function (checkbox) {
            return checkbox.checked;
         })
         .map(function (checkbox) {
            return checkbox.name;
         });

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

      // Construct the request URL
      var fullUrl = baseUrl;
      if (reportTypes.length > 0) {
         fullUrl += '?reportTypes=' + reportTypes.join(',');
      }
      if (queryParams.length > 0) {
         fullUrl += (reportTypes.length > 0 ? '&' : '?') + queryParams.join('&');
      }

      // Display the request URL
      requestUrlInput.value = fullUrl;
   }

   // Function to make the API call
   function makeApiCall() {
      // Retrieve API key
      var apiKey = localStorage.getItem('apiKey');

      // Check if API key is available
      if (!apiKey) {
         errorDiv.textContent = 'API Key is missing. Please set the API Key first.';
         return;
      }

      // Construct the request URL
      updateRequestUrl();

      // Set up headers
      var myHeaders = new Headers();
      myHeaders.append("Authorization", apiKey);

      // Set up request options
      var requestOptions = {
         method: 'GET',
         headers: myHeaders,
         redirect: 'follow'
      };

      // Clear status and error messages
      statusDiv.textContent = '';
      errorDiv.textContent = '';

      // Make the API call
      fetch(requestUrlInput.value, requestOptions)
         .then(response => {
            // Display status code
            statusDiv.textContent = 'Status Code: ' + response.status;

            // Check for successful response
            if (response.ok) {
               return response.json();
            } else {
               // Display error message
               return response.text().then(error => {
                  errorDiv.textContent = 'Error: ' + error;
               });
            }
         })
         .then(data => {
            // Display the response
            var responseDiv = document.getElementById('responseDiv');
            responseDiv.textContent = JSON.stringify(data, null, 2);
         })
         .catch(error => {
            // Display error if fetch fails
            errorDiv.textContent = 'Fetch Error: ' + error;
         });
   }

   
});

