const React = require('react');
const Combiner = require('combined-stream');
const options = require('./options');
const requireJSX = require('./require');
const convert = require('./convert');
const run = require('./run');
const Context = require('./Context');

module.exports = engine;

function engine(path, params = {}, ops = null, cb = null) {
	if (typeof params === 'function') {
		cb = params;
		params = {};
		ops = null;
	}
	else if (typeof ops === 'function') {
		cb = ops;
		ops = null;
	}

	const Component = requireJSX(path.replace(/\.jsx$/, ''));

	const context = {
		locals: Object.assign({}, params.locals, params._locals),
		settings: params.settings,
	};

	const {renderer, replace, doctype} = Object.assign({}, options, ops);

	try {
		var html = renderer(
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

	if (replace) {
		html = replace(html, params);
	}

	if (doctype) {
		if (typeof html === 'string') {
			html = doctype + html;
		}
		else {
			const combiner = new Combiner();
			combiner.append(doctype);
			combiner.append(html);
			html = combiner;
		}
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