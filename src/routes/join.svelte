<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/env';
	if (browser) {
		const email = $page;
		console.log(email);

		const urlParams = new URLSearchParams(window.location.search);
		const isBeta = urlParams.has('family');
		console.log(isBeta);
	}
</script>

<h1>112313</h1>
