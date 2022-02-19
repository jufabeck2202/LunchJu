<script lang="ts">
	import { goto } from '$app/navigation';

	import LunchCard from '$lib/components/LunchCard.svelte';

	import { mountFamily, getUser, createLunchesForWeek, lunches } from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	onMount(async () => {
		if (!getUser()) {
			goto('/login');
		}
		await mountFamily();
		await createLunchesForWeek();
	});
</script>

<div class="container is-fluid">
	<div class="columns is-multiline">
		{#each $lunches as lunch}
			<LunchCard {lunch} />
		{/each}
	</div>
</div>
