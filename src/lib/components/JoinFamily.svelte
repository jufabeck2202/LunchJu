<script lang="ts">
	import { ErrorToast } from '$lib/helpers/toast';
	import type { definitions } from '$lib/models';
	import { joinFamily } from '$lib/stores/userStore';

	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';

	let loading = false;
	export let family: definitions['families'];

	const dispatch = createEventDispatcher();

	const handleJoinFamily = async () => {
		try {
			loading = true;
			const error = await joinFamily(family.id);
			if (error) {
				ErrorToast("Couldn't join family");
			} else {
				dispatch('familyJoined');
			}
		} catch (error) {
			ErrorToast(error.error_description || error.message);
		} finally {
			loading = false;
		}
	};
</script>

<div class="card p-5 mt-5" transition:fly={{ x: -200, duration: 500 }}>
	<form on:submit|preventDefault={handleJoinFamily}>
		<div class="field">
			<div class="subtitle is-6 pt-3 ">
				You have been invited to join the family: {family.name} <br />
			</div>
		</div>
		<button type="submit" class="button is-primary" is-loading={loading}> Join Family </button>
	</form>
</div>
