<script>
	import { browser } from '$app/env';

	import { goto } from '$app/navigation';
	import LoginComponent from '$lib/components/LoginComponent.svelte';
	import { ErrorToast } from '$lib/helpers/toast';

	import { getUser, signIn, signOut, signUp } from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';
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
	const handleSignInGithub = async () => {
		try {
			loading = true;
			const { user, error } = await supabase.auth.signIn({
				provider: 'github'
			});
			console.log(user);
			console.log(error);
			console.log('huhuhuhuh');
			if (browser && user) {
				goto('/overview');
			}
			if (error) {
				throw error;
			}
		} catch (error) {
			ErrorToast(error.error_description || error.message);
		} finally {
			loading = false;
		}
	};
</script>

<section>
	<LoginComponent on:signUp={handleSignUp} on:signIn={handleSignIn} />
	<button class="button is-primary" on:click={handleSignInGithub}> Login with Github </button>
</section>

<!-- markup (zero or more items) goes here -->
<style>
	/* your styles go here */
</style>
