const {join} = require('path');
const fs = require('fs');
const options = require('./options');

const local = /^\.{0,2}\//;

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
		path = join(dirname, path);
	}

	if (fs.existsSync(path + '.js')) {
		return require(path);
	}

	if (path.indexOf(options.cache) === 0) {
		var viewsPath = path.replace(options.cache, options.views);

		if (fs.existsSync(viewsPath + '.jsx')) {
			convert(viewsPath + '.jsx', path + '.js');
		}
		else if (fs.existsSync(viewsPath + '.js')) {
			return require(viewsPath);
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