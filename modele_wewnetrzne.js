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
const self_handle = require('./handles/modele_wewnetrzne.json');
const modul_decyzyjny = require('./handles/modul_decyzyjny.json');

// constants
const module_name = "Modele wewnetrzne";
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

var conditions = {};

// API definition
app.get('/', (_, res) => res.send(module_name));

app.get('/help', (_, res) => res.send(help));

app.get('/status', (_, res) => res.send(conditions));

app.put('/house_state', (req, res) => {
    var body = req.body;
    console.log("Received 'modele_wewnetrzne': " + JSON.stringify(body));
    conditions = body;

    var handle = modul_decyzyjny;
    handle.path = '/house_state';
    handle.method = 'PUT';
    handle.headers = { 'Content-Type': 'application/json' };

    var innerReq = http.request(handle, (httpRes) => {
        var data = "";
        var responseStatusCode = httpRes.statusCode;
        console.log(JSON.stringify(handle) + "\n -- Request status code: " + responseStatusCode);

        httpRes.on('data', (chunk) => {
            console.log(chunk);
            data += chunk;
        });

        httpRes.on('end', () => {
            console.log("RESPONSE END");
            if(responseStatusCode == 200) {
                res.status(200).send(data);
            }
            else {
                res.status(500).end();
            }
        });
    } );

    innerReq.on('error', (e) => {
        console.log("!!! Problem with request: " + e);
    });

    console.log("sending 'modele_wewnetrzne' -> 'modul_decyzyjny': " + JSON.stringify(body));
    innerReq.write(JSON.stringify(body));
    innerReq.end();
});
