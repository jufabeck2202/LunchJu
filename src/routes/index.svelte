<script lang="ts">
import { browser } from '$app/env';

	// import { browser } from '$app/env';
	import { goto } from '$app/navigation';

	import { getUser } from '$lib/stores/userStore';

	const user = getUser();
	if (browser && !user) goto('/login');
</script>

<svelte:head>
	<title>LunchJu</title>
</svelte:head>

<section class="hero is-primary is-fullheight-with-navbar">
	<div class="hero-body">
		<div class="">
			<p class="title">Welcome to Lunchju</p>
			<p class="subtitle">A place to manage your family's lunch</p>
			<button class="button is-primary is-light">Sign Up</button>
		</div>
	</div>
</section>

<style>
</style>
