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
const TAG = '"' + module_name + '": ';

const ROOMS_MODEL = {
    0 : {
        "windows" : [1, 2],
        "doors" : [1]
    }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const options = {
  hostname: '192.168.43.76',
  port: 8700,
  path: '/new_house_state',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  }
};

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

function fillNewStateForWindows(stateBefore, conditions) {
    var newState = stateBefore;

    if(
       conditions.temperature.outside <= 10
       || conditions.temperature.outside >= 30
       || conditions.raining
       || conditions.humidity > 90
       || conditions.humidity < 15
    ) {
        console.log(TAG + "unconditional windows close");
        newState.windows = {};
        for(singleRoom in ROOMS_MODEL) {
            var windowsInRoom = ROOMS_MODEL[singleRoom].windows;
            windowsInRoom.forEach((item, index, array) => {
                newState.windows[item] = false;
            });
        }
    }
    else {
        console.log(TAG + "windows not closed, checking other conditions");
        var outsideTemperature = conditions.temperature.outside;
        // here we are going to process every room
        for(singleRoom in ROOMS_MODEL) {
            var roomTemperature = conditions.temperature.inside[singleRoom];
            if(
                (roomTemperature <= 20 && outsideTemperature > 20)
                || (roomTemperature > 20 && outsideTemperature >= roomTemperature)
            ) {

                console.log(TAG + "opening windows for room " + singleRoom);

                if(!newState.hasOwnProperty("windows")) {
                    newState.windows = {};
                }

                var windowsInRoom = ROOMS_MODEL[singleRoom].windows;
                windowsInRoom.forEach((item, index, array) => {
                    newState.windows[item] = true;
                });
            }
            // else do nothing?
        }
    }

    return newState;
}

// Initial configuration
definePort();
app.listen(port, () =>
	console.log(`${module_name} listening on port ${port}`)
);

/*var new_house_state = {
	"windows" : {
	   1 : false,
     2 : false
	},
  "doors" : {
	   1 : false
	}
};*/

// API definition
app.get('/', (_, res) => res.send(module_name));

app.get('/help', (_, res) => res.send(help));

app.put('/house_state', (req, res) => {
    console.log("Received 'modul_decyzyjny': " + JSON.stringify(req.body));

    var conditions = req.body;

    var newState = {}

    //Tutaj trzeba dodac warunki przy ktorych zmieniamy stan aktuatorow lub nie.

    // window section
    newState = fillNewStateForWindows(newState, conditions);

    var handle = kontroler_aktuatorow;
    handle.path = '/new_house_state';
    handle.method = 'PUT';
    handle.headers = { 'Content-Type': 'application/json' };

    var req = http.request(options, (httpRes) => {
        var responseStatusCode = httpRes.statusCode;

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

    console.log("Sending 'modul_decyzyjny' -> 'kontroler_aktuatorow': " + JSON.stringify(newState));

    req.on('error', (e) => {
        console.log("Problem with request: " + e);
    });

    req.write(JSON.stringify(newState));
    req.end();
});
