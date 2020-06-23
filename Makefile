install:
	npm install

lint:
	npx eslint .

publish:
	npm publish --dry-run

test:
	npx jest

watch:
	npx jest --watch

test-coverage:
	npm test -- --coverage