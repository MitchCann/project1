
var border;
var countryName;
let iso2CountryCode;
let visitedCountries = [];
let popup;
let currentLat;
let currentLng;

$(document).ready(function(){
    
    //Preloader
    $(".preloader").hide(); 

})

// Leaflet Map 
var mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
var mapboxAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
var token = 'pk.eyJ1IjoicGV6IiwiYSI6ImNraWFlcDVsYTBpMW0ycnJreWRxdnNneXIifQ._2kq-bt8gs8Wmc5JIY-6NQ'

var dark = L.tileLayer(mapboxUrl, {id: 'mapbox/dark-v10', tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: token}),
    streets   = L.tileLayer(mapboxUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: token});
    
var baseMaps = {
    "Streets": streets,
    
};

var map = L.map('map', {
    
    zoom: 10,
    layers: [streets]
}).fitWorld();

L.control.layers(baseMaps).addTo(map);

var myCircles = new L.featureGroup().addTo(map);


// Select Dropdown
$.ajax({
	url: "./php/geoJson.php",
	type: 'POST',
	dataType: "json",
	
	success: function(result) {
		console.log('populate options' , result);
        if (result.status.name == "ok") {
            for (var i=0; i<result.data.border.features.length; i++) {
                        $('#selCountry').append($('<option>', {
                            value: result.data.border.features[i].properties.iso_a3,
                            text: result.data.border.features[i].properties.name,
                        }));
                    }
                }
            //sort options alphabetically
            $("#selCountry").html($("#selCountry option").sort(function (a, b) {
                return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
            }))
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
            console.log(jqXHR.responseText);
        }
      });

// User Location
const successCallback = (position) => {
  $.ajax({
      url: "./php/openCage.php",
      type: 'GET',
      dataType: 'json',
      data: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
      },

      success: function(result) {
          console.log('openCage PHP',result);
          currentLat = result.data[0].geometry.lat;
          currentLng = result.data[0].geometry.lng;
           
          $("selectOpt select").val(result.data[0].components["ISO_3166-1_alpha-3"]);
          
          let currentCountry = result.data[0].components["ISO_3166-1_alpha-3"];
          $("#selCountry").val(currentCountry).change();
      
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
          console.log(jqXHR.responseText);
      }
  }); 
}

const errorCallback = (error) => {
          console.error(error);
          console.log(error.responseText);
}
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);


// Border

$('#selCountry').on('change', function() {
  let countryCode = $('#selCountry').val();
  let countryOptionText= $('#selCountry').find('option:selected').text();
   
  // Check if country in array
  if(!visitedCountries.includes(countryOptionText)) {
    visitedCountries.push(countryOptionText)
    console.log('Array visited countries', visitedCountries)
  }
  
  //Home Default 
  const showFirstTab = function () {
         $('#nav-home-tab').tab('show');
       }
  showFirstTab();

  $.ajax({
    url: "./php/geoJson.php",
    type: 'POST',
    dataType: 'json',
    success: function(result) {

        console.log('all borders result', result);

        if (map.hasLayer(border)) {
            map.removeLayer(border);
        }
          
        let countryArray = [];
        let countryOptionTextArray = [];
    
        for (let i = 0; i < result.data.border.features.length; i++) {
            if (result.data.border.features[i].properties.iso_a3 === countryCode) {
                countryArray.push(result.data.border.features[i]);
            }
        };
        for (let i = 0; i < result.data.border.features.length; i++) {
            if (result.data.border.features[i].properties.name === countryOptionText) {
                countryOptionTextArray.push(result.data.border.features[i]);
            }
        };
     
        border = L.geoJSON(countryOptionTextArray[0], {
                                                        color: 'lime',
                                                        weight: 3,
                                                        opacity: 0.75
                                                        }).addTo(map);
        let bounds = border.getBounds();
            map.flyToBounds(bounds, {
            padding: [35, 35], 
            duration: 2,
            });                          
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(textStatus, errorThrown);
      console.log(jqXHR.responseText);
    }
  }); 
});



// Map click event
map.on('click', function(e) {        
  var popLocation = e.latlng;
  
  $.ajax({
    url: "./php/openCage.php",
    type: 'GET',
    dataType: 'json',
    data: {
        lat: popLocation.lat,
        lng: popLocation.lng,
    },

    success: function(result) {

        if (result.data[0].components["ISO_3166-1_alpha-3"]) {
            console.log('openCage PHP',result);
            //console.log(typeof result);
            currentLat = result.data[0].geometry.lat;
            currentLng = result.data[0].geometry.lng;

            
           

            $("selectOpt select").val(result.data[0].components["ISO_3166-1_alpha-3"]);
            
            let currentCountry = result.data[0].components["ISO_3166-1_alpha-3"];
            $("#selCountry").val(currentCountry).change();
        }
        else {
            console.log("clicked on water")
            console.log('openCage PHP',result);

            currentLat = result.data[0].geometry.lat;
            currentLng = result.data[0].geometry.lng;

            

            L.popup()
                .setLatLng([currentLat, currentLng])
                .setContent("<div><strong>" + result.data[0].formatted + "</strong></div>")
                .openOn(map);
        }
     
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
        console.log(jqXHR, errorThrown)
        console.log(jqXHR.responseText);
       
    }
  });        

});


// fetching info from Geonames API
$('#btnRun').click(function() {

    /*$("#country-capital").html( 
        "<td>London</td>" 
        ); */


    $.ajax({
        url: "./php/countryCode.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: currentLat,
            lng: currentLng,
        },
        success: function(result) {
          
            console.log('restCountries', result);
                
            if (result.status.name == "ok") {
                iso2CountryCode = result.data;
                //console.log(result.data);
                console.log(jqXHR.responseText);
                $('#country-capital').html('<td>London</td>');
                
            
        
            console.log(jqXHR.responseText);

            console.log(errorThrown);
                    
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
            console.log(jqXHR.responseText);
            
        }  
    }); 
  });



