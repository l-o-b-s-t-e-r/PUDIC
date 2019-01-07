// requires
const express = require('express');
const minimist = require('minimist');
const http = require('http');

// objects
const app = express();
const argv = minimist(process.argv.slice(2));

// handles
const self_handle = require('./handles/czujnik_temp_zew.json');
const model_symulujacy_handle = require('./handles/model_symulujacy.json');

// constants
const module_name = "Czujnik temperatury zewnętrznej";
const help = `<pre>Moduł: ${module_name}
API:
 - /			- zwraca nazwe aplikacji
 - /help		- zwraca pomoc
 - /temperature_outside	- zwraca temperature zewnetrzna w formacie
				{ "temperature" : &lt;temperature&gt; }
			  Temperatura pobierana jest z serwera zewnetrznego
			  (model symulacyjny).
</pre>`;

// configurables
var port = 8101;

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

app.get('/temperature_outside', (req, res) => {
	var handle = model_symulujacy_handle;
	handle.path = '/temperature/outside';

	http.get( handle
	, (httpRes) => {
		var data = '';

		httpRes.on('data', (chunk) => {
			data += chunk;
		});

		httpRes.on('end', () => {
			res.send(JSON.parse(data));
		});
	});
});
