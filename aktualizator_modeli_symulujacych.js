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

function getSetModelPromise(newData) {
     return new Promise((resolve, reject) => {
       var handle = model_symulujacy_handle;
       handle.path = '/update_model';
       handle.method = 'PUT';
       handle.headers = { 'Content-Type': 'application/json' };
       var httpReq = http.request(handle, (httpRes) => {
           var responseStatusCode = httpRes.statusCode;
           httpRes.on('data', (chunk) => {
               // ignore..?
           });
           httpRes.on('end', () => {
               if(responseStatusCode == 200) {
                   resolve(200);
               }
               else {
                   console.log("Problem with request:" + "\n --- " + JSON.stringify(handle) + "\n --- " + responseStatusCode);
                   reject(500);
               }
           });
       });
       httpReq.on('error', (e) => {
           console.log("Problem with request (outer): " + "\n --- " + JSON.stringify(handle) + "\n --- " + e);
       });
       httpReq.write(JSON.stringify(newData));
       httpReq.end();
    });
}

function applyRules(modelObject) {
    // TODO implement me!
    var newModelObject = modelObject;
    newModelObject.temperature.outside = modelObject.temperature.outside - 1;
    return newModelObject;
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

app.get('/notify_finished', (req, res) => {
    // 1) get model from model_symulujacy
    // 2) update model with rules
    // 3) save model back

    var pGetModel = new Promise((resolve, reject) => {
        var handle = model_symulujacy_handle;
        handle.path = '/';
        // cleanup - IMPORTANT
        delete(handle.method);
        delete(handle.headers);

        http.get(handle, (httpRes) => {
           var data = "";
           httpRes.on('data', (chunk) => {
               data += chunk;
           });
           httpRes.on('end', () => {
               var response = JSON.parse(data);
               resolve(response);
           });
        });
    });


    pGetModel.then((result) => {
        return applyRules(result);
    })
    .then((result) => {
        return getSetModelPromise(result);
    })
    .then((httpResult) => {
        res.status(200).end();
    })
    .catch((e) => {
        console.log("/notify_finished - Error handling request:" + e);
        res.status(500).end();
    });
});
