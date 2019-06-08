/**
 * @var {{test1: string}} locals
 * @var {{test3: string}} props
 * @var {string} test1 - from locals
 * @var {string} test3 - from props
 */
const {Fragment} = require('react');

<Fragment>
	<div>locals.test1 {locals.test1}</div>
	<div>props.test2 {typeof props.test2}</div>
	<div>props.test3 {props.test3}</div>
	<div>test1 {test1}</div>
	<div>test2 {typeof test2}</div>
	<div>test3 {test3}</div>
</Fragment>