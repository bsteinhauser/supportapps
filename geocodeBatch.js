// Initial Map
TrimbleMaps.APIKey = '5528D85F750D8A4E8D1D070688808F08';
var map = new TrimbleMaps.Map({
    container: "mapContainer",
    center: new TrimbleMaps.LngLat(-73.985661, 40.748430),
    zoom: 10,
    style: TrimbleMaps.Common.Style.BASIC,
    region: TrimbleMaps.Common.Region.WW
});
map.on('load', function () {
    //customize map layers and features here

    // map menu
    myMapMenusOptions = {
        showBaseStyles: true,
        hideStyles: ["Accessible Dark", "Accessible Light"],
        hideLayers: ["Weather Cloud", "3D Buildings"],
    };

    // add 
    const placeClickControl = new TrimbleMaps.PlaceClickControl();
    map.addControl(placeClickControl);

    // Menu location
    var myMapMenusControl = new TrimbleMapsControl.MapMenus(myMapMenusOptions);
    map.addControl(myMapMenusControl, "top-left");
});

// Create the errorDiv and statusDiv elements on page load
document.addEventListener('DOMContentLoaded', function () {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'errorDiv';
    errorDiv.style.color = 'red';

    const statusDiv = document.createElement('div');
    statusDiv.id = 'statusDiv';

    const addressListDiv = document.createElement('div');
    addressListDiv.id = 'addressListDiv';

    document.body.appendChild(errorDiv);
    document.body.appendChild(statusDiv);
    document.body.appendChild(addressListDiv);
});

// Function to handle the selected CSV file
function handleFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const csvData = e.target.result;
            processData(csvData);
        };

        reader.readAsText(file);
    } else {
        alert('Please select a CSV file.');
    }
}

// Function to find the index of a header in the headers array
function findHeaderIndex(headers, targetHeaders) {
  for (let i = 0; i < headers.length; i++) {
      const cleanedHeader = headers[i].toLowerCase().trim(); // Trim and convert to lowercase
      if (targetHeaders.some(targetHeader => cleanedHeader.includes(targetHeader))) {
          return i;
      }
  }
  return -1;
}

// Function to process CSV data and make API call for reverse geocoding
function processData(csvData) {
  // Parse CSV data
  const rows = csvData.split('\n');
  const headers = rows[0].split(',');

  let addressIndex = findHeaderIndex(headers, ['address', 'street address']);
  let cityIndex = findHeaderIndex(headers, ['city']);
  let stateIndex = findHeaderIndex(headers, ['state']);
  let zipIndex = findHeaderIndex(headers, ['post code', 'zip code']);
  let countryIndex = findHeaderIndex(headers, ['country']);

  console.log('Headers:', headers);
  console.log('Country Index:', countryIndex);

  // if ((cityIndex === -1 && stateIndex === -1) || zipIndex === -1)) {
  //   showError('Required columns not found in the CSV file. You must have (\'city\' and \'state\') or \'post code\'.');
  //   return;
  // } 

  const locations = [];

  for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',').map(value => value.trim()); // Trim each value

      // Add console.log to debug
      console.log('Row values:', values);

      const address = values[addressIndex] || '';
      const city = values[cityIndex] || '';
      const state = values[stateIndex] || '';
      const zip = values[zipIndex] || '';
      const country = countryIndex !== -1 ? (values[countryIndex] || '').trim() : ''; // Include country if available

      locations.push({
          "Address": {
              "StreetAddress": address,
              "City": city,
              "State": state,
              "Zip": zip,
              "Country": country
          },
          "Region": countryIndex === -1 ? 4 : undefined,
          "GeoList": false,
          "MaxResults": null,
          "CitySearchFilter": 0
      });
}

