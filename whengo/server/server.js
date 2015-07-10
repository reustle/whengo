Meteor.publish('airports', function(){
	return Airports.find({},{limit:2000});
});

