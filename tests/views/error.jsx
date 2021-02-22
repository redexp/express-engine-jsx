const Error2 = require('./error2');

if (props.test === 1) {
	throw new Error('test1');
}
if (props.test === 2) {
	__components.push(<Error2/>);
}