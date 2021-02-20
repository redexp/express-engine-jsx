<ul class="users">
	{users.map(user => (
		<li key={user.name}>{user.name}</li>
	))}
</ul>