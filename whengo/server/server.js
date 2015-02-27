
Meteor.publish('stations', function(){
	return Stations.find({
		
		// TODO MANUAL FILTER
		pop : { $gte : 100000 }
		
	});
});

Meteor.methods({
	
	getStationCount : function(){
		return Stations.find({
			
			// TODO MANUAL FILTER
			pop : { $gte : 100000 }
			
		}).count();
	},
	
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

