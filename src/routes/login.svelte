<script>
	import { browser } from '$app/env';

	import { goto } from '$app/navigation';

	import { getUser, signIn, signOut, signUp } from '$lib/stores/userStore';
	let username = 'beju@beju.de';
	let password = 'Juliansssss1123';
	let loading;

	const user = getUser();
	console.log(user);
	if (browser && user) goto('/overview');

	const signInWithEmail = async () => {
		try {
			loading = true;
			const [user, error] = await signIn(username, password);
			if (browser && user) goto('/overview'); 
		} catch (error) {
			alert(error.error_description || error.message);
		} finally {
			loading = false;
		}
	};

	const signUpWithEmail = async () => {
		loading = true;
		const [user, error] = await signUp(username, password);
		if (error) {
			alert(error.message);
		}
		loading = false;
	};
	const signOutForm = async () => {
		loading = true;
		const error = await signOut();
		if (error) {
			alert(error.message);
		}
		loading = false;
	};
</script>

<section>
	<div class="container">
		<div class="card">
			<div class="add-username">
				<form on:submit|preventDefault>
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Username</label>
						<div class="control">
							<input
								class="input"
								type="text"
								placeholder="Enter your username here"
								bind:value={username}
							/>
						</div>
					</div>
					<div class="field">
						<label class="label">Password</label>
						<div class="control">
							<input
								class="input"
								type="text"
								placeholder="Enter your username here"
								bind:value={password}
							/>
						</div>
					</div>
					<button class="button primary" on:click={signInWithEmail}> SignIn </button>
					<button class="button primary" on:click={signUpWithEmail}> SignUp </button>
					<button class="button primary" on:click={signOutForm}> Log out </button>
				</form>
			</div>
		</div>
	</div>
</section>

<!-- markup (zero or more items) goes here -->
<style>
	/* your styles go here */
</style>
