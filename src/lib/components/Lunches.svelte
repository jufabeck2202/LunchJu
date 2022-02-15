<script lang="ts">
	import { GetDay, ToLocalTime } from '$lib/helpers/time';
	import type { definitions } from '$lib/models';

	import {
		getUser,
		getUserByID,
		joinLunch,
		leaveLunch,
		lunchMembers,
		setCookForLunch
	} from '$lib/stores/userStore';

	export let lunch: definitions['lunchs'];

	const handleImTheCook = async (lunch) => {
		const error = await setCookForLunch(lunch);
	};

	const handleJoinLunch = async (lunch) => {
		const error = await joinLunch(lunch);
	};

	const handleLeaveLunch = async (lunch) => {
		const error = await leaveLunch(lunch);
	};
	let hasJoinedlunch = false;

	lunchMembers.subscribe((members) => {
		// check if user is in the members list
		if (members.some((member) => member.user_id === getUser().id)) {
			hasJoinedlunch = true;
		} else {
			hasJoinedlunch = false;
		}
	});
</script>

<div>
	<div class="card p-5 mb-3">
		<h2 class="title is-4">{GetDay(lunch.created_at)}s Lunch</h2>
		<p class="subtitle is-6">
			{ToLocalTime(lunch.created_at)} created by {getUserByID(lunch.created_by)?.name}
		</p>

		<div>
			{#each $lunchMembers as members}
				<button class="m-1 button is-success is-rounded is-outlined" disabled
					>{members.username}</button
				>
				<!-- content here -->
			{/each}
		</div>
		<div>
			{#if !hasJoinedlunch}
				<button class="m-1 button  is-rounded is-outlined" on:click={() => handleJoinLunch(lunch)}
					>Join Lunch</button
				>
			{:else}
				<button class="m-1 button  is-rounded is-danger" on:click={() => handleLeaveLunch(lunch)}
					>Leave Lunch</button
				>
				{#if lunch.cook_id}
					<button class="m-1 button  is-rounded is-outlined" disabled
						>👨‍🍳 &nbsp; You are the cook</button
					>
				{:else}
					<button class="m-1 button is-warning is-rounded" on:click|once={() => handleImTheCook(lunch)}
						>👨‍🍳 &nbsp; I'm the cook</button
					>
					<!-- else content here -->
				{/if}
			{/if}
		</div>
	</div>
</div>
