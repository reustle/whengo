Template.mapView.helpers({
	
	stationCount : function(){
		
		var minTemp = Session.get('minTemp');
		var maxTemp = Session.get('maxTemp');
		var month = Session.get('month');
		
		var avgTempKey = 'avgt.' + month;
		
		var whereFields = {};
		whereFields[avgTempKey] = {
			$gte : minTemp,
			$lte : maxTemp
		};
		
		return Stations.find(whereFields).count();
		
	},
	
	totalStationCount : function(){ return Stations.find().count(); },
	unit : function(){ return Session.get('unit'); },
	minTemp : function(){ return utils.prettyTemp(Session.get('minTemp')); },
	maxTemp : function(){ return utils.prettyTemp(Session.get('maxTemp')); },
	monthName : function(){ return MONTHS[Session.get('month')]; }
});

setMarkers = function(){
	
	// Load the search parameters
	var minTemp = Session.get('minTemp');
	var maxTemp = Session.get('maxTemp');
	var month = Session.get('month');
	
	// Load the map visible area (bounds)
	var mapNW = map.getBounds().getNorthWest();
	var mapSE = map.getBounds().getSouthEast();
	
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
	
	var avgTempKey = 'avgt.' + month;
	whereFields[avgTempKey] = {
		$gte : minTemp,
		$lte : maxTemp
	};
	
	// Run the query
	var results = Stations.find(whereFields, { limit : 500 }).fetch();
	
	// Create a new mapbox FeatureCollection
	var markers = {
		type: 'FeatureCollection',
		features : []
	};
	
	// Create a custom marker icon (circle icon)
	var markerIcon = L.icon({
		iconUrl : 'http://whengoio.meteor.com/dot.png',
		iconSize : [9,9],
		iconAnchor : [4,4]
	});
	
	// Create and insert a marker for each result station into the featurecollection
	_.each(results, function(station){
		
		var thisTempC = parseInt(station.avgt[month], 10);
		var thisTempF = utils.cToF(thisTempC);
		
		markers.features.push({
			type : 'Feature',
			geometry : {
				type : 'Point',
				coordinates : [
					station.loc.lon,
					station.loc.lat
				]
			},
			properties : {
				title : station.name,
				// Hardcode them since they won't be reactive to unit changes
				description : thisTempF + '&deg;F (' + thisTempC + '&deg;C)'

			}
		});
	});
	
	// Update map with the new data
	mapMarkers.setGeoJSON(markers);
	
	// Go through and update each icon with the new icon (lame)
	map.eachLayer(function(marker){
		if(marker.setIcon){
			marker.setIcon(markerIcon);
		}
	});
	
};

