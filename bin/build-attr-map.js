var fs = require('fs');
var list = fs.readFileSync(process.argv[2]).toString();
list = JSON.parse(list);
list = list
	.filter(function (attr) {
		return /[A-Z]/.test(attr);
	})
	.reduce(function (hash, attr) {
		hash[attr.toLowerCase()] = attr;

		return hash;
	}, {})
;
fs.writeFileSync(process.argv[3], JSON.stringify(list));
