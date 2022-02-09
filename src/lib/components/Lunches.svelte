<script lang="ts">
	import { GetDay, ToLocalTime } from '$lib/helpers/time';

	import { getUserByID, lunches, setCookForLunch } from '$lib/stores/userStore';

	const handleImTheCook = async (lunch) => {
		const error = await setCookForLunch(lunch);
	};
</script>

<div>
	{#each $lunches as lunch, i}
		<div class="card p-5 mb-3">
			<h2 class="title is-4">{GetDay(lunch.created_at)}s Lunch</h2>
			<p class="subtitle is-6">
				{ToLocalTime(lunch.created_at)} created by {getUserByID(lunch.created_by)?.name}
			</p>
			{#if lunch.cook_id}
				<button class="button  is-rounded is-outlined" disabled>👨‍🍳 &nbsp; You are the cook</button>
			{:else}
				<button class="button is-warning is-rounded" on:click|once={() => handleImTheCook(lunch)}
					>👨‍🍳 &nbsp; I'm the cook</button
				>
				<!-- else content here -->
			{/if}
		</div>
	{/each}
</div>
