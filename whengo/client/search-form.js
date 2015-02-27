Template.searchForm.helpers({
	loadedStations : function(){ return Stations.find().count(); },
	totalStations : function(){ return TOTAL_STATIONS; },
	percentLoaded : function(){ return Math.round((Stations.find().count() / TOTAL_STATIONS)*100) },
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
		
	},
	
	'click a[data-action=month-up]' : function(e){
		e.preventDefault();
		e.target.blur();
		
		var curMonth = Session.get('month');
		
		var newMonth = 11;
		if(curMonth > 0){
			newMonth = curMonth -1;
		}
		
		// Change the input
		$('select[data-field=month]').val(newMonth).change();
		
	},
	
	'click a[data-action=month-down]' : function(e){
		e.preventDefault();
		e.target.blur();
		
		var curMonth = Session.get('month');
		
		var newMonth = 0;
		if(curMonth < 11){
			newMonth = curMonth +1;
		}
		
		// Change the input
		$('select[data-field=month]').val(newMonth).change();
		
	}
	
	
});

Template.searchForm.rendered = function(){
	
	// Init the slider
	// Also, fire the slide event once so the labels get drawn
	$('input[data-field=tempRange]')
		.slider({})
		.change();
	
	// Set the default value for the month select field
	$('select[data-field=month]').val(Session.get('month'));
	
};

