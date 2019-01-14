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
const self_handle = require('./handles/aktualizator_modeli_symulujacych.json');
const model_symulujacy_handle = require('./handles/model_symulujacy.json');

// constants
const module_name = "Aktualizator modeli symulujacych";
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

app.put('/:type/:id/change_state/:newState', (req, res) => {
    var type = req.params["type"];
    var id = req.params["id"];
    var newStateRaw = req.params["newState"].toLowerCase();

    if(newStateRaw === 'true' || newStateRaw === 'false') {

        var handle = model_symulujacy_handle;
        handle.path = '/' + type + '/' + id + '/change_state/' + newStateRaw;
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
