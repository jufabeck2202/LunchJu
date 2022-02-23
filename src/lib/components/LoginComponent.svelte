<script lang="ts">
	import { browser } from '$app/env';
	import { ErrorToast } from '$lib/helpers/toast';
	import { signIn, signUp } from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';

	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	let username;
	let password;
	let loading = false;
	const dispatch = createEventDispatcher();
	const handleSignUp = async () => {
		try {
			loading = true;
			const [user, error] = await signUp(username, password);
			if (browser && user) {
				dispatch('signUp', user);
			}
		} catch (error) {
			ErrorToast(error.error_description || error.message);
		} finally {
			loading = false;
		}
	};
	const handleSignIn = async () => {
		try {
			loading = true;
			const [user, error] = await signIn(username, password);
			if (browser && user) {
				dispatch('signIn', user);
			}
		} catch (error) {
			ErrorToast(error.error_description || error.message);
		} finally {
			loading = false;
		}
	};

</script>

<div class="card p-5 mt-5" transition:fade>
	<form on:submit|preventDefault>
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Email</label>
			<div class="control">
				<input
					class="input"
					type="text"
					placeholder="Enter your email here"
					bind:value={username}
				/>
			</div>
		</div>
		<div class="field">
			<label class="label">Password</label>
			<div class="control">
				<input
					class="input"
					type="password"
					placeholder="Enter your password here"
					bind:value={password}
				/>
			</div>
		</div>
		<button class="button is-primary" is-loading={loading} on:click={handleSignUp}>
			Create Account
		</button>
		<!-- TODO: Handle Login -->
		<button class="button is-primary" on:click={handleSignIn}> Login </button>
	</form>
</div>
