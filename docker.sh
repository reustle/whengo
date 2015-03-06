#!/bin/bash

if [ "$1" == 'build' ]; then
	docker build -t whengoio .
elif [ "$1" == 'run' ]; then
	docker run -d --name="whengoio" `cat settings.txt` whengoio
else
	echo 'Usage: ./docker.sh [build|run]'
fi

