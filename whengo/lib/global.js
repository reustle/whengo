// Run on both client and server

Stations = new Mongo.Collection('stations');

Meteor.users.deny({
	update : function (){
		return true;
	}
});

