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
const self_handle = require('./handles/kontroler_aktuatorow.json');
const aktuator_okna_1 = require('./handles/aktuator_okna_1.json');
const aktuator_drzwi_1 = require('./handles/aktuator_drzwi_1.json');

// constants
const module_name = "Kontroler aktuatorow";
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

// API definition
app.get('/', (_, res) => res.send(module_name));

app.get('/help', (_, res) => res.send(help));

app.put('/new_house_state', (req, res) => {
    var body = req.body;
    console.log(body);

    var handle_okno_1 = aktuator_okna_1;
    handle_okno_1.path = '/window/' + body.windows[1];
    handle_okno_1.method = 'PUT';

    var req_okno_1 = http.request(handle_okno_1, (httpRes) => {
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

    req_okno_1.on('error', (e) => {
      console.log("Problem with request: " + e);
    });

    req_okno_1.write("");
    req_okno_1.end();

    //##################################################
    //##################################################
    //##################################################

    var handle_drzwi_1 = aktuator_drzwi_1;
    handle_drzwi_1.path = '/door/' + body.doors[1];
    handle_drzwi_1.method = 'PUT';

    var req_drzwi_1 = http.request(handle_drzwi_1, (httpRes) => {
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

    req_drzwi_1.on('error', (e) => {
      console.log("Problem with request: " + e);
    });

    req_drzwi_1.write({});
    req_drzwi_1.end();
});
