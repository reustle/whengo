MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Spacebars helpers

UI.registerHelper('equals', function (a, b) {
	return a === b;
});

UI.registerHelper('gte', function (a, b) {
	return a >= b;
});

UI.registerHelper('prettyNum', function (a) {
	return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});

