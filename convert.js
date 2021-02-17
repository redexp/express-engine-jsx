const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const template = require('@babel/template').default;
const t = require('@babel/types');
const fs = require('fs');
const {basename} = require('path');
const vm = require('vm');
const attrMap = require('./attr-map');
const options = require('./options');

var createExportFunction;

module.exports = function convert(jsxPath) {
	const code = fs.readFileSync(jsxPath).toString();

	let ast = parser.parse(code, options.parserOptions);

	traverse(ast, {
		enter: function prepare(path) {
			path.get('body').forEach(function (item) {
				if (
					item.isExpressionStatement() &&
					(
						item.node.expression.type === 'JSXElement' ||
						item.node.expression.type === 'JSXFragment'
					)
				) {
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

					if (attrMap.hasOwnProperty(name)) {
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

	if (!createExportFunction) {
		createExportFunction = template(
			fs.readFileSync(options.templatePath).toString(),
			{
				parser: {
					strictMode: false
				},
				strictMode: false
			}
		);
	}

	ast = createExportFunction({
		BODY: ast.program.body
	});

	ast = t.program(ast);

	var res = babel.transformFromAst(ast, '', {
		ast: false,
		plugins: [
			'@babel/plugin-transform-react-jsx'
		]
	});

	const script = new vm.Script(res.code, {
		filename: basename(jsxPath)
	});

	return script;
};