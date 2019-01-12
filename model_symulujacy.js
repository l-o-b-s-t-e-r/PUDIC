const express = require('express');
const app = express();
const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));

const self_handle = require('./handles/model_symulujacy.json');

var port = 8400;

const module_name = "Model symulujacy";
const help = `<pre>Aplikacja: Modele symulujące
API - GET:
 - /			- zwraca nazwe aplikacji
 - /status		- zwraca obecny stan wewnetrzny
 - /help		- wyswietla pomoc
 - /rain		- zwraca obiekt
				{ "is_raining" : true/false }
 - /rain_tank_level	- zwraca obiekt
				{ "rain_tank_level" : &lt;rain_tank_level&gt; }
 - /temperature/outside	- zwraca obiekt
				{ "temperature" : &lt;temperature&gt; }
 - /humidity/outside	- zwraca obiekt
				{ "humidity" : &lt;humidity&gt; }
 - /temperature/inside/{room_id}
			- jesli pokoj istnieje, zwraca obiekt
				{ "room_id" : &lt;id&gt;
				  , "tempearture": &lt;temperature&gt; }
			  jesli pokoj nie istnieje, zwraca HTTP status 404
 - /window/{id}/state	- jesli okno istnieje, zwraca obiekt
				{ "window_id" : &lt;id&gt;, "state" : true/false }
			  jesli okno nie istnieje, zwraca HTTP status 404
 - /door/{id}/state	- jesli drzwi istnieja, zwraca obiekt
				{ "door_id" : &lt;id&gt;, "state" : true/false }
			  jesli drzwi nie istnieja, zwraca HTTP status 404

API - PUT:
 - /window/{id}/change_state/{state:&lt;true|false&gt;}
			- ustawia nowy stan okna (true - otwarte,
			  false - zamkniete). Zwraca HTTP status code
			   - 200 w przypadku sukcesu
			   - 404 gdy nie ma takiego okna
			   - 400 jesli nowy status jest rozny od true/false
 - /temperature/{value}
			- ustawia nowa wartosc temperatury na zewnatrz.
			  Zwraca HTTP code 200 w przypadku sukcesu.
</pre>`;

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

definePort();
app.listen(port, () =>
	console.log(`${module_name} listening on port ${port}`)
);


// 0 means it's enterance corridor, e.g. temperature.inside.0 is temperature
// in enterance corridor
var conditions = {
	"temperature" : {
		"outside" : 16.5,
		"inside" : {
			0 : 22.7,
			1 : 20.5
		}
	}
	, "windows" : {
		  1 : true
		, 2 : false
	}
	, "doors" : {
		1 : false
	}
	, "raining" : false
	, "humidity" : 80.0
	, "rain_tank_level" : 45
};



app.get('/', (req, res) => res.send(conditions));

app.get('/help', (_, res) => res.send(help));

app.get('/status', (req, res) => {
	res.send(conditions);
});

app.get('/rain', (_, res) => {
	var is_raining = conditions.raining;
	res.send( { "is_raining" : is_raining } );
});

app.get('/rain_tank_level', (_, res) => {
	var tank_lvl = conditions.rain_tank_level;
	res.send( { "rain_tank_level" : tank_lvl } );
});

app.get('/temperature/outside', (req, res) => {
	var temperature = conditions.temperature.outside;
	res.send( { "temperature" : temperature } );
});

app.get('/humidity/outside', (req, res) => {
	var humidity = conditions.humidity;
	res.send( { "humidity" : humidity } );
});

app.get('/temperature/inside/:roomId', (req, res) => {
	var roomId = parseInt(req.params["roomId"]);
	if(!conditions.temperature.inside.hasOwnProperty(roomId)) {
		res.status(404).end();
	}
	var temperature = conditions.temperature.inside[roomId];
	res.send( { "room_id" : roomId, "temperature" : temperature } );
});

app.get('/window/:windowId/state', (req, res) => {
	var windowId = parseInt(req.params["windowId"]);
	// check if window exists; if not, return HTTP 404
	if(!conditions.windows.hasOwnProperty(windowId)) {
		res.status(404).end();
	}

	var windowState = conditions.windows[windowId];
	res.send({ "room_id" : windowId, "state" : windowState });
});

app.get('/door/:doorId/state', (req, res) => {
	var doorId = parseInt(req.params["doorId"]);

	if(!conditions.doors.hasOwnProperty(doorId)) {
		res.status(404).end();
	}

	var doorState = conditions.doors[doorId];
	res.send({ "door_id" : doorId, "state" : doorState });
});

app.put('/window/:windowId/change_state/:newState', (req, res) => {
  console.log("change window state");
	var windowId = parseInt(req.params["windowId"]);
	if(!conditions.windows.hasOwnProperty(windowId)) {
		res.status(404).end();
	}

	var newStateRaw = req.params["newState"].toLowerCase();

	if(newStateRaw === 'true' || newStateRaw === 'false') {
		conditions.windows[windowId] = (newStateRaw == 'true');
		res.status(200).end();
	}
	else {
		res.status(400).end();
	}
});

app.put('/door/:doorId/change_state/:newState', (req, res) => {
  console.log("change door state");
	var doorId = parseInt(req.params["doorId"]);
	if(!conditions.doors.hasOwnProperty(doorId)) {
		res.status(404).end();
	}

	var newStateRaw = req.params["newState"].toLowerCase();

	if(newStateRaw === 'true' || newStateRaw === 'false') {
		conditions.doors[doorId] = (newStateRaw == 'true');
		res.status(200).end();
	}
	else {
		res.status(400).end();
	}
});

app.put('/temperature/:value', (req, res) => {

	var temperatureRaw = req.params["value"];

	conditions.temperature.outside = parseFloat(temperatureRaw);
	res.status(200).end();
});

app.get('/actual_state', (req, res) => {
  res.send(conditions)
});
