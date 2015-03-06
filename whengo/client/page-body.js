Template.pageBody.helpers({
	
	unit : function(){
		return Session.get('unit');
	},
	
	currentYear : function(){
		return (new Date()).getFullYear();
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
		
		if(!Meteor.user() || !Meteor.user().profile.upgraded){
			alert('Please upgrade your account');
			$('select[data-field=minPopulation]').val(Session.get('minPopulation'));
			return;
		}
		
		var minPopulation = parseInt($('select[data-field=minPopulation]').val(), 10);
		Session.set('minPopulation', minPopulation);
		
		setMarkers();
		
	},
	
	'change select[data-field=renderLimit]' : function(){
		
		if(!Meteor.user() || !Meteor.user().profile.upgraded){
			alert('Please upgrade your account');
			$('select[data-field=renderLimit]').val(Session.get('renderLimit'));
			return;
		}
		
		var renderLimit = parseInt($('select[data-field=renderLimit]').val(), 10);
		Session.set('renderLimit', renderLimit);
		
		setMarkers();
		
	},
	
	'click a[data-action=upgrade]' : function(e){
		e.preventDefault();
		
		if(!Meteor.user()){
			alert('Please first sign in or create an account (link in the upper right-hand corner)');
			return;
		}
		
		Modal.show('paymentModal');
		
	}
	
});

Template.pageBody.rendered = function(){
	
	$('select[data-field=minPopulation]').val(Session.get('minPopulation'));
	$('select[data-field=renderLimit]').val(Session.get('renderLimit'));
	
}

