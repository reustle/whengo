Template.pageBody.helpers({
	'unit' : function(){
		return Session.get('unit');
	}
});

Template.pageBody.events({
	
	'click a[data-field=unit]' : function(e){
		e.preventDefault();
		
		if( Session.get('unit') == $(e.target).attr('data-unit') ){
			return;
		}
		
		Session.set('unit', $(e.target).attr('data-unit'));
		
		// Trigger label redraw
		$('input[data-field=tempRange]').change();
		
	},
	
	'change select[data-field=minPopulation]' : function(){
		
		var minPopulation = parseInt($('select[data-field=minPopulation]').val(), 10);
		
		Session.set('minPopulation', minPopulation);
		
		setMarkers();
		
	},
	
	'change select[data-field=renderLimit]' : function(){
		
		var renderLimit = parseInt($('select[data-field=renderLimit]').val(), 10);
		
		Session.set('renderLimit', renderLimit);
		
		setMarkers();
		
	},
	
	'click a[data-action=upgrade]' : function(e){
		e.preventDefault();
		
		alert('Soon! :) ');
	}
	
});

Template.pageBody.rendered = function(){
	
	$('select[data-field=minPopulation]').val(Session.get('minPopulation'));
	$('select[data-field=renderLimit]').val(Session.get('renderLimit'));
	
}

