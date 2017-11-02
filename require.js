var p = require('path');
var fs = require('fs');
var options = require('./options');
var convert = require('./convert');

var local = /^.?\//;

module.exports = function (path, dirname) {
	if (!local.test(path)) {
		return require(path);
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