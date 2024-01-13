// Initialize Map
TrimbleMaps.APIKey = '5528D85F750D8A4E8D1D070688808F08';
var map = new TrimbleMaps.Map({
  container: "mapContainer",
  center: new TrimbleMaps.LngLat(-73.985661,40.748430),
  region: TrimbleMaps.Common.Region.WW,
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
  //errorDiv.textContent = 'This is the error div'; // Add content for testing

  const statusDiv = document.getElementById('statusDiv');
  statusDiv.id = 'statusDiv';
  //statusDiv.textContent = 'This is the status div'; // Add content for testing
});



// Define request headers and options
var myHeaders = new Headers();
myHeaders.append("Authorization", "5528D85F750D8A4E8D1D070688808F08");
// You added the API key from the demo website here.
// You need to figure out why your API key doesn't work 
// Your Key 5528D85F750D8A4E8D1D070688808F08.  DEmo api: 0D8BA43647605743A5FB4B225664EF0F

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

// Get user input
document.getElementById("submitButton").addEventListener("click", function() {
  var street = document.getElementById("streetInput").value;
  var city = document.getElementById("cityInput").value;
  var state = document.getElementById("stateInput").value;
  var postCode = document.getElementById("postCodeInput").value;
  var country = document.getElementById("countryInput").value;
  // var region = document.getElementById("regionInput").value;

  // Construct the base URL
  var baseUrl = "https://pcmiler.alk.com/apis/rest/v1.0/service.svc/locations";

  // Create an array to store non-empty parameters
  var params = [];

  // Check and add parameters with values to the array
  if (street.trim() !== "") {
      params.push("street=" + encodeURIComponent(street));
  }
  if (city.trim() !== "") {
      params.push("city=" + encodeURIComponent(city));
  }
  if (state.trim() !== "") {
      params.push("state=" + encodeURIComponent(state));
  }
  if (postCode.trim() !== "") {
      params.push("postCode=" + encodeURIComponent(postCode));
  }
  if (country.trim() !== "") {
      params.push("country=" + encodeURIComponent(country));
  }
  // if (region.trim() !== "") {
  //     params.push("region=" + encodeURIComponent(region));
  // }
    // else {
    //   // If 'region' is blank, append a default value of "region=3"
    //   params.push("region=3");
    // }

  // Combine the base URL with the parameters
  var apiUrl = baseUrl + (params.length > 0 ? "?" + params.join("&") : "");

  // Log the request URL
  console.log(apiUrl);

  // Make the API Call
  makeAPICall(apiUrl, requestOptions);

  // Define the makeAPICall Function
  function makeAPICall(apiUrl, requestOptions) {
  // Make the API call using fetch with headers and options
  fetch(apiUrl, requestOptions)
    .then(response => response.json())
    .then(data => handleApiResponse(data))
    .catch(error => console.error('Error:', error));
  }

  // Define the handleApiResponse Function
  function handleApiResponse(responseData) {
    const response = responseData[0]; // Assuming the response is an array with a single object
    const errorsArray = response.Errors;
    const errorsDescriptionArray = response.Description; 
    const responseAddress = response.Address;
    const errorDiv = document.getElementById('errorDiv');
    const statusDiv = document.getElementById('statusDiv');

    if (((errorsArray && errorsArray.length > 0) || errorsDescriptionArray) && responseAddress == null) {
      const error = errorsArray && errorsArray.length > 0 ? errorsArray[0] : null;
      const errorCode = error ? error.Code : null;
      const errorDescription = error ? error.Description : errorsDescriptionArray;

      errorDiv.innerHTML = `Error Code: ${errorCode}, Description: ${errorDescription}`;
      statusDiv.innerHTML = ''; // Clear the statusDiv if there's an error
    } else {
      errorDiv.innerHTML = ''; // Clear the errorDiv if there are no errors
      statusDiv.innerHTML = 'Success';

      // Extract address from the API response (modify as needed)
      const address = {
        lat: parseFloat(response.Coords.Lat),
        lon: parseFloat(response.Coords.Lon),
        address: response.Address.StreetAddress,
        city: response.Address.City,
        state: response.Address.State,
        zip: response.Address.Zip,
        country: response.Address.Country
      };

      // Use the 'address' object as needed
      console.log(address);

      // Plot markers on the map for each address (modify as needed)
      const marker = new TrimbleMaps.Marker()
        .setLngLat([address.lon, address.lat])
        .setPopup(new TrimbleMaps.Popup().setHTML(address.address + '<br>' + address.city + ', ' + address.country + ', ' + address.zip + '<br>' + address.lat + ',' + address.lon))
        .addTo(map)
        .togglePopup(); // Automatically show the popup

      // Fly to the marker's location on the map
      map.flyTo({
        center: [address.lon, address.lat],
        zoom: 10, // You can adjust the zoom level as needed
        essential: true
      });
    }
  }
})