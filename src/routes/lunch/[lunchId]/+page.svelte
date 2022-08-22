<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { family, initalFetchLunches, lunches } from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import CreateProposal from '$lib/components/CreateProposal.svelte';
	import Suggestion from '$lib/components/Suggestion.svelte';
	import Lunch from '$lib/components/Lunches.svelte';
	import Users from '$lib/components/Users.svelte';
	import ShareFamilyModal from '$lib/components/ShareFamilyModal.svelte';
	import Comments from '$lib/components/Comments.svelte';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import JoinTimeModal from '$lib/components/JoinTimeModal.svelte';
	import type { Database } from '$lib/DatabaseDefinitions';

	let isShareModelOpen: boolean = false;
	const lunchId = $page.params['lunchId'];
	let lunch: Database['public']['Tables']['lunchs']['Row'] | undefined;
	let hasJoinedLunch: boolean = false;
	onMount(async () => {
		await initalFetchLunches();
		//TODO: Return to overview if lunch is not found
		if (!get(lunches).find((l) => l.id === lunchId)) {
			goto('/overview');
		}
	});

	//updates lunch
	lunches.subscribe((lunches) => {
		lunch = lunches.filter((lunch) => lunch.id == lunchId)?.[0];
	});
</script>

<svelte:head>
	{#if $family}
		<title>{$family.name} Lunch</title>
	{/if}
</svelte:head>

<PageContainer>
	{#if $family}
		<div>
			<div class="title p-2">
				{$family.name}
				<button
					class="button is-outline is-rounded is-small mt-1"
					on:click={() => {
						isShareModelOpen = true;
					}}>invite</button>
			</div>
		</div>
		{#if lunch}
			<div class="columns pt-4">
				<div class="column is-half">
					<Lunch {lunch} bind:hasJoinedlunch={hasJoinedLunch} />
					<Comments {lunch} {hasJoinedLunch} />
				</div>
				<div class="column is-half">
					<div class="columns is-multiline">
						<div class="column is-full-tablet is-half-desktop">
							<CreateProposal {lunch} {hasJoinedLunch} />
							<Suggestion {lunch} {hasJoinedLunch} />
						</div>
						<div class="column is-full-tablet is-half-desktop">
							<Users />
						</div>
					</div>
				</div>
			</div>
		{/if}
		<ShareFamilyModal bind:isOpen={isShareModelOpen} familyId={$family.id} />
	{/if}
</PageContainer>
