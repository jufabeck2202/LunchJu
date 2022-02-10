<script lang="ts">
	import { family, lunches } from '$lib/stores/userStore';
	import Lunch from './Lunches.svelte';
	import Users from '$lib/components/Users.svelte';
	import CreateLunch from '$lib/components/CreateLunch.svelte';
	import CreateProposal from './CreateProposal.svelte';
	import Suggestion from './Suggestion.svelte';
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
					{#each $lunches as lunch}
						<Lunch {lunch} />
					{/each}

					<CreateLunch />
				</div>
				<div class="column is-one-quarter">
					<CreateProposal />
					<Suggestion />
				</div>
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
