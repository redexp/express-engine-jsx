const React = require('react');
const ReactDOM = require('react-dom/server');
const {isAbsolute} = require('path');
const options = require('./options');
const requireJSX = require('./require');
const Context = require('./Context');

module.exports = engine;

function engine(path, params, cb) {
	var Component = requireJSX(path.replace(/\.jsx$/, ''));
	var html = ReactDOM.renderToStaticMarkup(
		React.createElement(Context.Provider, {value: {locals: params._locals, settings: params.settings}},
			React.createElement(Component, params))
	);

	if (options.replace) {
		html = options.replace(html);
	}

	cb(null, options.doctype + html);
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
		if (!isAbsolute(params.cache)) {
			throw new Error('Parameter "cache" should be absolute path to directory');
		}

		options.cache = params.cache;
	}

	if (params.views) {
		if (!isAbsolute(params.views)) {
			throw new Error('Parameter "views" should be absolute path to directory');
		}

		options.views = params.views;
	}

	if (params.hasOwnProperty('doctype')) {
		options.doctype = params.doctype;
	}

	if (params.hasOwnProperty('replace')) {
		options.replace = params.replace;
	}

	return engine;
};