<script lang="ts">
	import LunchCard from '$lib/components/LunchCard.svelte';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import ShareFamilyModal from '$lib/components/ShareFamilyModal.svelte';

	import { createLunchesForWeek, lunches, family, mountFamily } from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	onMount(async () => {
		//TODO on Account creation, an empty lunches array is sent to the backend
		//TODO check if family id exists
		await createLunchesForWeek();
	});

	let isShareModalOpen = false;
</script>

<PageContainer>
	{#if $family}
		<div class="title p-2">
			{$family.name}
			<button
				class="button is-outline is-rounded is-small mt-1"
				on:click={() => {
					isShareModalOpen = true;
				}}>Invite</button>
		</div>
		<div class="columns is-multiline">
			<ShareFamilyModal bind:isOpen={isShareModalOpen} familyId={$family.id} />
			{#each $lunches as lunch}
				<LunchCard {lunch} />
			{/each}
		</div>
	{/if}
</PageContainer>
