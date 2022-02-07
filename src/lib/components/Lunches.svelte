<script lang="ts">
import { ToLocalTime } from '$lib/helpers/time';

	import { lunches } from '$lib/stores/userStore';
</script>

<div>
	<div class="columns is-centered is-mobile">
		<div
			class="column is-full-mobile is-three-thirds-tablet is-half-desktop is-one-third-widescreen is-one-quarter-fullhd"
		>
			{#each $lunches as lunch, i}
				<div class="card p-3 mb-3">
					<h2 class="title is-4 p-3">New Lunch</h2>
					<p class="subtitle pl-3">{ToLocalTime(lunch.created_at)}</p>
				</div>
			{/each}
		</div>
	</div>
</div>
