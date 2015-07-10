Template.detailsModal.helpers({
	
	airport : function(){
		return Airports.findOne(Session.get('selectedAirport'));
	},
	
	
});

// Rendered
Template.detailsModal.rendered = function(){
	
	var airport = Airports.findOne(Session.get('selectedAirport'));
	var avgHighTemp = airport.th;
	var avgLowTemp = airport.tl;
	
	var templateContext = this;
	
	var months = [
		'Jan', 'Feb', 'Mar',
		'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep',
		'Oct', 'Nov', 'Dec'
	];
	
	// Set a timeout so ____
	setTimeout(function(){
		var chart = c3.generate({
			bindto : templateContext.find('.yearlyTempChart'),
			size : {
				height : 300
			},
			data : {
				type : 'spline',
				columns : [
					['Avg High'].concat(avgHighTemp),
					['Avg Low'].concat(avgLowTemp)
				]
			},
			grid : {
				y : {
					show : true
				}
			},
			axis : {
				x : {
					tick : {
						culling : {
							max : 1
						},
						format : function(xVal){
							return months[xVal];
						}
					}
				},
				y : {
					tick : {
						format : function(yVal){
							var thisLabel = yVal + '°F';
							//if(thisLabel.indexOf('.') != -1){
							//	return '';
							//}
							return thisLabel;
						}
					}
				}
			},
			tooltip : {
				format : {
					title : function(yVal){
						return months[yVal];
					},
					value : function(xVal){
						return xVal + '°F';
					}
				}
			},
			legend : { show : false }
		});
	}, 250);
	
};

