// requires
const express = require('express');
const minimist = require('minimist');
const http = require('http');

// objects
const app = express();
const argv = minimist(process.argv.slice(2));

// handles
const self_handle = require('./handles/czujnik_zbiornika_deszczowki.json');
const model_sym_handle = require('./handles/model_symulujacy.json');

// constants
const module_name = "Czujnik zbiornika deszczowki";
const help = `Moduł: ${module_name}
API:
 - /			- zwraca nazwe aplikacji
 - /help		- zwraca pomoc
 - /rain_tank_level	- zwraca obiekt JSON z informacja o tym, w ilu
			  procentach zapelniony jest zbiornik deszczowki
				{ "rain_tank_level" : <level> }
`;

// configurables
var port = -1;

// functions
function definePort() {
	if(argv.hasOwnProperty('p')) {
		port = argv['p'];
		console.log(`Using port from param`);
	} else if(typeof self_handle !== 'undefined'
		&& self_handle.hasOwnProperty('port')) {
		port = self_handle.port;
		console.log(`Using port from self_handle`);
	} else {
		console.log(`Startig with default port`);
	}
}

// Initial configuration
definePort();
app.listen(port, () => 
	console.log(`${module_name} listening on port ${port}`)
);

// API definition
app.get('/', (_, res) => res.send(module_name));

app.get('/help', (_, res) => res.send(help));

app.get('/rain_tank_level', (_, res) => {
	var handle = model_sym_handle;
	handle.path = '/rain_tank_level';

	http.get( handle
	, (httpRes) => {
		var data = '';

		httpRes.on('data', (chunk) => {
			data += chunk;
		});

		httpRes.on('end', () => {
			var modelResponse = JSON.parse(data);
			res.send(modelResponse);
		});
	});
});
