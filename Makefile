all: deploy

build:
	docker-compose build --pull

push:
	docker-compose push

deploy: build
	docker-compose -f docker-compose.production.yml up -d
