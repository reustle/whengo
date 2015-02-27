MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

utils = {
	cToF : function(temp){
		return Math.round(temp * 9 / 5 + 32);
	},
	prettyTemp : function(temp){
		if(Session.get('unit') == 'F'){
			return utils.cToF(temp) + '&deg;F';
		}
		return Math.round(temp) + '&deg;C';
	}
}

// Spacebars helpers

UI.registerHelper('equals', function (a, b) {
	return a === b;
});

UI.registerHelper('gt', function (a, b) {
	return a > b;
});

UI.registerHelper('prettyNum', function (a) {
	return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});

