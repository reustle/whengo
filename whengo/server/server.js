var Stripe = StripeAPI('sk_test_WmgOPyMAkr3JWzMMSOkUhNnp');

Meteor.publish('stations', function(){
	
	var whereFields = false;
	var userId = this.userId;
	var thisUser = Meteor.users.findOne({ _id : userId });
	
	if(thisUser && thisUser.profile.upgraded){
		whereFields = {};
	}
	
	if(!whereFields){
		whereFields = {
			pop : { $gte : 1000000 }
		};
	}
	
	return Stations.find(whereFields);
	
});

Meteor.methods({
	
	eventsOnHooksInit : function(){},
	
	getStationCount : function(){
	
		var whereFields = false;
		var userId = this.userId;
		var thisUser = Meteor.users.findOne({ _id : userId });
		
		if(thisUser && thisUser.profile.upgraded){
			whereFields = {};
		}
		
		if(!whereFields){
			whereFields = {
				pop : { $gte : 1000000 }
			};
		}
		
		return Stations.find(whereFields).count();
		
	},
	
	upgrade : function(cardDetails){
		// Charge the user REAL MONEY OMG $$$$
		
		var userId = this.userId;
		var thisUser = Meteor.users.findOne({ _id : userId });
		
		if(!thisUser){
			return false;
		}
		
		// Remove any previous transaction errors
		Meteor.users.update({
			_id : userId
		}, {
			$set : {
				'profile.transactionError' : false
			}
		});
		
		// TEST LONG RESPONSE TIME
		//setTimeout(Meteor.bindEnvironment(function(){
		
		Stripe.charges.create({
			amount : 500,
			currency : 'USD',
			card : cardDetails
		}, Meteor.bindEnvironment(function(err, res){
			
			var error = false;
			
			if(err){
				// Did stripe return an error?
				
				error = {
					success : false,
					message : err.message
				}
			}else if(!res.paid){
				// Did the transaction not say paid?
				
				error = {
					success : false,
					message : 'Unknown error, please contact us (link in footer)'
				}
			}
			
			// Save our error, or set the user to upgraded
			var updateFields = {};
			
			if(error){
				updateFields = {
					'profile.transactionError' : error.message
				}
			}else{
				updateFields = {
					'profile.upgraded' : true,
					'profile.transactionError' : false,
					'profile.transactionId' : res.id
				};
			}
			
			Meteor.users.update({
				_id : userId
			}, {
				$set : updateFields
			});
			
		}));
		
		// TEST LONG RESPONSE TIME
		//}), 8000);
			
	},
	
	downgrade : function(){
		
		var userId = this.userId;
		var thisUser = Meteor.users.findOne({ _id : userId });
		
		if(!thisUser){
			console.log('couldnt find user');
			return false;
		}
		
		Meteor.users.update({ _id : userId }, {
			$set : {
				'profile.transactionError' : false,
				'profile.upgraded' : false
			}
		});
		
	},
	
	// Utils
	bootstrapData : function(password){
		
		// Authenticate
		if(password != 'justdoit'){
			console.log('Permission Denied');
			return 0;
		}
		
		// Clear all existing data
		Stations.remove({});
		
		// Load station json
		var stationData = JSON.parse(Assets.getText('avgs.json'));
		
		var counter = 0;
		// Insert new station data
		_.each(stationData, function(station){
			counter++;
			
			//station.loc = {
			//	type : 'Point',
			//	coordinates : [station.loc.lon , station.loc.lat]
			//};
			console.log(JSON.stringify(station));
			
			Stations.insert(station);
		});
		
		// Print status
		console.log('Imported ' + stationData.length + ' stations');
		
		return stationData.length;
		
	}
});

