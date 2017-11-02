var babel = require('babel-core');
var babylon = require('babylon');
var traverse = require('babel-traverse').default;
var template = require('babel-template');
var t = require('babel-types');
var fs = require('fs');

var createExportFunctionWith = template(`
var React = require('react');
var requireJSX = require('/home/sergii/Projects/express-view-react/src/require');

module.exports = function (__params__) {
	var __elements__ = [];
	
	WITH
	
	return __elements__;
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
							t.memberExpression(t.identifier('__elements__'), t.identifier('push')),
							[item.node.expression]
						)
					);
				}
			});

			path.traverse({
				JSXAttribute: function (attr) {
					switch (attr.node.name.name) {
					case 'class':
						attr.node.name.name = 'className';
						break;
					case 'charset':
						attr.node.name.name = 'charSet';
						break;
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
			t.identifier('__params__'),
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

	fs.writeFileSync(outPath, res.code);
};
