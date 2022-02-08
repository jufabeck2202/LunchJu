<script lang="ts">
	import { createLunch, family, lunches } from '$lib/stores/userStore';
	import Lunch from './Lunches.svelte';
	import Users from '$lib/components/Users.svelte';

	const handleCreateLunch = async () => {
		const error = await createLunch();
	};
</script>

<svelte:head>
	{#if $family}
		<title>{$family.name} Lunch</title>
	{/if}
</svelte:head>

<div class="card p-3">
	<h2 class="title is-4 p-3">Create Lunch</h2>
	<p class="subtitle pl-3">Nobody wants to eat today 😭</p>
	<button
		class="button is-medium is-primary is-fullwidth"
		disabled={$lunches.length >= 3}
		on:click={handleCreateLunch}
		>Schedule Lunch for today 🤤
	</button>
</div>
