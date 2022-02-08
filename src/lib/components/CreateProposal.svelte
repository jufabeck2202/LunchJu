<script lang="ts">
	import { createLunch, family, lunches } from '$lib/stores/userStore';
	import Lunch from './Lunches.svelte';
	import Users from '$lib/components/Users.svelte';

	const handleCreateLunch = async () => {
		const error = await createLunch();
	};
</script>

<div class="card p-3 mb-3">
	<h2 class="title is-4 p-3">What to eat?</h2>
	<p class="subtitle pl-3">There are no suggestions. <br /> Make one</p>
	<button
		class="button is-medium is-primary is-fullwidth"
		disabled={$lunches.length >= 3}
		on:click={handleCreateLunch}
	>
		Create new suggestion
	</button>
</div>
