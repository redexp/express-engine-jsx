const fs = require('fs');
const {resolve} = require('path');

const namesPath = resolve(__dirname, '..', 'data', 'attr-names.json');
const mapPath = resolve(__dirname, '..', 'attr-map.json');

let list = fs.readFileSync(namesPath, 'utf-8');

list = JSON.parse(list)
	.filter(function (attr) {
		return /[A-Z]/.test(attr) || attr.includes('-');
	})
	.reduce(function (hash, attr) {
		const key = (
			attr === 'className' ?
				'class' :
			attr === 'htmlFor' ?
				'for' :
				attr.toLowerCase()
		);

		if (attr.includes('-')) {
			attr = attr.replace(/-(\w)/g, function (x, w) {
				return w.toUpperCase();
			});
		}

		hash[key] = attr;

		return hash;
	}, {});

fs.writeFileSync(mapPath, JSON.stringify(list));
