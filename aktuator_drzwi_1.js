// requires
const express = require('express');
const minimist = require('minimist');
const http = require('http');

// objects
const app = express();
const argv = minimist(process.argv.slice(2));

// handles
const self_handle = require('./handles/aktuator_drzwi_1.json');
const aktualizator_modeli_symulujacych_handle = require('./handles/aktualizator_modeli_symulujacych.json');

// constants
const module_name = "Aktuator drzwi 1";
const help = `<pre>Moduł: ${module_name}
API:
 - /			- zwraca nazwe aplikacji
 - /help		- zwraca pomoc

API - PUT:
 - /door/{state:&lt;true|false&gt;}
			- ustawia nowy stan drzwi (true - otwarte,
			  false - zamkniete). Zwraca HTTP status code
			   - 200 w przypadku sukcesu
			   - 400 jesli nowy status jest rozny od true/false
               - 500 jesli otrzymano status inny od 200 od zewnetrznego serwera


UWAGA - NA CHWILE OBECNA NIE DZIALA
</pre>`;

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

app.put('/door/:newState', (req, res) => {
	var doorId = 1;

	var newStateRaw = req.params["newState"].toLowerCase();

	if(newStateRaw === 'true' || newStateRaw === 'false') {

		var handle = aktualizator_modeli_symulujacych_handle;
		handle.path = '/door/' + doorId + '/change_state/' + newStateRaw;
		handle.method = 'PUT';

		console.log("making request to: ");
		console.log(handle);

		var req = http.request( handle, (httpRes) => {
			console.log("http request started");
			var responseStatusCode = httpRes.statusCode;
			console.log("Request status code: " + responseStatusCode);

			httpRes.on('data', (chunk) => {
				console.log(chunk);
			});

			httpRes.on('end', () => {
				console.log("RESPONSE END");
				if(responseStatusCode == 200) {
					res.status(200).end();
				}
				else {
					res.status(500).end();
				}
			});
		} );

		console.log("after creating request");

		req.on('error', (e) => {
			console.log("Problem with request: " + e);
		});

    req.write("");
    req.end();
	}
	else {
		res.status(400).end();
	}
});
