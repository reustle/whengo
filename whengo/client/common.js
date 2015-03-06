// Set default values
Session.setDefault('unit', 'F');
Session.setDefault('minTemp', 20);
Session.setDefault('maxTemp', 30);
Session.setDefault('minPopulation', 1000000);
Session.setDefault('renderLimit', 250);
Session.setDefault('month', ((new Date()).getMonth()));

Session.setDefault('resultsCount', 0);
Session.setDefault('stationCount', 1);

// Grab the number of stations we expect to load
loadStationCount = function(){
	Meteor.call('getStationCount', function(err, numStations){
		if(err){
			console.log(err);
		}
		Session.set('stationCount', numStations);
		
		// Don't subscribe until we have loaded the total #
		subscribeToStations();
		
	});
}
loadStationCount();

Hooks.onLoggedIn = function(){
	loadStationCount();
}
Hooks.onLoggedOut = function(){
	loadStationCount();
}

subscribeToStations = function(){
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
}

// Meteor Startup

Meteor.startup(function(){
	
	Hooks.init([{}]);
	
	Stripe.setPublishableKey('pk_test_UMtwN1Xzh75g0wPIPQpmZmXE');
	
	// Setup MapBox
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
	
});

