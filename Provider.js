var React = require('react');
var PropTypes = require('prop-types');
var createClass = require('create-react-class');

var Provider = createClass({
	getChildContext: function () {
		return {
			locals: this.props._locals,
			settings: this.props.settings
		};
	},

	render: function () {
		return this.props.children;
	}
});

Provider.childContextTypes = {
	locals: PropTypes.object,
	settings: PropTypes.object,
};

module.exports = Provider;