const {expect} = require('chai');
const fs = require('fs');
const {resolve} = require('path');
const ReactDOM = require('react-dom/server');
const React = require('react');
const engine = require('../index');
const requireJSX = require('../require');
const convert = require('../convert');
const options = require('../options');
const Context = require('../Context');

function dirPath(path) {
	var args = [__dirname].concat(path.split('/'));

	return resolve.apply(null, args);
}

function read(path) {
	return fs.readFileSync(dirPath(path)).toString();
}

function run(Component, props = {}, context = {}) {
	return React.createElement(Context.Provider, {value: context}, React.createElement(Component, props));
}

function toHtml(children) {
	return ReactDOM.renderToStaticMarkup(children);
}

describe('convert', function () {
	const origin = {...options};

	beforeEach(function () {
		requireJSX.cache = {};
		engine.setOptions(origin);
	});

	it('should convert users view', function () {
		var Component = requireJSX('./views/app/users', __dirname);

		var html = toHtml(run(Component, {
			users: [
				{name: 'Max'},
				{name: 'Bob'},
			]
		}));

		expect(html).to.equal(read('html/users.html'));
	});

	it('should convert users view with engine', function (done) {
		engine(dirPath('views/app/users.jsx'), {
			users: [
				{name: 'Max'},
				{name: 'Bob'},
			]
		}, function (err, html) {
			expect(err).to.equal(null);
			expect(html).to.equal(options.doctype + read('html/users.html'));
			done();
		});
	});

	it('should replace html', function (done) {
		engine.setOptions({
			doctype: '',
			replace: function (html) {
				return html.replace(/^<html doctype="(\d+)"/, function (x, version) {
					var doctype = version === '4' ?
						'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n' :
						"<!DOCTYPE html>\n"
					;

					return doctype + '<html';
				})
			}
		});

		engine(dirPath('views/doctype.jsx'), {version: 4}, function (err, html) {
			expect(html).to.equal(
				`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n<html></html>`
			);
		});

		engine(dirPath('views/doctype.jsx'), {version: 5}, function (err, html) {
			expect(html).to.equal(
				`<!DOCTYPE html>\n<html></html>`
			);
			done();
		});
	});

	it('should provide context', function (done) {
		engine(dirPath('views/context.jsx'), {
			locals: {
				test1: 'test_1'
			},
			test2: 'test_2'
		}, function (err, html) {
			expect(err).to.equal(null);
			expect(html).to.equal(options.doctype + read('html/context.html').replace(/\n/g, ''));
			done();
		});
	});

	it('should add onChange to input', function () {
		var hasValue = convert(`<input value="test"/>`, {template: false});
		var hasChecked = convert(`<input checked/>`, {template: false});
		var notInput = convert(`<Test checked/>`, {template: false});
		var noValue = convert(`<input type="text"/>`, {template: false});
		var noChecked = convert(`<input type="checkbox"/>`, {template: false});

		expect(hasValue).to.equal(
			`__components.push( /*#__PURE__*/React.createElement("input", {
  value: "test",
  onChange: () => false
}));`
		);

		expect(hasChecked).to.equal(
			`__components.push( /*#__PURE__*/React.createElement("input", {
  checked: true,
  onChange: () => false
}));`
		);

		expect(notInput).to.equal(
			`__components.push( /*#__PURE__*/React.createElement(Test, {
  checked: true
}));`
		);

		expect(noValue).to.equal(
			`__components.push( /*#__PURE__*/React.createElement("input", {
  type: "text"
}));`
		);

		expect(noChecked).to.equal(
			`__components.push( /*#__PURE__*/React.createElement("input", {
  type: "checkbox"
}));`
		);
	});

	it('should require', function () {
		const Layout = requireJSX('./views/layout');
		const Users = requireJSX('./views/app/components/users');

		expect(Layout).to.be.a('function');
		expect(Users).to.be.a('function');
	});
});