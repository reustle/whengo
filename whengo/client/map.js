// Helpers

Template.map.helpers({
	renderLimit : function(){ return Session.get('renderLimit'); },
	minTemp : function(){ return utils.prettyTemp(Session.get('minTemp')); },
	maxTemp : function(){ return utils.prettyTemp(Session.get('maxTemp')); },
	monthName : function(){ return MONTHS[Session.get('month')]; }
});

// General Map Helpers

filterMarkers = function(){
	
	// Create our filter list
	var visibleAirports = queryAirports();
	
	// Filter the markers
	mapMarkers.setFilter(function(marker){
		if(visibleAirports.indexOf(marker.properties.airportId) !== -1){
			return true;
		}
	});
	
	// Create a custom marker icon (circle icon)
	var markerIcon = L.icon({
		iconUrl : 'http://whengo.io/dot.png',
		iconSize : [9,9],
		iconAnchor : [4,4]
	});
	
	// Go through and update each icon with the new icon (lame)
	map.eachLayer(function(marker){
		if(marker.setIcon){
			marker.setIcon(markerIcon);
		}
	});
	
}

// General Functions

queryAirports = function(){
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
	var mapNW = window.map.getBounds().getNorthWest();
	var mapSE = window.map.getBounds().getSouthEast();
	
	// Build the query
	var whereFields = {
		
		'loc.lon' : {
			$gte : mapNW.lng,
			$lte : mapSE.lng
		},
		
		'loc.lat' : {
			$gte : mapSE.lat,
			$lte : mapNW.lat
		}
		
	};
	
	// Make sure the avg high is within the range
	whereFields[('th.' + monthIndex)] = {
		$gte : cToF(minTemp),
		$lte : cToF(maxTemp)
	};
	
	// Make sure the avg low is within the range
	whereFields[('tl.' + monthIndex)] = {
		$gte : cToF(minTemp),
		$lte : cToF(maxTemp)
	};
	
	// Run the query
	var results = Airports.find(whereFields, {
		
		fields : {
			_id : 1
		},
		
		limit : Session.get('renderLimit'),
		
		sort : {
			// TODO Sort by population
			ci : 1
		}
		
	}).fetch();
	
	var idsList = _.pluck(results, '_id');
	
	return idsList;
	
}

drawMarkers = function(){
	
	// Load all airports
	var results = Airports.find().fetch();
	
	// Create a new mapbox FeatureCollection
	var markers = {
		type: 'FeatureCollection',
		features : []
	};
	
	// Create and insert a marker for each result airport into the FeatureCollection
	_.each(results, function(airport){
		
		markers.features.push({
			type : 'Feature',
			geometry : {
				type : 'Point',
				coordinates : [
					airport.loc.lon,
					airport.loc.lat
				]
			},
			properties : {
				title : airport.ci + ', ' + airport.co,
				airportId : airport._id
			}
		});
	});
	
	// Update map with the new data
	mapMarkers.setGeoJSON(markers);
	
	// Apply the filters
	filterMarkers();
	
};

