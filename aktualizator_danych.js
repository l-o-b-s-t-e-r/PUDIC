// TODO make handle to modele_wewnetrzne
// TODO implement GET: /update

// requires
const express = require('express');
const minimist = require('minimist');
const http = require('http');
const bodyParser = require('body-parser');

// objects
const app = express();
const argv = minimist(process.argv.slice(2));

// handles
const self_handle = require('./handles/aktualizator_danych.json');
const model_symulujacy = require('./handles/model_symulujacy.json');
const modele_wewnetrzne = require('./handles/modele_wewnetrzne.json')

// constants
const module_name = "Aktualizator danych";
const help = `<pre>Moduł: ${module_name}
API:
 - /			- zwraca nazwe aplikacji
 - /help		- zwraca pomoc
</pre>`;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.get('/update', (_, res) => {
	var handle = model_symulujacy;
	handle.path = '/actual_state';

	http.get( handle, (httpRes) => {
		var data = '';

		httpRes.on('data', (chunk) => {
      console.log(chunk);
			data += chunk;
		});

		httpRes.on('end', () => {
			var modelResponse = JSON.parse(data);

      var handle_modele_wewnetrzne = modele_wewnetrzne;
      handle_modele_wewnetrzne.path = '/house_state';
      handle_modele_wewnetrzne.method = 'PUT';

      var req = http.request(handle_modele_wewnetrzne, (httpRes) => {
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
      console.log(modelResponse);

  		req.on('error', (e) => {
  			console.log("Problem with request: " + e);
  		});

      req.write("" + modelResponse);
      req.end();
		});
	});
});
