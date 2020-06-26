develop:
	npx webpack-dev-server

install:
	npm install

build:
	NODE_ENV=production npx webpack

dev:
	npx webpack --mode development

test:
	npm test

lint:
	npx eslint .

.PHONY: test
