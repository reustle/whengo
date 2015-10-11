importData = function(){
	
	var count = 0;
	_.each(rawData, function(airport){
		
		var newAirport = {
			ci : airport.city,
			co : airport.country,
			ia : airport.iata_code,
			th : airport.temp_high_f,
			tl : airport.temp_low_f,
			pd : airport.precip_days,
			pa : airport.precip_inches,
			loc : {
				lat : airport.latitude,
				lon : airport.longitude
			}
		};
		
		Airports.insert(newAirport);
		
		count += 1;
		console.log(count);
		
	});
	
}
