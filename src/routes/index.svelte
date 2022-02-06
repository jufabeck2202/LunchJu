<script lang="ts">
	import { browser } from '$app/env';

	import { goto } from '$app/navigation';

	import { checkIfUserFamilyExists, getUser } from '$lib/stores/userStore';
	import CreateFamily from '$lib/components/createFamily.svelte';

	const user = getUser();
	if (browser && !user) goto('/login');
</script>

<svelte:head>
	<title>LunchJu</title>
</svelte:head>

<section>
	<div class="section">
		{#await checkIfUserFamilyExists() then familyExists}
			{#if familyExists}
				welcome to your family
			{:else}
				<CreateFamily />
			{/if}
		{/await}
	</div>
</section>

<style>
</style>
