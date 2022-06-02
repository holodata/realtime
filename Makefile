all: build push deploy

build:
	docker-compose build --pull

push:
	docker-compose push

deploy:
	docker rm -f holodata.org
	docker-compose -f docker-compose.production.yml up -d
