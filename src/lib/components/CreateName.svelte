<script lang="ts">
	import { ErrorToast } from '$lib/helpers/toast';
	import { setUsername } from '$lib/stores/userStore';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	let username;
	const dispatch = createEventDispatcher();

	const handleName = async () => {
		if (username > 3) {
			const error = await setUsername(username);
			if (error) {
				ErrorToast(error.message);
			} else {
				dispatch('usernameCreated');
			}
		}
	};
</script>

<div class="card p-5 mt-5" transition:fade>
	<form on:submit|preventDefault>
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">Username</label>
			<div class="control">
				<input class="input" type="text" placeholder="Username" bind:value={username} />
			</div>
		</div>

		<button class="button is-primary" on:click={handleName}>Confirm</button>
		<!-- TODO: Handle Login -->
	</form>
</div>
