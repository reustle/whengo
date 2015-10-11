import json
from pprint import pprint

handle = open('data.json', 'r')
content = handle.read()
handle.close()

def f_to_c(ftemp):
	result = (ftemp - 32) * 5.0/9.0
	result = int(result * 10)
	result = float(result) / 10
	return result
	
def i_to_cm(inches):
	result = inches * 2.54
	result = int(result * 10)
	result = float(result) / 10
	return result

airports = json.loads(content)
clean_airports = []

for airport in airports:
	
	rainfall = [ i_to_cm(amt) for amt in airport.get('precip_inches') ]
	precip_days = [ int(days) for days in airport.get('precip_days') ]
	temp_high = [ f_to_c(tmp) for tmp in airport.get('temp_high_f') ]
	temp_low = [ f_to_c(tmp) for tmp in airport.get('temp_low_f') ]
	
	clean_airports.append({
		'ci': airport.get('city'),
		'co': airport.get('country'),
		'ia': airport.get('iata_code'),
		'th': temp_high,
		'tl': temp_low,
		'pd': precip_days,
		'pa': rainfall,
		'lat': airport.get('latitude'),
		'lon': airport.get('longitude')
	})


print(json.dumps(clean_airports))

