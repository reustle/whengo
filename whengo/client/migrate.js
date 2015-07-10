migrateData = function(){
	return false;
	
	if(!raw_data){
		return;
	}
	
	var data = raw_data;
	
	var count = 0;
	_.each(data, function(airport){
		
		var new_airport = {
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
		
		Airports.insert(new_airport);
		
		count += 1;
		console.log(count);
		
	});
		
}

