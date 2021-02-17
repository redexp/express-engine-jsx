const {resolve} = require('path');

module.exports = {
	parserOptions: {
		sourceType: "module",
		strictMode: false,
		plugins: [
			'jsx'
		],
	},
	doctype: "<!DOCTYPE html>\n",
	replace: null,
	templatePath: resolve(__dirname, 'template.jsx'),
};