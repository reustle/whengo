Meteor.publish('stations', function(){
	return Stations.find({
		
		// Only send stations to the client that
		// represent a population of 500k or more
		//pop : { $gte : 500000 }
		
	});
});

Meteor.methods({
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
			console.log(JSON.stringify(station));
			
			Stations.insert(station);
		});
		
		// Print status
		console.log('Imported ' + stationData.length + ' stations');
		
		return stationData.length;
		
	}
});

