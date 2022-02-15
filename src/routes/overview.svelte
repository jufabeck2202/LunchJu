<script lang="ts">
	import LunchCard from '$lib/components/LunchCard.svelte';
	import { GetDay, ToLocalTime } from '$lib/helpers/time';
	import type { definitions } from '$lib/models';

	import {
		checkIfUserFamilyExists,
		getUser,
		getUserByID,
		joinLunch,
		leaveLunch,
		loadLunches,
		lunches,
		lunchMembers,
		setCookForLunch
	} from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	onMount(async () => {
		await checkIfUserFamilyExists();
		await loadLunches();
	});
</script>

<div class="container is-fluid">
	<div class="columns is-multiline">
		{#each $lunches as lunch}
			<LunchCard {lunch} />
		
		{/each}
	</div>
</div>