const apiData = {
    "Locations": locations
};

    // Make API call for reverse geocoding
    fetch('http://pcmiler.alk.com/apis/rest/v1.0/service.svc/locations/address/batch', {
        method: 'POST',
        headers: {
            'Authorization': '5528D85F750D8A4E8D1D070688808F08',
            'Content-Type': 'application/json'
        },
        
        body: JSON.stringify(apiData)
    })
        .then(response => {
            const statusDiv = document.getElementById('statusDiv');

            if (response.ok) {
                // If the response status is 200 (OK), show 'Success'
                statusDiv.textContent = 'Success';
            } else {
                // If the response status is not 200, show the error code and message
                statusDiv.textContent = `Error: ${response.status} - ${response.statusText}`;
            }

            return response.json();
        })
        .then(data => {
            console.log('API response:', data);

            // Extract addresses from the API response
            const addresses = data.map(result => {
              const lat = result.Coords ? parseFloat(result.Coords.Lat) : null;
              const lon = result.Coords ? parseFloat(result.Coords.Lon) : null;
              const address = result.Address ? result.Address.StreetAddress || null : null;
              const city = result.Address ? result.Address.City || null : null;
              const state = result.Address ? result.Address.State || null : null;
              const zip = result.Address ? result.Address.Zip || null : null;
              const country = result.Address ? result.Address.Country || null : null;
          
              return {
                  lat,
                  lon,
                  address,
                  city,
                  state,
                  zip,
                  country
              };
            });

            // Log Request Body
            console.log('Request Body',apiData);

            // Log Addresses
            console.log('Extracted addresses:', addresses);

            // Display addresses on the browser screen
            displayAddresses(addresses);

            // Plot markers on the map for each address
            addresses.forEach(function (address) {
                var marker = new TrimbleMaps.Marker()
                    .setLngLat([address.lon, address.lat])
                    .setPopup(new TrimbleMaps.Popup().setHTML(address.address + '<br>' + address.city + ', ' + address.state + ' ' + address.zip))
                    .addTo(map);
            });

        })
        .catch(error => {
            console.error('API error:', error);
            showError('Error making API call.');
        });

        // Function to show error message
        function showError(message) {
          const errorDiv = document.getElementById('errorDiv');
          errorDiv.textContent = message;
        }
        // Helper function to find the index of a header in a case-insensitive manner
        function findHeaderIndex(headers, possibleHeaders) {
          for (let i = 0; i < headers.length; i++) {
              const lowerHeader = headers[i].toLowerCase().trim();
              if (possibleHeaders.includes(lowerHeader)) {
                  return i;
              }
          }
          return -1;
        }

        // Function to display addresses in a table on the browser screen
        function displayAddresses(addresses) {
          const addressListDiv = document.getElementById('addressListDiv');
          addressListDiv.innerHTML = '';

          // Add export button to export table as CSV
          const exportButton = document.createElement('button');
          exportButton.textContent = 'Export CSV';
          exportButton.addEventListener('click', function () {
            exportTableToCSV('Results.csv');
          });

          // Add <h3>Results:</h3> to the addressListDiv
          const resultsHeader = document.createElement('h3');
          resultsHeader.textContent = 'Results:';
          addressListDiv.appendChild(resultsHeader);

          // Space between <h3> and export button
          resultsHeader.style.marginRight = '10px'; 

          // Append the export button to the right of the header using inline-block
          exportButton.style.display = 'inline-block';
          resultsHeader.style.display = 'inline-block';
          addressListDiv.appendChild(exportButton);

          // Add line break
          const lineBreak = document.createElement('br');
          addressListDiv.appendChild(lineBreak);

          // Add text
          const messageText = document.createTextNode('Click an address to view on map');
          addressListDiv.appendChild(messageText);

          // Set a fixed height for the container to enable scrolling
          addressListDiv.style.maxHeight = '400px'; // Adjust the height as needed
          addressListDiv.style.overflowY = 'auto'; // Ensure that a scrollbar appears when content overflows

          // Create a table element
          const table = document.createElement('table');
          table.classList.add('address-table'); // Optional: Add a class for styling

          // Create table headers
          const headerRow = document.createElement('tr');
          const headers = ['Address', 'City', 'State', 'Zip', 'Country', 'Latitude', 'Longitude'];
          headers.forEach(headerText => {
              const header = document.createElement('th');
              header.textContent = headerText;
              headerRow.appendChild(header);
          });
          table.appendChild(headerRow);


        // Create variables to store the currently active marker and popup
        let activeMarker = null;
        let activePopup = null;

          // Populate table rows with addresses
          addresses.forEach((address, index) => {
            const row = document.createElement('tr');

              // Create table cells for each property
              const properties = ['address', 'city', 'state', 'zip', 'country', 'lat', 'lon'];
              properties.forEach(prop => {
                  const cell = document.createElement('td');
                  cell.textContent = address[prop];
                  row.appendChild(cell);
              });

              // Add CSS style for pointer cursor
              row.style.cursor = 'pointer';

              // Create a marker for the address
              const marker = new TrimbleMaps.Marker()
              .setLngLat([address.lon, address.lat])
              .setPopup(new TrimbleMaps.Popup().setHTML(address.address + '<br>' + address.city + ', ' + address.state + ' ' + address.zip + '<br>' + address.lat + ',' + address.lon))
              .addTo(map)


              // Add click event listener to toggle the popup for the marker
              row.addEventListener('click', function () {
                // Close the currently active popup (if any)
                if (activePopup) {
                  activePopup.remove();
                }
              
                const popup = marker.getPopup();

                // If the popup is not open, show it
                if (!popup.isOpen()) {
                  popup.addTo(map);
                  // Update the currently active marker and popup
                  activeMarker = marker;
                  activePopup = popup;
                } 
                else {
                  // If the popup is already open, set activeMarker and activePopup to null
                  activeMarker = null;
                  activePopup = null;
                }

                // Fly to the marker's location on the map
                map.jumpTo({
                  center: [address.lon, address.lat],
                  zoom: 15, // You can adjust the zoom level as needed
                  essential: true
                })
              });

            // Append the row to the table
            table.appendChild(row);
          });

          // Append the table to the addressListDiv
          addressListDiv.appendChild(table);


          
        }

        // Function to export table data as CSV
        function exportTableToCSV(filename) {
          console.log('Export button clicked');
          const rows = document.querySelectorAll('.address-table tr');
          const csvContent = [];

          // Extract headers
          const headerRow = rows[0];
          const headers = Array.from(headerRow.querySelectorAll('th')).map(header => header.textContent);
          csvContent.push(headers.join(','));

          // Extract data rows
          for (let i = 1; i < rows.length; i++) {
            const rowData = Array.from(rows[i].querySelectorAll('td')).map(cell => cell.textContent);
            csvContent.push(rowData.join(','));
          }

          const csvString = csvContent.join('\n');
          const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

          const link = document.createElement('a');
          if (navigator.msSaveBlob) {
            // IE 10+
            navigator.msSaveBlob(blob, filename);
          } else {
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }

}
