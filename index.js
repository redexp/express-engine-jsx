var options = require('./options');
var requireJSX = require('./require');
var React = require('react');
var ReactDOM = require('react-dom/server');

module.exports = engine;

function engine(path, params, cb) {
	var Component = requireJSX(path.replace(/\.jsx$/, ''));

	cb(null,
		options.doctype +
		ReactDOM.renderToStaticMarkup(React.createElement(Component, params))
	);
}

engine.attachTo = function (server, params) {
	if (!params.cache) {
		throw new Error('Parameter "cache" is required');
	}

	if (!params.views) {
		throw new Error('Parameter "views" is required');
	}

	engine.setOptions(params);

	server.engine('jsx', engine);
	server.set('views', options.views);
	server.set('view engine', 'jsx');

	return engine;
};

engine.setOptions = function (params) {
	if (params.cache) {
		if (params.cache.charAt(0) !== '/') {
			throw new Error('Parameter "cache" should be absolute path to directory');
		}

		options.cache = params.cache;
	}

	if (params.views) {
		if (params.views.charAt(0) !== '/') {
			throw new Error('Parameter "views" should be absolute path to directory');
		}

		options.views = params.views;
	}

	if (params.hasOwnProperty('doctype')) {
		options.doctype = params.doctype;
	}

	return engine;
};