
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
	
	toggleUpgrade : function(){
		
		var userId = this.userId;
		var thisUser = Meteor.users.findOne({ _id : userId });
		
		if(!thisUser){
			console.log('couldnt find user');
			return false;
		}
		
		console.log(thisUser);
		
		if(thisUser.profile.upgraded){
			console.log('setting to false');
			Meteor.users.update({ _id : userId }, { $set : { 'profile.upgraded' : false } });
		}else{
			console.log('setting to true');
			Meteor.users.update({ _id : userId }, { $set : { 'profile.upgraded' : true } });
		}
		
		return true;
		
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

