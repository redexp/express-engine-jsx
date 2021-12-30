const babel = require('@babel/core');
const createTemplate = require('@babel/template').default;
const transformModulesCommonjs = require('@babel/plugin-transform-modules-commonjs');
const transformReactJsx = require('@babel/plugin-transform-react-jsx');
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
	} = params;

	var result = babel.transformSync(code, {
		filename: path,
		sourceMap,
		plugins: [
			babel.createConfigItem([transformToComponent, params]),
			babel.createConfigItem([transformModulesCommonjs, {strictMode: false}]),
			babel.createConfigItem(transformRequire),
			babel.createConfigItem(transformReactJsx),
		]
	});

	return sourceMap ? result : result.code;
}

function transformToComponent(api, params) {
	let {
		addOnChange = options.addOnChange,
		template,
		templatePath = options.templatePath,
		templateOptions = options.templateOptions
	} = params;

	return {
		visitor: {
			Program: {
				enter: function (path) {
					path.get('body').forEach(function (item) {
						if (
							item.isExpressionStatement() &&
							(
								item.get('expression').isJSXElement() ||
								item.get('expression').isJSXFragment()
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
				},
				exit: function (path) {
					if (template === false) return;

					const {cache} = convert;

					if (templatePath && !template) {
						template = cache[templatePath] || fs.readFileSync(templatePath);
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

					var IMPORTS = [];
					var BODY = [];

					path.get('body').forEach(function (item) {
						var {node} = item;

						if (isExport(node)) {
							throw item.buildCodeFrameError('export is not allowed in jsx template');
						}

						if (t.isImportDeclaration(node)) {
							IMPORTS.push(node);
						}
						else {
							BODY.push(node);
						}
					});

					path.node.body = template({
						IMPORTS,
						BODY,
					});
				},
			},
			JSXAttribute: function (path) {
				var name = path.node.name.name;
				var parent = path.parent;

				if (
					addOnChange &&
					(name === 'value' || name === 'checked') &&
					parent.name &&
					parent.name.name === 'input' &&
					parent.attributes.every(attr => attr.name.name !== 'onChange')
				) {
					parent.attributes.push(
						t.jsxAttribute(
							t.jsxIdentifier('onChange'),
							t.jsxExpressionContainer(t.arrowFunctionExpression([], t.booleanLiteral(false)))
						)
					);
				}

				if (attrMap.hasOwnProperty(name)) {
					path.node.name.name = attrMap[name];
				}
			},
		}
	};
}

function transformRequire() {
	const rule = /^(react|express-engine-jsx\/.+)$/

	return {
		visitor: {
			Program: {
				exit: function (path) {
					var {body} = path.node;

					var node = body.find(node => (
						t.isVariableDeclaration(node) &&
						(node = node.declarations[0]) &&
						t.isIdentifier(node.id) &&
						node.id.name === 'requireJSX'
					));

					if (!node) return;

					node._blockHoist = 3;

					var index = body.indexOf(node);

					if (index === 0) return;

					body.splice(index, 1);
					body.unshift(node);
				}
			},
			CallExpression: function ({node}) {
				var {callee, arguments: args} = node;
				var first = args[0];

				if (
					t.isIdentifier(callee) &&
					callee.name === 'require' &&
					args.length === 1 &&
					t.isStringLiteral(first) &&
					!rule.test(first.value)
				) {
					callee.name = 'requireJSX';
					args.push(t.identifier('__dirname'));
				}
			}
		}
	};
}

function isExport(node) {
	return (
		t.isExportAllDeclaration(node) ||
		t.isExportDeclaration(node) ||
		t.isExportDefaultDeclaration(node) ||
		t.isExportNamedDeclaration(node) ||
		t.isExportNamespaceSpecifier(node)
	);
}