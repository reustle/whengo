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
		
		alert('Coming Soon!');
		return;
		
		if(!Meteor.user()){
			alert('Please first sign in or create an account (link in the upper right-hand corner)');
			return;
		}
		
		Meteor.call('upgrade', {
			number : '4242424242424242',
			exp_month : '05',
			exp_year : '2016'
		}, function(err){
			
			// Poll for updates for 20 seconds (we check every 100ms)
			pollForStripeResponse(200);
			
		});
		
	}
	
});

var pollForStripeResponse = function(counter){
	
	// If we're not logged in, give up
	if(!Meteor.user()){ return; }
	
	// If we've successfully upgraded, finish
	if(Meteor.user().profile.upgraded){
		loadStationCount();
		return;
	}
	
	if(Meteor.user().profile.transactionError){
		alert(Meteor.user().profile.transactionError);
		return;
	}
	
	
	if(counter <= 0){
		alert('Unknown payment error, please contact us (link in footer)');
		return;
	}
	
	counter--;
	setTimeout(function(){
		pollForStripeResponse(counter);
	}, 100);
	
}

Template.pageBody.rendered = function(){
	
	$('select[data-field=minPopulation]').val(Session.get('minPopulation'));
	$('select[data-field=renderLimit]').val(Session.get('renderLimit'));
	
}

