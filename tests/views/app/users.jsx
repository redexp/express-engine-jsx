var Layout = require('express-engine-jsx/tests/views/layout');
var Users = require('./components/users');
var helper = require('./helpers/script');

<Layout>
	<Users users={users}/>
</Layout>