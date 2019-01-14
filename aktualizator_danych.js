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
const modele_wewnetrzne = require('./handles/modele_wewnetrzne.json');

const czujnik_temp_zew = require('./handles/czujnik_temp_zew.json')
const czujnik_wilg_zew = require('./handles/czujnik_wilg_zew.json')
const czujnik_zbiornika_deszczowki = require('./handles/czujnik_zbiornika_deszczowki.json')
const czujnik_deszcz_zew = require('./handles/czujnik_deszcz_zew.json')
const czujnik_temp_pokoj_1 = require('./handles/czujnik_temp_pokoj_1.json')


// constants
const module_name = "Aktualizator danych";
const help = `<pre>Moduł: ${module_name}
API:
 - /			- zwraca nazwe aplikacji
 - /help		- zwraca pomoc
</pre>`;
const newConditionsPrototype = {
        "temperature" : {
            "outside" : null,
            "inside" : {
                0: null
            }
        },
        "raining": null,
        "humidity": null,
        "rain_tank_level": null
    };

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

function getHTTPGetPromiseOf(handle, callback) {
    return new Promise((resolve, reject) => {
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

    var handle_temp_zew = czujnik_temp_zew;
    handle_temp_zew.path = '/temperature_outside'; // return { "temperature": <float> }

    var handle_wilg_zew = czujnik_wilg_zew;
    handle_wilg_zew.path = '/humidity_outside'; // returns { "humidity": <float:0.0-100.0> }

    var handle_deszczowka = czujnik_zbiornika_deszczowki;
    handle_deszczowka.path = '/rain_tank_level'; // returns { "rain_tank_level" : <int:0-100> }

    var handle_deszcz = czujnik_deszcz_zew;
    handle_deszcz.path = '/is_raining'; // returns { "is_raining": <true/false> }

    var handle_temp_pokoj_1 = czujnik_temp_pokoj_1;
    handle_temp_pokoj_1.path = '/temperature_inside';
    // returns { "room_id" : <int>, "temperature": <float> }

    var handle_modele_wewnetrzne = modele_wewnetrzne;
    handle_modele_wewnetrzne.path = '/house_state';
    handle_modele_wewnetrzne.method = 'PUT';
    handle_modele_wewnetrzne.headers = { 'Content-Type': 'application/json' };

    var newConditions = newConditionsPrototype;

    getHTTPGetPromiseOf(handle_temp_zew).then((response) => {
        newConditions.temperature.outside = response.temperature;
        return getHTTPGetPromiseOf(handle_wilg_zew);
    }).then((response) => {
        newConditions.humidity = response.humidity;
        return getHTTPGetPromiseOf(handle_deszczowka);
    }).then((response) => {
        newConditions.rain_tank_level = response.rain_tank_level;
        return getHTTPGetPromiseOf(handle_deszcz);
    }).then((response) => {
        newConditions.raining = response.is_raining;
        return getHTTPGetPromiseOf(handle_temp_pokoj_1);
    }).then((response) => {
        newConditions.temperature.inside[response.room_id] = response.temperature;

        var modelResponse = newConditions;

        var req = http.request(handle_modele_wewnetrzne, (httpRes) => {
            var responseStatusCode = httpRes.statusCode;

            httpRes.on('data', (chunk) => {
                // ignore..?
            });

            httpRes.on('end', () => {
                if(responseStatusCode == 200) {
                    res.status(200).end();
                }
                else {
                    res.status(500).end();
                }
            });
        } );

        console.log("Sending 'aktualizator_danych' -> 'modele_wewnetrzne' :" + JSON.stringify(modelResponse));

        req.on('error', (e) => {
            console.log("!!!! Problem with request: " + e);
        });

        req.write(JSON.stringify(modelResponse));
        req.end();
    });
});
