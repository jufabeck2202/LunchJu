<script lang="ts">
	import { browser } from '$app/env';

	import { goto } from '$app/navigation';

	import CreateFamily from '$lib/components/createFamily.svelte';
	import { getUser } from '$lib/stores/userStore';

	const user = getUser();
	if (browser && !user) goto('/login');
</script>

<svelte:head>
	<title>LunchJu</title>
</svelte:head>

<section>
	<h1>Welcome to LunchJu</h1>
</section>

<style>
</style>
