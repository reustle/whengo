Template.settings.helpers({
	minTemp : function(){ return Session.get('minTemp'); },
	maxTemp : function(){ return Session.get('maxTemp'); },
});

Template.settings.events({
	
	'change select, keyup input' : function(e){
		
		// Get all fields
		Session.set('month', parseInt($('select[data-field=month]').val(), 10));
		Session.set('minTemp', parseInt($('input[data-field=minTemp]').val(), 10));
		Session.set('maxTemp', parseInt($('input[data-field=maxTemp]').val(), 10));
		Session.set('renderLimit', parseInt($('select[data-field=renderLimit]').val(), 10));
		
		// Redraw the markers
		setTimeout(filterMarkers, 1);
		
	}
	
});

Template.settings.rendered = function(){
	
	// Set field default values
	$('select[data-field=month]').val(Session.get('month'));
	$('input[data-field=minTemp]').val(Session.get('minTemp'));
	$('input[data-field=maxTemp]').val(Session.get('maxTemp'));
	$('select[data-field=renderLimit]').val(Session.get('renderLimit'));
	
};

