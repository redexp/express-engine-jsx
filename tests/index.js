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
		var params = {template: false, sourceMap: false};

		var hasValue = convert(`<input value="test"/>`, params);
		var hasChecked = convert(`<input checked/>`, params);
		var notInput = convert(`<Test checked/>`, params);
		var noValue = convert(`<input type="text"/>`, params);
		var noChecked = convert(`<input type="checkbox"/>`, params);

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

	it('should map error stack', function (done) {
		var path = dirPath('views/error');

		engine.setOptions({sourceMap: true});

		try {
			engine(path, {test: 1});
		}
		catch (err) {
			expect(err.stack).to.include(`${path}.jsx:4:7`);
		}

		engine(path, {test: 2}, function (err) {
			try {
				expect(err.stack).to.include(`${path}2.jsx:1:6`);
			}
			catch (e) {
				done(e);
				return;
			}

			done();
		});
	});

	it('should handle import ... from', function () {
		convert(`
			import id from 'some/path';
			import id1, {id2, id3 as id4} from 'some/path';
			import * as id5 from 'some/path';
			
			test(id, id1, id2, id4, id5);
			
			<tag/>
		`);

		expect(() => {convert(`
			<input/>
			
			export const Inp = <input/>;
		`)}).to.throw('export is not allowed in jsx template');
	});
});