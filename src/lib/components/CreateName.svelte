<script lang="ts">
	import { ErrorToast } from '$lib/helpers/toast';
	import { setUsername } from '$lib/stores/userStore';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	let username: string;
	import { t } from '$lib/helpers/i18n';
	const dispatch = createEventDispatcher();

	const handleName = async () => {
		if (username.length > 3) {
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
	<form on:submit|preventDefault={handleName}>
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">{$t('username')}</label>
			<div class="control">
				<input class="input" type="text" placeholder={$t('username')} bind:value={username} />
			</div>
		</div>

		<button class="button is-primary" type="submit">{$t('confirm')}</button>
	</form>
</div>
