<script lang="ts">
	import { GetDay, ToLocalTime } from '$lib/helpers/time';
	import type { definitions } from '$lib/models';

	import { getUserByID, joinLunch, lunchMembers, setCookForLunch } from '$lib/stores/userStore';

	export let lunch: definitions['lunchs'];

	const handleImTheCook = async (lunch) => {
		const error = await setCookForLunch(lunch);
	};

	const handleJoinLunch = async (lunch) => {
		const error = await joinLunch(lunch);
	};
</script>

<div>
	<div class="card p-5 mb-3">
		<h2 class="title is-4">{GetDay(lunch.created_at)}s Lunch</h2>
		<p class="subtitle is-6">
			{ToLocalTime(lunch.created_at)} created by {getUserByID(lunch.created_by)?.name}
		</p>
		<button class="button  is-rounded is-outlined" on:click={() => handleJoinLunch(lunch)}>Join Lunch</button>
		{#each $lunchMembers as members}
		<button class="button is-success is-rounded is-outlined" disabled>{members.username}</button>	 <!-- content here -->
		{/each}
		{#if lunch.cook_id}
			<button class="button  is-rounded is-outlined" disabled>👨‍🍳 &nbsp; You are the cook</button>
		{:else}
			<button class="button is-warning is-rounded" on:click|once={() => handleImTheCook(lunch)}
				>👨‍🍳 &nbsp; I'm the cook</button
			>
			<!-- else content here -->
		{/if}
		
	</div>
</div>
