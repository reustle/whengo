
// Subscribe to the stations db
Meteor.subscribe('stations');

// Set default search variables
Session.setDefault('unit', 'C');
Session.setDefault('minTemp', 23);
Session.setDefault('maxTemp', 25);
Session.setDefault('month', ((new Date()).getMonth()));

// Search Form View

Template.searchForm.helpers({
	'unit' : function(){
		return Session.get('unit');
	},
	'minTemp' : function(){
		return Session.get('minTemp');
	},
	'maxTemp' : function(){
		return Session.get('maxTemp');
	}
});

Template.searchForm.events({
	'click button' : function(){
		
		var sliderVal = $('input[data-field=tempRange]').val().split(',');
		
		var minTemp = parseInt(sliderVal[0], 10);
		var maxTemp = parseInt(sliderVal[1], 10);
		var month = document.querySelector('[data-field=month]').value;
		
		Session.set('minTemp', parseFloat(minTemp));
		Session.set('maxTemp', parseFloat(maxTemp));
		Session.set('month', parseInt(month, 10));
		
		setMarkers();
	}
});

Template.searchForm.rendered = function(){
	
	var processTemp = function(temp){
		if(Session.get('unit') == 'C'){
			return temp;
		}
		
		return Math.round(temp * 9 / 5 + 32);
	}
	
	// Do this here because we don't want it to be reactive
	$('span[data-label=minTemp]').html(processTemp(Session.get('minTemp')));
	$('span[data-label=maxTemp]').html(processTemp(Session.get('maxTemp')));
	
	$('input[data-field=tempRange]')
		.slider({})
		.on('slide', function(slideEvent){
			var sliderVal = $('input[data-field=tempRange]').val().split(',');
			
			$('span[data-label=minTemp]').html(processTemp(sliderVal[0]));
			$('span[data-label=maxTemp]').html(processTemp(sliderVal[1]));
		});
	
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
	totalStations : function(){
		return Stations.find().count();
	}
});

window.setMarkers = function(){
	
	// Load the search parameters
	var minTemp = Session.get('minTemp');
	var maxTemp = Session.get('maxTemp');
	var month = Session.get('month');
	
	var avgTempKey = 'avgt.' + month;
	
	var whereFields = {};
	whereFields[avgTempKey] = {
		$gte : minTemp,
		$lte : maxTemp
	};
	
	// Query the data
	var results = Stations.find(whereFields).fetch();
	
	// Clear existing markers
	//
	
	// Add the new markers
	var markers = {
		type: 'FeatureCollection',
		features : []
	};
	
	// Create a custom marker
	var markerIcon = L.icon({
		iconUrl : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAiklEQVR42mNgQIAoIF4NxGegdCCSHAMzEC+NUlH5v9rF5f+ZoCAwHaig8B8oPhOmKC1NU/P//7Q0DByrqgpSGAtSdOCAry9WRXt9fECK9oIUPXwYFYVV0e2ICJCi20SbFAuyG5uiECUlkKIQmOPng3y30d0d7Lt1bm4w301jQAOgcNoIDad1yOEEAFm9fSv/VqtJAAAAAElFTkSuQmCC', //red
		iconSize : [9,9],
		iconAnchor : [4,4]
	});
	
	// Insert each geojson point
	_.each(results, function(station){
		
		var thisTempC = parseInt(station.avgt[month], 10);
		var thisTempF = Math.round(thisTempC * 9 / 5 + 32);
		
		markers.features.push({
			type : 'Feature',
			geometry : {
				type : 'Point',
				// coordinates here are in longitude, latitude order because
				// x, y is the standard for GeoJSON and many formats
				coordinates : [
					station.loc.lon,
					station.loc.lat
				]
			},
			properties : {
				title : station.name,
				description : thisTempC + '&deg;C (' + thisTempF + '&deg;F)'

			}
		});
	});
	
	// Update the layer with the new data
	mapMarkers.setGeoJSON(markers);
	
	// Go through and update each icon
	map.eachLayer(function(marker){
		if(!marker.setIcon){
			return;
		}
		
		marker.setIcon(markerIcon);
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
		$('input[data-field=tempRange').trigger('slide');
		
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

// Spacebars helpers

UI.registerHelper('equals', function (a, b) {
	return a === b;
});

