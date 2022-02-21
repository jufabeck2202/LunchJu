<script>
	import { browser } from '$app/env';

	import { goto } from '$app/navigation';
	import LoginComponent from '$lib/components/LoginComponent.svelte';

	import { getUser, signIn, signOut, signUp } from '$lib/stores/userStore';
	let username = 'beju@beju.de';
	let password = 'Juliansssss1123';
	let loading;

	const user = getUser();
	console.log(user);
	if (browser && user) goto('/overview');

	const handleSignUp = async (user) => {
		goto('/overview');
	};
	const handleSignIn = async (user) => {
		goto('/overview');
	};
</script>

<section>
	<LoginComponent on:signUp={handleSignUp} on:signIn={handleSignIn} />
</section>

<!-- markup (zero or more items) goes here -->
<style>
	/* your styles go here */
</style>
