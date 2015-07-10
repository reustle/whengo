import json
import requests
from time import sleep
from pprint import pprint
from pymongo import MongoClient

BASE_URL = 'http://www.usaweatheronline.com/v2/weather-averages.aspx?q='

db_client = MongoClient()
db = db_client['airports']

def get_data(airport_code):
	""" Get the avg temp / rainfall data for the given airport """
	
	req = requests.get(BASE_URL + airport_code)
	res = req.text
	
	if len(res) < 4000:
		return None
	
	result = {}
	
	count = 0
	for line in res.splitlines():
		
		if 'data: [' in line:
			
			# Figure out the key
			this_key = None
			if count == 0:
				this_key = 'temp_high_f'
			elif count == 1:
				this_key = 'temp_low_f'
			elif count == 2:
				this_key = 'precip_inches'
			elif count == 3:
				this_key = 'precip_days'
			
			line = line.replace(' data: [','').replace(']}, ','').replace(']}','').split(', ')
			parsed_line = [ float(val) for val in line ]
			result[this_key] = parsed_line
			
			count += 1
			
	return result

def get_all_airport_codes():
	""" Read all airport codes from the file """
	
	handle = open('global_airports.json', 'r')
	contents = handle.read()
	handle.close()
	
	all_airports = json.loads(contents)
	
	clean_airports = []
	for airport in all_airports:
		
		# Skip airports with no IATA codes
		if not len(airport.get('iata_faa')):
			continue
		
		clean_airports.append({
			'iata_code' : airport.get('iata_faa').lower(),
			'city' : airport.get('city'),
			'country' : airport.get('country'),
			'latitude' : float(airport.get('latitude')),
			'longitude' : float(airport.get('longitude')),
		})
	
	return clean_airports

def get_airports_from_db():
	""" Get the airports that are saved in the db """
	
	airports = list(db.airports.find())
	
	return airports

def export_final_data():
	""" Export the final data """
	
	airports = list(db.airports.find({ 'weather' : { '$exists' : True }}))
	
	for airport in airports:
		airport['precip_inches'] = airport.get('weather').get('precip_inches')
		airport['precip_days'] = airport.get('weather').get('precip_days')
		airport['temp_high_f'] = airport.get('weather').get('temp_high_f')
		airport['temp_low_f'] = airport.get('weather').get('temp_low_f')
		
		del airport['_id']
		del airport['weather']
	
	return airports

if __name__ == '__main__':
	
	json_data = json.dumps(export_final_data())
	
	handle = open('results.json', 'w+')
	handle.write(json_data)
	handle.close()
	
	# Bad Airport
	#pprint( get_data('gzs') )
	
	# Real Airport
	#pprint( get_data('jfk') )
	
	"""
	for airport in get_airports_from_db():
		if airport.get('weather') or airport.get('weatherNotFound'):
			continue
		
		# Generate Percentage Complete
		finished_count = db.airports.find({ 'weather' : {'$exists' : 1} }).count()
		finished_count += db.airports.find({ 'weatherNotFound' : {'$exists' : 1} }).count() 
		total_count = db.airports.count()
		percentage = int(float(finished_count) / float(total_count) * 100)
		
		print('Loading ' + airport.get('iata_code').upper() + '   ' + str(percentage) + '%')
		this_weather = get_data(airport.get('iata_code'))
		
		if this_weather:
			db.airports.update({
				'_id' : airport.get('_id')
			},{
				'$set' : {
					'weather' : this_weather
				}
			})
			
		else:
			print('Weather Not Found')
			db.airports.update({
				'_id' : airport.get('_id')
			},{
				'$set' : {
					'weatherNotFound' : True
				}
			})
		
	"""

