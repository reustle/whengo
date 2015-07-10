// Set default values
Session.setDefault('minTemp', 65);
Session.setDefault('maxTemp', 85);
Session.setDefault('renderLimit', 250);
Session.setDefault('month', ((new Date()).getMonth()));

// Subscribe to airport data
Meteor.subscribe('airports', function(){
	
	var drawOnceMapboxExists = function(){
		if(typeof(window.mapMarkers) != 'undefined'){
			setMarkers();
		}else{
			setTimeout(drawOnceMapboxExists, 250);
		}
	}
	
	drawOnceMapboxExists();
	
});

// Meteor Startup
Meteor.startup(function(){
	
	// Initialize MapBox
	L.mapbox.accessToken = 'pk.eyJ1IjoicmV1c3RsZSIsImEiOiJESzd6YVRnIn0.Hh9AwQw1X0PR_TOewZMMzA';
	window.map = L.mapbox.map('mapContainer', 'reustle.l8pgo1n1').setView([4.565, 12.304], 2);
	window.mapMarkers = L.mapbox.featureLayer().addTo(map);
	
	// Add mapbox events
	window.map.on('dragend', function(){
		setMarkers();
	});
	window.map.on('zoomend', function(){
		setMarkers();
	});
	window.map.on('resize', function(){
		setMarkers();
	});
	
	window.mapMarkers.on('click', function(e){
		Session.set('selectedAirport', e.layer.feature.properties.airportId);
		Modal.show('detailsModal');
	});
	
});

