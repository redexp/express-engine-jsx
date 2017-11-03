var expect = require('chai').expect;
var engine = require('../index');
var requireJSX = require('../require');
var ReactDOM = require('react-dom/server');
var fs = require('fs');

engine.setOptions({
	cache: __dirname + '/cache',
	views: __dirname + '/views'
});

describe('convert', function () {
	it('should convert users view', function () {
		var html = ReactDOM.renderToStaticMarkup(requireJSX('./views/app/users', __dirname)({
			users: [
				{name: 'Max'},
				{name: 'Bob'},
			]
		}));

		expect(html).to.equal(fs.readFileSync(__dirname + '/html/users.html').toString());
	});
});