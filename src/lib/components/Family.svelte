<script lang="ts">
	import { createLunch, family } from '$lib/stores/userStore';
	import Lunch from './Lunch.svelte';

	const handleCreateLunch = async () => {
		const error = await createLunch();
	};
</script>

<svelte:head>
	{#if $family}
		<title>{$family.name} Lunch</title>
	{/if}
</svelte:head>

<div>
	{#if $family}
		<div class="columns is-centered is-mobile">
			<div
				class="column is-full-mobile is-two-thirds-tablet is-half-desktop is-one-third-widescreen is-one-quarter-fullhd "
			>
				<div class="card p-3">
					<h2 class="title is-4 p-3">Create Lunch</h2>
					<p class="subtitle pl-3">Nobody wants to eat today 😭</p>
					<button class="button is-medium is-primary is-fullwidth" on:click={handleCreateLunch}
						>Schedule Lunch for today 🤤</button
					>
				</div>
			</div>
		</div>
	{/if}
	<Lunch />
</div>
