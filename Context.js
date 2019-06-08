const React = require('react');

const Context = React.createContext({
	locals: {},
	settings: {},
});

module.exports = Context;