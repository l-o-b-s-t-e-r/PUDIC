// TODO make handle to modele_wewnetrzne
// TODO implement GET: /update

// requires
const express = require('express');
const minimist = require('minimist');
const http = require('http');

// objects
const app = express();
const argv = minimist(process.argv.slice(2));

// handles
const self_handle = require('./handles/modul_decyzyjny.json');
const kontroler_aktuatorow = require('./handles/kontroler_aktuatorow.json');
const model_symulujacy = require('./handles/model_symulujacy.json')

// constants
const module_name = "Modul decyzyjny";
const help = `<pre>Moduł: ${module_name}
API:
 - /			- zwraca nazwe aplikacji
 - /help		- zwraca pomoc
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

var new_house_state = {
	"windows" : {
	   1 : false,
     2 : false
	},
  "doors" : {
	   1 : false
	}
};

// API definition
app.get('/', (_, res) => res.send(module_name));

app.get('/help', (_, res) => res.send(help));

app.put('/house_state', (req, res) => {
    var body = req.body;
    console.log(body);

    var change_state = true;
    //Tutaj trzeba dodac warunki przy ktorych zmieniamy stan aktuatorow lub nie.

    if (change_state) {
      var handle = kontroler_aktuatorow;
  		handle.path = '/new_house_state';
  		handle.method = 'PUT';

  		var req = http.request(handle, (httpRes) => {
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

  		console.log("modul_decyzyjny after creating request");

  		req.on('error', (e) => {
  			console.log("Problem with request: " + e);
  		});

      req.write("" + new_house_state);
      req.end();
    } else {
      //nie wiem co tu powinno być
    }
});
