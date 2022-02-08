<script lang="ts">
import { ToLocalTime } from '$lib/helpers/time';

	import { lunches } from '$lib/stores/userStore';
</script>

<div>

			{#each $lunches as lunch, i}
				<div class="card p-3 mb-3">
					<h2 class="title is-4 p-3">New Lunch</h2>
					<p class="subtitle pl-3">{ToLocalTime(lunch.created_at)}</p>
				</div>
			{/each}
</div>
