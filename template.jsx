IMPORTS
const React = require('react');
const requireJSX = require('express-engine-jsx/require');
const EngineContext = require('express-engine-jsx/Context');

module.exports = function (props) {
	const __components = [];
	const context = React.useContext(EngineContext);
	const locals = context.locals || {};

	with (locals) {
		with (props) {
			BODY
		}
	}

	return __components;
};

module.exports.default = module.exports;
module.exports.__esModule = true;
