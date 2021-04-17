import Layout from '../layout';
import Users from './components/users';
const helper1 = require('./helpers/script');
const helper2 = require('./helpers/sub');

if (helper1 !== 1) throw new Error('helper1');
if (helper2 !== 2) throw new Error('helper2');

<Layout>
	<Users users={users}/>
</Layout>