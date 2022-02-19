<script context="module">
	export async function load(params) {
		console.log(params);
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
	import { family, getUserAsync, initalFetchLunches, lunchsLocal, mountFamily } from '$lib/stores/userStore';
	import Clipboard from 'svelte-clipboard';
	import { onMount } from 'svelte';
	import CreateProposal from '$lib/components/CreateProposal.svelte';
	import Suggestion from '$lib/components/Suggestion.svelte';
	import type { definitions } from '$lib/models';
	import CreateLunch from '$lib/components/CreateLunch.svelte';
	import Lunch from '$lib/components/Lunches.svelte';
	import Users from '$lib/components/Users.svelte';

	let isShareModelOpen = false;
	let url = '';
	const lunchId = $page.params['lunchId'];
	let lunch: definitions['lunchs'] = null;
	onMount(async () => {
		if (!(await getUserAsync())) {
			goto('/login');
		}
		if (!(await mountFamily())) {
			goto('/login');
		}
		await initalFetchLunches()
		if (!lunchsLocal.some((l) => l.id === lunchId)) {
			console.log("overview")
			goto('/overview');
		}
		url = window.location.href;
		lunch = lunchsLocal.filter((lunch) => lunch.id == lunchId)?.[0];
	});
</script>

<svelte:head>
	{#if $family}
		<title>{$family.name} Lunch</title>
	{/if}
</svelte:head>

<div>
	{#if $family}
		<div class="title p-2">
			{$family.name}
			<button
				class="button is-outline is-rounded is-small mt-1"
				on:click={() => {
					isShareModelOpen = true;
				}}>Share</button
			>
		</div>

		{#if lunch}
			<div class="columns pl-2 pr-2 ">
				<div class="column is-half">
					<Lunch {lunch} />
					<!-- <CreateLunch /> -->
				</div>
				<div class="column is-one-quarter">
					<CreateProposal {lunchId} />
					<Suggestion />
				</div>
				<div class="column is-one-quarter">
					<Users />
				</div>
			</div>
			<div class="modal" class:is-active={isShareModelOpen}>
				<div class="modal-background" />
				<div class="modal-content">
					<div class="card">
						<header class="card-header">
							<p class="card-header-title">Share Family</p>
						</header>
						<div class="card-content">
							<div class="subtitle">
								Share this link with your family to invite them to join you
							</div>
							<Clipboard
								text={url + 'join/' + $family.id}
								let:copy
								on:copy={() => {
									console.log('Has Copied');
								}}
							>
								<button class="button" on:click={copy}>Copy Link</button>
							</Clipboard>
							<div>
								<button
									class="button is-primary"
									on:click={() => {
										isShareModelOpen = false;
									}}
									aria-label="close"
								>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
				<button
					class="modal-close is-large"
					on:click={() => {
						isShareModelOpen = false;
					}}
					aria-label="close"
				/>
			</div>
		{:else}
			<Users />
			<CreateLunch />
		{/if}
	{/if}
</div>
