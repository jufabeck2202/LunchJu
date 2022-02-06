<script lang="ts">
	import { browser } from '$app/env';

	import { goto } from '$app/navigation';

	import { checkIfUserFamilyExists, family, getUser } from '$lib/stores/userStore';
	import CreateFamily from '$lib/components/createFamily.svelte';
	import Family from '$lib/components/Family.svelte';
	import { SvelteToast } from '@zerodevx/svelte-toast';

	const user = getUser();
	if (browser && !user) goto('/login');

	// checkIfUserFamilyExists()
</script>

<svelte:head>
	<title>LunchJu</title>
</svelte:head>

<section>
	{#await checkIfUserFamilyExists() then _}
		{#if $family}
			<Family />
		{:else}
			<CreateFamily />
		{/if}
		{$family}
	{/await}
	<SvelteToast />
</section>

<style>
</style>
