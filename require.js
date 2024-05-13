const {resolve, isAbsolute, dirname} = require('path');
const {existsSync, readFileSync} = require('fs');
const convert = require('./convert');
const run = require('./run');

const local = /^\.{0,2}\//;
const engineModule = /^express-engine-jsx(\/|$)/;

module.exports = requireJSX;

requireJSX.cache = new Map();

function requireJSX(path, currentWorkingDir) {
	if (!local.test(path)) {
		if (engineModule.test(path)) {
			return require(path.replace(engineModule, './'));
		}

		const resolvedPath = resolveJSX(path);

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

	const {cache} = requireJSX;

	if (cache.has(path)) return cache.get(path).moduleExports;

	if (existsSync(path + '.js') || existsSync(resolve(path, 'index.js'))) {
		return require(path);
	}

	let pathJSX;

	if (!existsSync((pathJSX = path + '.jsx')) && !existsSync((pathJSX = resolve(path, 'index.jsx')))) {
		throw new Error(`JSX file not found ${JSON.stringify(path)}`);
	}

	const result = convert(readFileSync(pathJSX), {
		path: pathJSX
	});

	const code = typeof result === 'string' ? result : result.code;
	const map = typeof result === 'string' ? null : result.map;

	const moduleExports = run(code, {
		path: pathJSX
	});

	cache.set(path, {
		moduleExports,
		map,
	});

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