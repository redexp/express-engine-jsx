const vm = require('vm');
const {dirname} = require('path');

module.exports = run;

function run(code, params = {}) {
	if (code instanceof Buffer) {
		code = code.toString();
	}

	let {path, scriptOptions = {}, context = {}} = params;

	const script = new vm.Script(code, {
		filename: path,
		...scriptOptions,
	});

	context = {
		module: {
			exports: {}
		},
		__dirname: path && dirname(path),
		require: require('./require'),
		...context,
	};

	script.runInNewContext(context);

	return context.module && context.module.exports;
}