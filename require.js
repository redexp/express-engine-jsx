const {resolve, isAbsolute, dirname} = require('path');
const fs = require('fs');
const convert = require('./convert');
const run = require('./run');

const local = /^\.{0,2}\//;
const engineModule = /^express-engine-jsx(\/|$)/;

module.exports = requireJSX;

requireJSX.cache = {};

function requireJSX(path, currentWorkingDir) {
	if (!local.test(path)) {
		if (engineModule.test(path)) {
			return require(path.replace(engineModule, './'));
		}

		var resolvedPath = resolveJSX(path);

		if (!resolvedPath) {
			return require(path);
		}

		path = resolvedPath;
	}

	if (isAbsolute(path)) {
		currentWorkingDir = null;
	}
	else if (!currentWorkingDir) {
		const site = require('callsites')()[1];

		currentWorkingDir = site && dirname(site.getFileName());

		if (!currentWorkingDir || !isAbsolute(currentWorkingDir)) throw new Error('currentWorkingDir required');
	}
	else if (!isAbsolute(currentWorkingDir)) {
		throw new Error('currentWorkingDir must be absolute path');
	}

	if (currentWorkingDir) {
		path = resolve(currentWorkingDir, path);
	}

	let {cache} = requireJSX;

	if (cache[path]) return cache[path].moduleExports;

	if (fs.existsSync(path + '.js') || fs.existsSync(resolve(path, 'index.js'))) {
		return require(path);
	}

	var pathJSX;

	if (!fs.existsSync((pathJSX = path + '.jsx')) && !fs.existsSync((pathJSX = resolve(path, 'index.jsx')))) {
		throw new Error(`JSX file not found ${JSON.stringify(path)}`);
	}

	let result = convert(fs.readFileSync(pathJSX), {
		path: pathJSX
	});

	let code = typeof result === 'string' ? result : result.code;
	let map = typeof result === 'string' ? null : result.map;

	let moduleExports = run(code, {
		path: pathJSX
	});

	cache[path] = {
		moduleExports,
		map,
	};

	return moduleExports;
}

function resolveJSX(path) {
	try {
		path = require.resolve(path + '.jsx');
	}
	catch (e1) {
		try {
			path = require.resolve(resolve(path, 'index.jsx'));
		}
		catch (e2) {
			return null;
		}
	}

	return path.replace(/\.jsx$/, '');
}