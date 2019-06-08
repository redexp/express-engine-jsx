module.exports = {
	cache: '',
	views: '',
	doctype: "<!DOCTYPE html>\n",
	template: `
const React = require('react');
const requireJSX = require('express-engine-jsx/require');
const Context = require('express-engine-jsx/Context');

module.exports = function (props, context) {
  var locals = context && context.locals || {};
  var __components = [];

  with (locals) {
    with (props) {
      BODY
    }
  }

  return __components;
};

module.exports.contextType = Context;
`
};