const React = require('react');
const ReactDOM = require('react-dom/server');
const options = require('./options');
const requireJSX = require('./require');
const convert = require('./convert');
const run = require('./run');
const Context = require('./Context');

module.exports = engine;

function engine(path, params = {}, cb = null) {
	if (typeof params === 'function') {
		cb = params;
		params = {};
	}

	const Component = requireJSX(path.replace(/\.jsx$/, ''));

	const context = {
		locals: Object.assign({}, params.locals, params._locals),
		settings: params.settings,
	};

	try {
		var html = ReactDOM.renderToStaticMarkup(
			React.createElement(Context.Provider, {value: context},
				React.createElement(Component, params)
			)
		);
	}
	catch (err) {
		if (err && typeof err.stack === 'string') {
			Object.keys(requireJSX.cache).forEach(function (path) {
				var {map} = requireJSX.cache[path];

				if (!map) return;

				let pathJSX = path + '.jsx';

				if (!err.stack.includes(pathJSX)) return;

				const {SourceMapConsumer} = require('source-map-sync');

				SourceMapConsumer.with(map, null, function (consumer) {
					err.stack = err.stack.replace(new RegExp(escapeRegexp(pathJSX) + ":(\\d+):(\\d+)", "g"), function (x, l, c) {
						let {line, column} = consumer.originalPositionFor({line: Number(l), column: Number(c)});

						if (line === null) return x;

						return `${pathJSX}:${line}:${column}`;
					});
				});
			});
		}

		if (cb) {
			cb(err);
			return;
		}
		else {
			throw err;
		}
	}

	if (options.replace) {
		html = options.replace(html);
	}

	if (options.doctype) {
		html = options.doctype + html;
	}

	if (cb) {
		cb(null, html);
	}
	else {
		return html;
	}
}

function escapeRegexp(str) {
	return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

engine.setOptions = function (params) {
	for (let key in params) {
		if (options.hasOwnProperty(key)) {
			options[key] = params[key];
		}
	}

	return engine;
};

engine.require = requireJSX;
engine.convert = convert;
engine.run = run;
engine.Context = Context;