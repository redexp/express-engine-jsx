const {resolve, isAbsolute} = require('path');
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
		throw new Error(`Relative path. Required currentWorkingDir parameter`);
	}
	else if (!isAbsolute(currentWorkingDir)) {
		throw new Error('currentWorkingDir must be absolute path');
	}

	if (currentWorkingDir) {
		path = resolve(currentWorkingDir, path);
	}

	let {cache} = requireJSX;

	if (cache[path]) return cache[path];

	if (fs.existsSync(path + '.js')) {
		return require(path);
	}

	const pathJSX = path + '.jsx';

	if (!fs.existsSync(pathJSX)) {
		throw new Error(`JSX file not found ${JSON.stringify(path)}`);
	}

	let code = convert(fs.readFileSync(pathJSX));

	cache[path] = run(code, {path: pathJSX});

	return cache[path];
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