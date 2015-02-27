// Subscribe to the stations db
Meteor.subscribe('stations', function(){
	
	var drawOnceMapboxExists = function(){
		if(typeof(window.mapMarkers) != 'undefined'){
			setMarkers();
		}else{
			setTimeout(drawOnceMapboxExists, 250);
		}
	}
	drawOnceMapboxExists();
	
});

// Set default search variables
Session.setDefault('unit', 'F');
Session.setDefault('minTemp', 23);
Session.setDefault('maxTemp', 25);
Session.setDefault('month', ((new Date()).getMonth()));

// Search Form View


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
	
});

