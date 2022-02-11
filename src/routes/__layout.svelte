<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '../app.scss';
</script>

<Header>
	<main>
		<slot />
		<Footer />
	</main>

	<footer>

	</footer>

	<style>
	</style>
</Header>
<slot />
