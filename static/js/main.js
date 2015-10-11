// Map

var drawMarkers = function(){
	
	//console.time('drawMarkers');
	
	// Create a new mapbox FeatureCollection
	var markers = {
		type: 'FeatureCollection',
		features : []
	};
	
	// Create and insert a marker for each result airport into the FeatureCollection
	var airports = queryAirports();
	_.each(airports, function(airport){
		
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
	
	//console.timeEnd('drawMarkers');
	
	// Create a custom marker icon (circle icon)
	var markerIcon = L.icon({
		iconUrl : 'static/dot.png',
		iconSize : [9,9],
		iconAnchor : [4,4]
	});
	
	// Go through and update each icon with the new icon (lame)
	map.eachLayer(function(marker){
		if(marker.setIcon){
			marker.setIcon(markerIcon);
		}
	});
	
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
		
		if(airport.lon < mapNW.lng || airport.lon > mapSE.lng){
			return false;
		}
		if(airport.lat < mapSE.lat || airport.lat > mapNW.lat){
			return false;
		}
		
		return true;
		
	});
	
	// Update the results label
	$('span[data-label=resultsCount]').html(results.length);
	
	return results;
	
}

var initMap = function(){
	
	// Initialize MapBox
	L.mapbox.accessToken = 'pk.eyJ1IjoicmV1c3RsZSIsImEiOiJESzd6YVRnIn0.Hh9AwQw1X0PR_TOewZMMzA';
	map = L.mapbox.map('mapContainer', 'reustle.l8pgo1n1').setView([11.86, 0], 2);
	mapMarkers = L.mapbox.featureLayer().addTo(map);
	
	// Add mapbox events
	map.on('dragend', function(){
		drawMarkers();
	});
	map.on('zoomend', function(){
		drawMarkers();
	});
	map.on('resize', function(){
		drawMarkers();
	});
	
	mapMarkers.on('click', function(e){
		showDetailsModal(e.layer.feature.properties.airportId);
	});
	
	var drawOnceMapboxExists = function(){
		if(typeof(window.mapMarkers) != 'undefined'){
			drawMarkers();
		}else{
			setTimeout(drawOnceMapboxExists, 250);
		}
	}
	
	drawOnceMapboxExists();
	
}

var setDefaults = function(){
	if(!Session.get('minTemp')){
		Session.set('minTemp', 24);
	}
	if(!Session.get('maxTemp')){
		Session.set('maxTemp', 35);
	}
	if(!Session.get('month')){
		Session.set('month', ((new Date()).getMonth()));
	}

}


// Settings

var initSettings = function(){
	
	// Generate temp dropdowns
	_.each(_.range(-5, 41, 1), function(temp){
		var newOpt = $('<option>');
		newOpt.val(temp).html(temp + ' &deg;C');
		$('select[data-field=minTemp]').append(newOpt);
		$('select[data-field=maxTemp]').append(newOpt.clone());
	});
	
	// Set initial values
	$('select[data-field=month').val(Session.get('month'));
	$('select[data-field=minTemp').val(Session.get('minTemp'));
	$('select[data-field=maxTemp').val(Session.get('maxTemp'));
	
}

$('.search-form select').change(function(){
	Session.set($(this).attr('data-field'), parseInt($(this).val(), 10));
	drawMarkers();
});


// Details Modal

var showDetailsModal = function(airportId){
	
	var airport = _.findWhere(airportData, { ia: airportId });
	
	// Set the city / country title
	$('#details-modal .modal-title').html(airport.ci + ', ' + airport.co);
	
	// Build the data series for the chart
	var seriesData = [];
	
	_.forEach(airport.th, function(val, idx){
		seriesData.push({
			'Series': 'Temp High',
			'Month': (idx + 1),
			'Temperature': val
		});
	});
	
	_.forEach(airport.tl, function(val, idx){
		seriesData.push({
			'Series': 'Temp Low',
			'Month': (idx + 1),
			'Temperature': val
		});
	});
	
	// Draw the chart if it doesn't exist
	if(!chart){
		drawChart();
	}
	
	// Update the chart
	chart.data = seriesData;
	chart.draw();
	
	// Show the modal
	$('#details-modal').modal('show');
	
};

var drawChart = function(airport){
	
	// Create the SVG element
	var svg = dimple.newSvg('#details-modal .chart-container', '100%', '100%');
	
	// Initialize a Dimple chart
	chart = new dimple.chart(svg, []);
	
	chart.setBounds(50, 20, 705, 350);
	
	var x = chart.addCategoryAxis('x', 'Month');
	x.addOrderRule('Date');
	
	chart.addMeasureAxis('y', 'Temperature');
	
	var s = chart.addSeries('Series', dimple.plot.line);
	s.interpolation = 'cardinal';
	
	// Set line colors
	chart.assignColor("Temp High", 'rgb(210,107,95)', 'rgb(210,107,95)', 0.8);
	chart.assignColor("Temp Low", 'rgb(107,148,176)', 'rgb(107,148,176)', 0.8);
	
	chart.draw();
		
}


// Init

var map, mapMarkers, chart;

setDefaults();
initSettings();
initMap();

