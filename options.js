const {resolve} = require('path');

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
	templatePath: resolve(__dirname, 'template.jsx'),
};