#!/bin/bash

# model symulujacy
sudo docker run -it --rm -d --name model_symulujacy -p 8400:8400 \
	 -v "$PWD":/usr/src/app -w /usr/src/app \
	 node:8 node model_symulujacy.js

# czujniki - zewnatrz
sudo docker run -it --rm -d --name czujnik_temp_zew -p 8101:8101 \
	 -v "$PWD":/usr/src/app -w /usr/src/app \
	 --network="host" \
	 node:8 node czujnik_temp_zew.js
sudo docker run -it --rm -d --name czujnik_wilg_zew -p 8102:8102 \
	 -v "$PWD":/usr/src/app -w /usr/src/app \
	 --network="host" \
	 node:8 node czujnik_wilg_zew.js
sudo docker run -it --rm -d --name czujnik_deszcz_zew -p 8103:8103 \
	 -v "$PWD":/usr/src/app -w /usr/src/app \
	 --network="host" \
	 node:8 node czujnik_deszcz_zew.js
sudo docker run -it --rm -d --name czujnik_zbiornika_deszczowki \
	 -p 8104:8104 \
	 --network="host" \
	 -v "$PWD":/usr/src/app -w /usr/src/app \
	 node:8 node czujnik_zbiornika_deszczowki.js
sudo docker run -it --rm -d --name czujnik_temp_pokoj_1 -p 8111:8111 \
 	 -v "$PWD":/usr/src/app -w /usr/src/app \
	 --network="host" \
	 node:8 node czujnik_temp_pokoj_1.js
sudo docker run -it --rm -d --name czujnik_temp_pokoj_2 -p 8121:8121 \
 	 -v "$PWD":/usr/src/app -w /usr/src/app \
	 --network="host" \
	 node:8 node czujnik_temp_pokoj_2.js
sudo docker run -it --rm -d --name test -p 8080:8080 \
	 -v "$PWD":/usr/src/app -w /usr/src/app \
 	 node:8 node test.js
sudo docker run -it --rm -d --name model_budynku -p 8000:8000 -v "$PWD":/usr/src/app -w /usr/src/app node:8 node model_budynku.js

# TODO add your containers

# verify all are running
sudo docker ps
