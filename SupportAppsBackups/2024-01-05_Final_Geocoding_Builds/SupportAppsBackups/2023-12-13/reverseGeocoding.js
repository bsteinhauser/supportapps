// --------------------------------------------------------------------------------
// |  Any documentation references to 'myMap' need to be change to 'map'  |
// --------------------------------------------------------------------------------



// Initialize Map
TrimbleMaps.APIKey = 'C74FC1CEB64D0F40A0F590D80D90AB6F';
var map = new TrimbleMaps.Map({
  container: "mapContainer",
  center: new TrimbleMaps.LngLat( -74.570762,40.215147),
  zoom: 10,
  style: TrimbleMaps.Common.Style.BASIC
});
     
map.on('load', function() {
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
  const errorDiv = document.createElement('errorDiv');
  errorDiv.id = 'errorDiv';
  errorDiv.style.color = 'red';
  errorDiv.textContent = 'This is the error div'; // Add content for testing

  const statusDiv = document.getElementById('statusDiv');
  statusDiv.id = 'statusDiv';
  // statusDiv.textContent = 'This is the status div'; // Add content for testing
});



// Function to handle user input of coordinates
function handleManualInput() {
  const coordinateInput = document.getElementById('coordinateInput').value;
  const [latInput, lonInput] = coordinateInput.split(',');

  const lat = parseFloat(latInput);
  const lon = parseFloat(lonInput);

  if (isNaN(lat) || isNaN(lon)) {
    showError('Invalid latitude or longitude values entered.');
    return;
  }

  // Define headers for the API request
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "C74FC1CEB64D0F40A0F590D80D90AB6F");

  // Define options for the API request
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  // Append the coordinates to the URL
  const apiUrl = `https://pcmiler.alk.com/apis/rest/v1.0/service.svc/locations/reverse?Coords=${lon},${lat}`;

  // Call the function to make API call with headers and options
  makeAPICall(apiUrl, requestOptions);
}




// Add event listener for the text input
document.getElementById('coordinateInput').addEventListener('change', handleManualInput);

// Add event listener for the button
document.getElementById('submitCoordinatesButton').addEventListener('click', handleManualInput);




// Function to make API call with headers and options
function makeAPICall(apiUrl, requestOptions) {
  // Make the API call using fetch with headers and options
  fetch(apiUrl, requestOptions)
    .then(response => {
      // Handle the response
      if (response.ok) {
        // If the response status is 200 (OK), show 'Success'
        // statusDiv.textContent = 'Success';
        return response.json();
      } else {
        // If the response status is not 200, show the error code and message
        errorDiv.textContent = `Error: ${response.status} - ${response.statusText}`;
      }
    })
    // Handle additional error information and extract address
    .then(data => {
      if (data && data.Errors && data.Errors.length > 0) {
        const error = data.Errors[0];
        const errorMessage = `Error ${error.Code}: ${error.Description}`;
        document.getElementById('errorDiv').textContent = errorMessage;
      }

      // Extract address from the API response (modify as needed)
      const address = {
        lat: parseFloat(data.Coords.Lat),
        lon: parseFloat(data.Coords.Lon),
        address: `${data.Address.StreetAddress}`,
        city: `${data.Address.City}`,
        state: `${data.Address.State}`,
        zip: `${data.Address.Zip}`,
        country: `${data.Address.Country}`
      };

      // Plot markers on the map for each address (modify as needed)
      const marker = new TrimbleMaps.Marker()
        .setLngLat([address.lon, address.lat])
        .setPopup(new TrimbleMaps.Popup().setHTML(address.address + '<br>' + address.city + ', ' + address.state + ' ' + address.zip))
        .addTo(map)
        .togglePopup(); // Automatically show the popup

      // Fly to the marker's location on the map
      map.flyTo({
        center: [address.lon, address.lat],
        zoom: 15, // You can adjust the zoom level as needed
        essential: true
      });
    })
    // // Handle non-JSON response and general errors
    // .catch(error => {
    //   console.error('API error:', error);
    //   showError('Error making API call.');
    // });
}

// Function to show API call error message
function showError(message) {
  const errorDiv = document.getElementById('errorDiv');
  errorDiv.textContent = message;
}