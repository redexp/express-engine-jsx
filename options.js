module.exports = {
	cache: '',
	views: '',
	doctype: "<!DOCTYPE html>\n",
	template: `
var React = require('react');
var PropTypes = require('prop-types');
var requireJSX = require('express-engine-jsx/require');

module.exports = function (props, context) {
  context = context || {};
  context.locals = context.locals || {};
  var __components = [];

  with (context.locals) {
    with (props) {
      BODY
    }
  }

  return __components;
};

module.exports.contextTypes = {
  locals: PropTypes.object,
  settings: PropTypes.object
};
`
};