const {resolve, dirname} = require('path');
const fs = require('fs');
const convert = require('./convert');

const local = /^\.{0,2}\//;
const engineModule = /^express-engine-jsx(\/|$)/;

module.exports = requireJSX;

requireJSX.cache = {};

function requireJSX(path, currentDir) {
	if (!local.test(path)) {
		if (engineModule.test(path)) {
			return require(path.replace(engineModule, './'));
		}

		var resolvedPath = resolveJSX(path);

		if (!resolvedPath) {
			return require(path);
		}

		path = resolvedPath;
		currentDir = null;
	}

	if (currentDir) {
		path = resolve(currentDir, path);
	}

	let {cache} = requireJSX;

	if (cache[path]) return run(cache[path]);

	if (fs.existsSync(path + '.js')) {
		return require(path);
	}

	if (!fs.existsSync(path + '.jsx')) {
		throw new Error(`JSX file not found ${JSON.stringify(path)}`);
	}

	let script = cache[path] = convert(path + '.jsx');

	script.dirname = dirname(path);

	return run(cache[path]);
}

function resolveJSX(path) {
	try {
		path = require.resolve(path + '.jsx');
	}
	catch (e) {
		return null;
	}

	return path.replace(/\.jsx$/, '');
}

function run(script) {
	if (script.result) return script.result;

	const context = {
		module: {
			exports: {}
		},
		__dirname: script.dirname,
		require: requireJSX,
	};

	script.runInNewContext(context);

	script.result = context.module.exports;

	return script.result;
}