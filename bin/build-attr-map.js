const fs = require('fs');
const {resolve} = require('path');

const namesPath = resolve(__dirname, '..', 'data', 'attr-names.json');
const mapPath = resolve(__dirname, '..', 'attr-map.json');

let list = fs.readFileSync(namesPath).toString();

list = JSON.parse(list)
	.filter(function (attr) {
		return /[A-Z]/.test(attr);
	})
	.reduce(function (hash, attr) {
		hash[attr === 'className' ? 'class' : attr.toLowerCase()] = attr;

		return hash;
	}, {});

fs.writeFileSync(mapPath, JSON.stringify(list));
