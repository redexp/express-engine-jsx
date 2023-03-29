const {resolve} = require('path');
const {renderToStaticMarkup} = require('react-dom/server');

const DEV = process.env.NODE_ENV !== 'production';

module.exports = {
	DEV,
	sourceMap: DEV,
	parserOptions: {
		sourceType: "module",
		strictMode: false,
		plugins: [
			'jsx'
		],
	},
	templateOptions: {
		strictMode: false
	},
	addOnChange: true,
	doctype: "<!DOCTYPE html>\n",
	replace: null,
	renderer: renderToStaticMarkup,
	templatePath: resolve(__dirname, 'template.jsx'),
};