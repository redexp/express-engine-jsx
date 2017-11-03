var babel = require('babel-core');
var babylon = require('babylon');
var traverse = require('babel-traverse').default;
var template = require('babel-template');
var t = require('babel-types');
var fs = require('fs');
var p = require('path');
var attrMap = require('./data/attr-map');

var createExportFunctionWith = template(`
var React = require('react');
var requireJSX = require('express-engine-jsx/require');

module.exports = function (props) {
	var __components = [];
	
	WITH
	
	return __components;
};
`);

module.exports = function (jsxPath, outPath) {
	var code = fs.readFileSync(jsxPath).toString();

	var ast = babylon.parse(code, {
		sourceType: "module",
		strictMode: false,
		plugins: [
			'jsx'
		]
	});

	traverse(ast, {
		enter: function prepare(path) {
			path.get('body').forEach(function (item) {
				if (item.isExpressionStatement() && item.node.expression.type === 'JSXElement') {
					item.replaceWith(
						t.callExpression(
							t.memberExpression(t.identifier('__components'), t.identifier('push')),
							[item.node.expression]
						)
					);
				}
			});

			path.traverse({
				JSXAttribute: function (attr) {
					var name = attr.node.name.name;

					if (name === 'class') {
						attr.node.name.name = 'className';
					}
					else if (attrMap.hasOwnProperty(name)) {
						attr.node.name.name = attrMap[name];
					}
				},
				CallExpression: function (func) {
					if (func.node.callee.type === 'Identifier' && func.node.callee.name === 'require') {
						func.node.callee.name = 'requireJSX';
						func.node.arguments.push(t.identifier('__dirname'));
					}
				}
			});

			path.stop();
		}
	});

	ast = createExportFunctionWith({
		WITH: t.withStatement(
			t.identifier('props'),
			t.blockStatement(ast.program.body)
		)
	});

	ast = t.program(ast);

	var res = babel.transformFromAst(ast, '', {
		ast: false,
		plugins: [
			'transform-react-jsx'
		]
	});

	mkdir(outPath);

	fs.writeFileSync(outPath, res.code);
};

function mkdir(path) {
	path = path.replace(/\/[^\/]+\.\w+$/, '');

	if (fs.existsSync(path)) return;

	path = path.match(/\/[^\/]+/g);

	var root = '';
	var dirs = [];
	var i, len;

	for (i = path.length; i >= 0; i--) {
		root = path.join('');

		if (!fs.existsSync(root)) {
			dirs.push(path.pop());
		}
		else {
			break;
		}
	}

	dirs.reverse();

	for (i = 0, len = dirs.length; i < len; i++) {
		root += dirs[i];

		fs.mkdirSync(root);
	}
}