Template.paymentModal.events({
	
	'click button[data-action=pay]' : function(e){
		e.preventDefault();
		e.target.blur();
		
		// Read form values
		var values = {
			number : $('input[data-field=ccNum]').val(),
			cvc : $('input[data-field=ccCvc]').val(),
			expMonth : $('input[data-field=ccExpMonth]').val(),
			expYear : $('input[data-field=ccExpYear]').val()
		};
		
		// Validate
		var errors = false;
		if(values.number.length < 16){
			errors = true;
			alert('Invalid credit card number');
			
		}else if(values.expMonth.length != 2){
			errors = true;
			alert('Invalid expiration month (2 digits)');
		
		}else if(values.expYear.length != 4){
			errors = true;
			alert('Invalid expiration year (4 digits)');
			
		}else if(values.cvc.length < 2){
			errors = true;
			alert('Please enter the security code (CVC) from the back of the card');
			
		}
		
		if(errors){
			return false;
		}
		
		$(e.target).addClass('disabled').html('Processing...');
		
		Meteor.call('upgrade', {
			number : values.number,
			exp_month : values.expMonth,
			exp_year : values.expYear,
			cvc : values.cvc
		}, function(err){
			
			// Poll for updates for 20 seconds (we check every 100ms)
			pollForStripeResponse(200, function(){
				$(e.target).removeClass('disabled').html('Process Payment');
			});
			
		});
	}
	
});

var pollForStripeResponse = function(counter, callback){
	
	// If we're not logged in, give up
	if(!Meteor.user()){
		alert('Please log in or create an account first');
		Modal.hide();
		
		callback();
		return;
	}
	
	// If we've successfully upgraded, finish
	if(Meteor.user().profile.upgraded){
		alert('You\'ve successfully upgraded your account. Thank you!');
		loadStationCount();
		Modal.hide();
		
		callback();
		return;
	}
	
	// Transaction Error
	if(Meteor.user().profile.transactionError){
		alert(Meteor.user().profile.transactionError);
		
		callback();
		return;
	}
	
	// Timed Out
	if(counter <= 0){
		alert('Unknown payment error, please contact us (link in footer)');
		
		callback();
		return;
	}
	
	// Try again in 100ms
	counter--;
	setTimeout(function(){
		pollForStripeResponse(counter, callback);
	}, 100);
	
}

