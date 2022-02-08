<script lang="ts">
	import { createLunch, family, lunches } from '$lib/stores/userStore';
	import Lunch from './Lunches.svelte';
	import Users from '$lib/components/Users.svelte';
	import CreateLunch from '$lib/components/CreateLunch.svelte';
</script>

<svelte:head>
	{#if $family}
		<title>{$family.name} Lunch</title>
	{/if}
</svelte:head>

<div>
	{#if $family}
		{#if $lunches}
			<div class="columns pl-2 pr-2 ">
				<div class="column is-half">
					<Lunch />
					<CreateLunch />
				</div>
				<div class="column is-one-quarter" />
				<div class="column is-one-quarter">
					<Users />
				</div>
			</div>
		{:else}
			<Users />
			<CreateLunch />
		{/if}
	{/if}
</div>
