var p = require('path');
var fs = require('fs');
var options = require('./options');

var local = /^\.{0,2}\//;

module.exports = function (path, dirname) {
	if (!local.test(path)) {
		var resolvedPath = resolve(path);

		if (!resolvedPath) {
			return require(path);
		}

		path = resolvedPath;
		dirname = null;
	}

	if (dirname) {
		path = p.join(dirname, path);
	}

	if (fs.existsSync(path + '.js')) {
		return require(path);
	}

	if (path.indexOf(options.cache) === 0) {
		var jsxPath = path.replace(options.cache, options.views) + '.jsx';

		if (fs.existsSync(jsxPath)) {
			convert(jsxPath, path + '.js');
		}
	}
	else if (path.indexOf(options.views) === 0) {
		var cachePath = path.replace(options.views, options.cache);

		if (fs.existsSync(cachePath + '.js')) {
			return require(cachePath + '.js');
		}

		if (fs.existsSync(path + '.jsx')) {
			convert(path + '.jsx', cachePath + '.js');
			path = cachePath;
		}
	}

	return require(path);
};

function resolve(path) {
	try {
		path = require.resolve(path + '.jsx');
	}
	catch (e) {
		return null;
	}

	return path.replace(/\.jsx$/, '');
}

function convert(jsxPath, cachePath) {
	return require('./convert')(jsxPath, cachePath);
}