var expect = require('chai').expect;
var engine = require('../index');
var requireJSX = require('../require');
var options = require('../options');
var ReactDOM = require('react-dom/server');
var fs = require('fs');
var exec = require('child_process').exec;

engine.setOptions({
	cache: __dirname + '/cache',
	views: __dirname + '/views'
});

function rmDir(path) {
	if (fs.existsSync(path)) {
		exec('rm -rf ' + path);
	}
}

describe('convert', function () {
	beforeEach(function () {
		rmDir(__dirname + '/cache');
		rmDir(__dirname + '/views/cache');
	});

	it('should convert users view', function () {
		var html = ReactDOM.renderToStaticMarkup(requireJSX('./views/app/users', __dirname)({
			users: [
				{name: 'Max'},
				{name: 'Bob'},
			]
		}));

		expect(html).to.equal(fs.readFileSync(__dirname + '/html/users.html').toString());
	});

	it('should convert users view with engine', function (done) {
		engine(__dirname + '/views/app/users.jsx', {
			users: [
				{name: 'Max'},
				{name: 'Bob'},
			]
		}, function (err, html) {
			expect(err).to.equal(null);
			expect(html).to.equal(options.doctype + fs.readFileSync(__dirname + '/html/users.html').toString());
			done();
		});
	});

	it('should convert with cache in views dir', function () {
		engine.setOptions({
			cache: __dirname + '/views/cache'
		});

		var html = ReactDOM.renderToStaticMarkup(requireJSX('./views/app/users', __dirname)({
			users: [
				{name: 'Max'},
				{name: 'Bob'},
			]
		}));

		expect(html).to.equal(fs.readFileSync(__dirname + '/html/users.html').toString());
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

		engine(__dirname + '/views/doctype.jsx', {version: 4}, function (err, html) {
			expect(html).to.equal(
				`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n<html></html>`
			);
		});

		engine(__dirname + '/views/doctype.jsx', {version: 5}, function (err, html) {
			expect(html).to.equal(
				`<!DOCTYPE html>\n<html></html>`
			);
			done();
		});
	});
});