<script lang="ts">
	import type { Database } from '$lib/DatabaseDefinitions';

	import { t } from '$lib/helpers/i18n';

	import { ErrorToast } from '$lib/helpers/toast';
	import type { definitions } from '$lib/models';
	import { joinFamily } from '$lib/stores/userStore';

	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';

	let loading = false;
	export let family: Database['public']['Tables']['families']['Row'];

	const dispatch = createEventDispatcher();

	const handleJoinFamily = async () => {
		try {
			loading = true;
			const error = await joinFamily(family.id);
			if (error) {
				ErrorToast($t('couldnt-join-family'));
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
				{$t('invited-to-family')}
				{family.name} <br />
			</div>
		</div>
		<button type="submit" class="button is-primary" is-loading={loading}>
			{$t('join-family')}
		</button>
	</form>
</div>
