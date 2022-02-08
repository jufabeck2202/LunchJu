<script lang="ts">
	import { createLunch, family, lunches } from '$lib/stores/userStore';
	import Lunch from './Lunches.svelte';
	import Users from '$lib/components/Users.svelte';

	const handleCreateLunch = async () => {
		const error = await createLunch();
	};
</script>

<div class="card p-2">
	<p class="card-header-title is-centered">Schnitzel</p>
	<div class="level is-mobile">
		<div class="level-item has-text-centered">
			<div>
				<button class="button is-success is-rounded  is-responsive is-light">1 👍</button>
			</div>
		</div>
		<div class="level-item has-text-centered">
			<div>
				<button class="button is-danger is-rounded is-responsive is-light">0 👎</button>
			</div>
		</div>
	</div>
</div>
