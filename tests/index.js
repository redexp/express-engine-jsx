var expect = require('chai').expect;
var engine = require('../index');
var requireJSX = require('../require');
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
});