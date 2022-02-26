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
	import {
		family,
		getUserAsync,
		initalFetchLunches,
		lunches,
		lunchsLocal,
		mountFamily
	} from '$lib/stores/userStore';
	import Clipboard from 'svelte-clipboard';
	import { onMount } from 'svelte';
	import CreateProposal from '$lib/components/CreateProposal.svelte';
	import Suggestion from '$lib/components/Suggestion.svelte';
	import type { definitions } from '$lib/models';
	import CreateLunch from '$lib/components/CreateLunch.svelte';
	import Lunch from '$lib/components/Lunches.svelte';
	import Users from '$lib/components/Users.svelte';
	import ShareFamilyModal from '$lib/components/ShareFamilyModal.svelte';

	let isShareModelOpen: boolean = false;
	const lunchId = $page.params['lunchId'];
	let lunch: definitions['lunchs'] = null;
	onMount(async () => {
		if (!(await getUserAsync())) {
			goto('/login');
		}
		if (!(await mountFamily())) {
			goto('/login');
		}
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

<div>
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
			<div class="columns pl-2 pr-2 ">
				<div class="column is-half">
					<Lunch {lunch} />
					<!-- <CreateLunch /> -->
				</div>
				<div class="column is-one-quarter">
					<CreateProposal {lunchId} />
					<Suggestion {lunch} />
				</div>
				<div class="column is-one-quarter">
					<Users />
				</div>
			</div>
		{:else}
			<div>
				<Users />
				<CreateLunch />
			</div>
		{/if}
		<ShareFamilyModal bind:isOpen={isShareModelOpen} familyId={$family.id} />
	{/if}
</div>
