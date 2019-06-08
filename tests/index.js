const {expect} = require('chai');
const fs = require('fs');
const {resolve} = require('path');
const {exec} = require('child_process');
const ReactDOM = require('react-dom/server');
const engine = require('../index');
const requireJSX = require('../require');
const options = require('../options');

engine.setOptions({
	cache: dirPath('cache'),
	views: dirPath('views'),
});

function rmDir(path) {
	if (fs.existsSync(path)) {
		exec('rm -rf ' + path);
	}
}

function dirPath(path) {
	var args = [__dirname].concat(path.split('/'));

	return resolve.apply(null, args);
}

describe('convert', function () {
	beforeEach(function () {
		rmDir(dirPath('cache'));
		rmDir(dirPath('views/cache'));
	});

	it('should convert users view', function () {
		var html = ReactDOM.renderToStaticMarkup(requireJSX('./views/app/users', __dirname)({
			users: [
				{name: 'Max'},
				{name: 'Bob'},
			]
		}));

		expect(html).to.equal(fs.readFileSync(dirPath('html/users.html')).toString());
	});

	it('should convert users view with engine', function (done) {
		engine(dirPath('views/app/users.jsx'), {
			users: [
				{name: 'Max'},
				{name: 'Bob'},
			]
		}, function (err, html) {
			expect(err).to.equal(null);
			expect(html).to.equal(options.doctype + fs.readFileSync(dirPath('html/users.html')).toString());
			done();
		});
	});

	it('should convert with cache in views dir', function () {
		engine.setOptions({
			cache: dirPath('views/cache')
		});

		var html = ReactDOM.renderToStaticMarkup(requireJSX('./views/app/users', __dirname)({
			users: [
				{name: 'Max'},
				{name: 'Bob'},
			]
		}));

		expect(html).to.equal(fs.readFileSync(dirPath('html/users.html')).toString());
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
			_locals: {
				test1: 'test_1'
			},
			test2: 'test_2'
		}, function (err, html) {
			expect(err).to.equal(null);
			expect(html).to.equal(options.doctype + fs.readFileSync(dirPath('html/context.html')).toString().replace(/\n/g, ''));
			done();
		});
	});
});