const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const createTemplate = require('@babel/template').default;
const t = require('@babel/types');
const fs = require('fs');
const attrMap = require('./attr-map');
const options = require('./options');

module.exports = convert;

convert.cache = {};

function convert(code, params = {}) {
	if (code instanceof Buffer) {
		code = code.toString();
	}

	let {
		path,
		sourceMap = options.sourceMap,
		addOnChange = options.addOnChange,
		parserOptions = options.parserOptions,
		template,
		templatePath = options.templatePath,
		templateOptions = options.templateOptions
	} = params;

	var ast = parser.parse(code, parserOptions);

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
					var parent = attr.parent;

					if (addOnChange && (name === 'value' || name === 'checked') && parent.name && parent.name.name === 'input') {
						attr.parent.attributes.push(
							t.jsxAttribute(
								t.jsxIdentifier('onChange'),
								t.jsxExpressionContainer(t.arrowFunctionExpression([], t.booleanLiteral(false)))
							)
						);
					}

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

	if (template === false) {
		return toCode(ast, code, {
			filename: path,
			sourceMap,
		});
	}

	let {cache} = convert;

	if (templatePath && !template) {
		if (convert.cache[templatePath]) {
			template = convert.cache[templatePath];
		}
		else {
			template = fs.readFileSync(templatePath);
		}
	}

	if (template instanceof Buffer) {
		template = template.toString();
	}

	if (typeof template === 'string') {
		template = createTemplate(
			template,
			templateOptions
		);

		if (templatePath) {
			cache[templatePath] = template;
		}
	}

	if (typeof template !== 'function') {
		throw new Error('Undefined template');
	}

	ast = template({
		BODY: ast.program.body
	});

	return toCode(t.program(ast), code, {
		filename: path,
		sourceMap,
	});
}

function toCode(ast, code = '', params = {}) {
	const {filename, sourceMap} = params;

	var result = babel.transformFromAst(ast, code, {
		filename,
		sourceMap,
		plugins: [
			'@babel/plugin-transform-react-jsx'
		]
	});

	return sourceMap ? result : result.code;
}