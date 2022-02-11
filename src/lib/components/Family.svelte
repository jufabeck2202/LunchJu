<script lang="ts">
	import { family, lunches } from '$lib/stores/userStore';
	import Lunch from './Lunches.svelte';
	import Users from '$lib/components/Users.svelte';
	import CreateLunch from '$lib/components/CreateLunch.svelte';
	import CreateProposal from './CreateProposal.svelte';
	import Suggestion from './Suggestion.svelte';
	import Clipboard from 'svelte-clipboard';
	import { onMount } from 'svelte';

	let isShareModelOpen = true;
	let url = '';

	onMount(() => (url = window.location.href));
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
			<div class="modal" class:is-active={isShareModelOpen}>
				<div class="modal-background" />
				<div class="modal-content">
					<div class="card">
						<header class="card-header">
							<p class="card-header-title">Share Family</p>
						</header>
						<div class="card-content">
							<Clipboard
								text={url + 'join?family=' + $family.id}
								let:copy
								on:copy={() => {
									console.log('Has Copied');
								}}
							>
								<button class="button" on:click={copy}>Copy</button>
							</Clipboard>
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
