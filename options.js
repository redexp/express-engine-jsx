module.exports = {
	cache: '',
	views: '',
	doctype: "<!DOCTYPE html>\n",
	template: `
const React = require('react');
const requireJSX = require('express-engine-jsx/require');
const EngineContext = require('express-engine-jsx/Context');

module.exports = function (props) {
  return React.createElement(EngineContext.Consumer, null, (context) => {
    var {locals = {}} = context;
    const __components = [];

    with (locals) {
      with (props) {
        BODY
      }
    }

    return __components;
  });
};
`
};