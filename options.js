module.exports = {
	cache: '',
	views: '',
	doctype: "<!DOCTYPE html>\n",
	template: `
var React = require('react');
var requireJSX = require('express-engine-jsx/require');

module.exports = function (props) {
  var __components = [];

  with (props) {
    BODY
  }

  return __components;
};`
};