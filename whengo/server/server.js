Meteor.publish('airports', function(){
	return Airports.find();
});

