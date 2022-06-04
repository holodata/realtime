all: build push deploy

build:
	docker-compose build --pull

push:
	docker-compose push

deploy:
	docker-compose -f docker-compose.production.yml up -d
