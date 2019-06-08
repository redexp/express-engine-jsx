/**
 * @var {{test2: string}} props
 */
const {Fragment} = require('react');
const ContextComponent = require('./app/ContextComponent');

<>
	<h2>context</h2>
	<div>locals.test1 {locals.test1}</div>
	<div>props.test2 {props.test2}</div>
	<div>props.test3 {typeof props.test3}</div>
	<div>test1 {test1}</div>
	<div>test2 {test2}</div>
	<div>test3 {typeof test3}</div>

	<h2>ContextComponent</h2>
	<ContextComponent test3={props.test2}/>
</>
