<script context="module">
	export async function load(params) {
		if (params.params.lunchId) {
			return {
				status: 200
			};
		}
		//TODO check if exists
		return {
			status: 302,
			redirect: '/overview'
		};
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { family, initalFetchLunches, lunches, lunchsLocal } from '$lib/stores/userStore';
	import Clipboard from 'svelte-clipboard';
	import { onMount } from 'svelte';
	import CreateProposal from '$lib/components/CreateProposal.svelte';
	import Suggestion from '$lib/components/Suggestion.svelte';
	import type { definitions } from '$lib/models';
	import Lunch from '$lib/components/Lunches.svelte';
	import Users from '$lib/components/Users.svelte';
	import ShareFamilyModal from '$lib/components/ShareFamilyModal.svelte';
	import Comments from '$lib/components/Comments.svelte';
	import PageContainer from '$lib/components/PageContainer.svelte';

	let isShareModelOpen: boolean = false;
	const lunchId = $page.params['lunchId'];
	let lunch: definitions['lunchs'] = null;
	onMount(async () => {
		await initalFetchLunches();
		if (!lunchsLocal.some((l) => l.id === lunchId)) {
			goto('/overview');
		}

		lunch = lunchsLocal.filter((lunch) => lunch.id == lunchId)?.[0];
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
					}}>invite</button
				>
			</div>
		</div>
		{#if lunch}
			<div class="columns">
				<div class="column is-half">
					<Lunch {lunch} />
					<Comments />
				</div>
				<div class="column is-half">
					<div class="columns is-multiline">
						<div class="column is-full-tablet is-half-desktop">
							<CreateProposal {lunchId} />
							<Suggestion {lunch} />
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
