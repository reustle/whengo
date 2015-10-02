// Map
var drawMarkers = function(){
	
	// Create a new mapbox FeatureCollection
	var markers = {
		type: 'FeatureCollection',
		features : []
	};
	
	// Create and insert a marker for each result airport into the FeatureCollection
	_.each(airportData, function(airport){
		
		markers.features.push({
			type : 'Feature',
			geometry : {
				type : 'Point',
				coordinates : [
					airport.lon,
					airport.lat
				]
			},
			properties : {
				title : airport.ci + ', ' + airport.co,
				airportId : airport.ia
			}
		});
	});
	
	// Update map with the new data
	mapMarkers.setGeoJSON(markers);
	
	// Apply the filters
	filterMarkers();
	
};

var queryAirports = function(){
	// Query the airports and apply the filters
	
	// Load the search parameters
	var minTemp = Session.get('minTemp');
	var maxTemp = Session.get('maxTemp');
	var monthIndex = Session.get('month');
	
	// Don't try if the map isn't loaded yet
	if(!window.map){
		return [];
	}
	
	// Load the map visible area (bounds)
	var mapNW = map.getBounds().getNorthWest();
	var mapSE = map.getBounds().getSouthEast();
	
	//console.log('NW', mapNW);
	//console.log('SE', mapSE);
	
	// Filter the full airports list
	var results = _.filter(airportData, function(airport){
		
		var tooHot = (airport.th[monthIndex] > maxTemp);
		var tooCold = (airport.tl[monthIndex] < minTemp);
		
		if(tooHot || tooCold){
			return false;
		}
		
		if(airport.lon < mapNW.lng && airport.lon > mapSE.lng){
			return false;
		}
		if(airport.lat < mapSE.lat && airport.lat > mapNW.lat){
			return false;
		}
		
		return true;
		
	});
	
	console.log('Results:', results.length);
	
	return _.pluck(results, 'ia');
	
}

var filterMarkers = function(){
	// Filter the mapbox marker instances
	
	
	// Get the list of airports we should show
	var visibleAirports = queryAirports();
	
	console.time('filterMarkers');
	
	// Filter the markers
	mapMarkers.setFilter(function(marker){
		if(visibleAirports.indexOf(marker.properties.airportId) !== -1){
			return true;
		}
	});
	
	console.timeEnd('filterMarkers');
	
	
	// Create a custom marker icon (circle icon)
	var markerIcon = L.icon({
		iconUrl : 'http://whengo.io/dot.png',
		iconSize : [9,9],
		iconAnchor : [4,4]
	});
	
	console.time('setIcons');
	
	// Go through and update each icon with the new icon (lame)
	map.eachLayer(function(marker){
		if(marker.setIcon){
			marker.setIcon(markerIcon);
		}
	});
	
	console.timeEnd('setIcons');
	
}

var setDefaults = function(){
	if(!Session.get('minTemp')){
		Session.set('minTemp', 22);
	}
	if(!Session.get('maxTemp')){
		Session.set('maxTemp', 35);
	}
	if(!Session.get('month')){
		Session.set('month', ((new Date()).getMonth()));
	}

}

// Init

setDefaults();

// Initialize MapBox
L.mapbox.accessToken = 'pk.eyJ1IjoicmV1c3RsZSIsImEiOiJESzd6YVRnIn0.Hh9AwQw1X0PR_TOewZMMzA';
var map = L.mapbox.map('mapContainer', 'reustle.l8pgo1n1').setView([11.86, 0], 2);
var mapMarkers = L.mapbox.featureLayer().addTo(map);

// Add mapbox events
map.on('dragend', function(){
	filterMarkers();
});
map.on('zoomend', function(){
	filterMarkers();
});
map.on('resize', function(){
	filterMarkers();
});

mapMarkers.on('click', function(e){
	// TODO
	//Session.set('selectedAirport', e.layer.feature.properties.airportId);
	//Modal.show('detailsModal');
});

var drawOnceMapboxExists = function(){
	if(typeof(window.mapMarkers) != 'undefined'){
		drawMarkers();
	}else{
		setTimeout(drawOnceMapboxExists, 250);
	}
}

drawOnceMapboxExists();

