
// Subscribe to the stations db
Meteor.subscribe('stations');

// Set default search variables
Session.setDefault('unit', 'F');
Session.setDefault('minTemp', 23);
Session.setDefault('maxTemp', 25);
Session.setDefault('month', ((new Date()).getMonth()));

// Search Form View

Template.searchForm.helpers({
	minTemp : function(){ return Session.get('minTemp'); },
	maxTemp : function(){ return Session.get('maxTemp'); },
	prettyMinTemp : function(){ return utils.prettyTemp(Session.get('minTemp')); },
	prettyMaxTemp : function(){ return utils.prettyTemp(Session.get('maxTemp')); }
});

Template.searchForm.events({
	
	'change input[data-field=tempRange]' : function(e){
	
		// Grab the slider values
		var sliderVal = $('input[data-field=tempRange]').val().split(',');
		var newMinTemp = parseInt(sliderVal[0], 10);
		var newMaxTemp = parseInt(sliderVal[1], 10);
		
		$('span[data-label=sliderMin]').html(utils.prettyTemp(newMinTemp));
		$('span[data-label=sliderMax]').html(utils.prettyTemp(newMaxTemp));
		
//	},
//	'click .slider-handle' : function(e){
		
		// Grab the slider values
		var sliderVal = $('input[data-field=tempRange]').val().split(',');
		var newMinTemp = parseInt(sliderVal[0], 10);
		var newMaxTemp = parseInt(sliderVal[1], 10);
		
		// Hold onto the old values
		var oldMinTemp = Session.get('minTemp');
		var oldMaxTemp = Session.get('maxTemp');
		
		// Save the new values
		Session.set('minTemp', newMinTemp);
		Session.set('maxTemp', newMaxTemp);
		
		// Update the markers if the values changed
		if(oldMinTemp != newMinTemp || oldMaxTemp != newMaxTemp){
			setMarkers();
		}
		
	},
	
	'change select[data-field=month]' : function(e){
		
		Session.set('month', parseInt(e.target.value, 10));
		
		setMarkers();
		
	}
	
});

Template.searchForm.rendered = function(){
	
	// Init the slider
	// Also, fire the slide event once so the labels get drawn
	$('input[data-field=tempRange]')
		.slider({})
		.change();
	
	
};

// Map View

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
	
	// Build the query
	var avgTempKey = 'avgt.' + month;
	var whereFields = {};
	whereFields[avgTempKey] = {
		$gte : minTemp,
		$lte : maxTemp
	};
	
	// Run the query
	var results = Stations.find(whereFields).fetch();
	
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

// Navbar View

Template.navbar.helpers({
	'unit' : function(){
		return Session.get('unit');
	}
});

Template.navbar.events({
	'click .unitBtn' : function(e){
		e.preventDefault();
		
		Session.set('unit', $(e.target).attr('data-unit'));
		
		// Redraw labels
		// TODO this is kind of messy doing it here
		$('input[data-field=tempRange]').change();
		
	}
});


// Meteor Startup

Meteor.startup(function(){
	
	// Setup MapBox
	L.mapbox.accessToken = 'pk.eyJ1IjoicmV1c3RsZSIsImEiOiJESzd6YVRnIn0.Hh9AwQw1X0PR_TOewZMMzA';
	window.map = L.mapbox.map('mapContainer', 'reustle.l8pgo1n1').setView([29, -26], 2);
	window.mapMarkers = L.mapbox.featureLayer().addTo(map);

	// Draw the markers initially
	setTimeout(setMarkers, 1000);
	
	// Set the default value for the month select field
	$('select[data-field=month]').val(Session.get('month'));
	
});

// General Utils

MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

utils = {
	cToF : function(temp){
		return Math.round(temp * 9 / 5 + 32);
	},
	prettyTemp : function(temp){
		if(Session.get('unit') == 'F'){
			return utils.cToF(temp) + '&deg;F';
		}
		return Math.round(temp) + '&deg;C';
	}
}

// Spacebars helpers

UI.registerHelper('equals', function (a, b) {
	return a === b;
});

