// We create the tile layers that will be the selectable backgrounds of our map.
console.log("Basic Visualization");
// Create a L.tilelayer() using the 'mapbox/light-v10' map id
var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});
var map = L.map("mapid", {
    center: [
      40.7, -94.5
    ],
    zoom: 3
  });
// Here we make an AJAX call that retrieves our earthquake geoJSON data.
grayscaleMap.addTo(map)
    tileSize: 512;
// Create a L.tilelayer() using the 'mapbox/satellite-v9' map id
 var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

// Create a L.tilelayer() using the 'mapbox/satellite-v9' map id
var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
});


// We create the layers for our two different sets of data, earthquakes and
// tectonicplates.

var tectonicPlates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();


// Create a basemaps object for the three tileLayers from above. 
// The key should be a human readable name for the tile layer, and the value should be a tileLayer variable
var baseMaps = {
  "Satellite": satelliteMap,
  "Grayscale": grayscaleMap,
  "Outdoors": outdoorsMap
};
// We define an object that contains all of our overlays. Any combination of
// these overlays may be visible at the same time!


var overlayMaps = {
  "Earthquakes": earthquakes,
  "Fault Lines": tectonicPlates,
};
// Add a L.control.layers() object and pass in the baseMaps and overlayMaps, and then .addTo myMap
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Use d3.json() to call the API endpoint for earthquake geoJSON data, 
// .then() fire off an anonymous function that takes a single argument `data`.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then (function(Data) {

    // Function to Determine Size of Marker Based on the Magnitude of the Earthquake
    function markerSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 3;
    }
  // Function to Determine Style of Marker Based on the Magnitude of the Earthquake
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: chooseColor(feature.properties.mag),
      color: "#000000",
      radius: markerSize(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
}
// Function to Determine Color of Marker Based on the Magnitude of the Earthquake
function chooseColor(magnitude) {
    switch (true) {
    case magnitude > 5:
        return "#581845";
    case magnitude > 4:
        return "#900C3F";
    case magnitude > 3:
        return "#C70039";
    case magnitude > 2:
        return "#FF5733";
    case magnitude > 1:
        return "#FFC300";
    default:
        return "#DAF7A6";
    }
}
// Create a GeoJSON Layer Containing the Features Array on the earthquakeData Object
L.geoJSON(Data, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
    },
    style: styleInfo,
    // Function to Run Once For Each feature in the features Array
    // Give Each feature a Popup Describing the Place & Time of the Earthquake
    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h4>Location: " + feature.properties.place + 
        "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
        "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
// Add earthquakeData to earthquakes LayerGroups 
}).addTo(earthquakes);
// Add earthquakes Layer to the Map
earthquakes.addTo(map);

var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
// Retrieve platesURL (Tectonic Plates GeoJSON Data) with D3
d3.json(platesURL).then (function(plateData) {
    console.log(plateData)
    // Create a GeoJSON Layer the plateData
    L.geoJson(plateData, {
        color: "#DC143C",
        weight: 2
    // Add plateData to tectonicPlates LayerGroups 
    }).addTo(tectonicPlates);
    // Add tectonicPlates Layer to the Map
    tectonicPlates.addTo(map);
});

// Set Up Legend
var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"), 
    magnitudeLevels = [0, 1, 2, 3, 4, 5];

    div.innerHTML += "<h3>Magnitude</h3>"

    for (var i = 0; i < magnitudeLevels.length; i++) {
        div.innerHTML +=
            '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
            magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
    }
    return div;
};
// Add Legend to the Map
legend.addTo(map);
});

