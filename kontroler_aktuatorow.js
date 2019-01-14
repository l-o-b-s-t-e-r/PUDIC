// requires
const express = require('express');
const minimist = require('minimist');
const http = require('http');
const bodyParser = require('body-parser');

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

function getHandleFor(type, index) {
    // TODO it could use checking if file exists...
    switch(type) {
        case 'window':
            return require('./handles/aktuator_okna_' + index + '.json');
        case 'door':
            return require('./handles/aktuator_drzwi_' + index + '.json');
    }
    return null;
}

function getHTTPPutRequestPromise(handle, path) {
    var innerHandle = handle;
    innerHandle.path = path;
    innerHandle.method = 'PUT';
    innerHandle.headers = { 'Content-Type': 'application/json' };

    return new Promise((resolve, reject) => {
        var req = http.request(innerHandle, (httpRes) => {
            var responseStatusCode = httpRes.statusCode;

            console.log("Request from 'kontroler_aktuatorow':"
                + "\n -- target: " + JSON.stringify(innerHandle)
                + "\n -- response status code: " + responseStatusCode);

            httpRes.on('data', (chunk) => {
                console.log(chunk);
            });

            httpRes.on('end', () => {
                if(responseStatusCode == 200) {
                  resolve(200);
                }
                else {
                  reject(500);
                }
            });
        });

        req.write("");
        req.end();
    });
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
    console.log("Received 'kontroler_aktuatorow' - /new_house_state: " + JSON.stringify(req.body));

    var toUpdate = req.body;
    var requestStack = [];

    // check if windows need to be updated;
    if(toUpdate.hasOwnProperty('windows')) {
        // update all windows that are in request
        for(singleWindow in toUpdate.windows) {
            var newValue = toUpdate.windows[singleWindow];
            requestStack.push(
                getHTTPPutRequestPromise(
                    getHandleFor('window', singleWindow)
                    , '/window/' + newValue)
            );
        }
    }

    // check if doors need to be updated;
    if(toUpdate.hasOwnProperty('doors')) {
        // TODO update all doors that are in the request
        for(singleDoor in toUpdate.doors) {
            var newValue = toUpdate.doors[singleDoor];
            requestStack.push(
                getHTTPPutRequestPromise(getHandleFor('door', singleDoor), '/door/' + newValue)
            );
        }
    }

    if(requestStack.length > 0) {
        res.status(200).end();
    }
    else {
        Promise.all(requestStack).then(responseCodes => {
            console.log(responseCodes);
            res.status(200).end();
        })
        .catch(e => {
            console.log('kontroler_aktuatorow queue error: ' + e);
        });
    }

    // TODO notify 'aktualizator_modeli_symulujacych' that it's all

});
