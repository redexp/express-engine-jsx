const React = require('react');
const ReactDOM = require('react-dom/server');
const options = require('./options');
const requireJSX = require('./require');
const Context = require('./Context');

module.exports = engine;

function engine(path, params, cb) {
	const Component = requireJSX(path.replace(/\.jsx$/, ''));

	const context = {
		locals: Object.assign({}, params.locals, params._locals),
		settings: params.settings,
	};

	let html = ReactDOM.renderToStaticMarkup(
		React.createElement(Context.Provider, {value: context},
			React.createElement(Component, params)
		)
	);

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

engine.setOptions = function (params) {
	for (let key in params) {
		if (options.hasOwnProperty(key)) {
			options[key] = params[key];
		}
	}

	return engine;
};