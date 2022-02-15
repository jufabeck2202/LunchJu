<script lang="ts">
	import { GetDateMonthYear, GetDay } from '$lib/helpers/time';
	import type { definitions } from '$lib/models';

	import { lunchMembers, joinLunch, leaveLunch, getUser } from '$lib/stores/userStore';

	export let lunch: definitions['lunchs'];
	let localLunchMembers: definitions['lunch_members'][] = [];

	let hasJoinedlunch = false;
	lunchMembers.subscribe((members) => {
		// check if user is in the members list
		localLunchMembers = members.filter((member) => member.lunch_id === lunch.id);
	});
	const handleJoinLunch = async (lunch) => {
		const error = await joinLunch(lunch);
	};

	const handleLeaveLunch = async (lunch) => {
		const error = await leaveLunch(lunch);
	};

	lunchMembers.subscribe((members) => {
		// check if user is in the members list
		if (members.some((member) => member.user_id === getUser().id && member.lunch_id === lunch.id)) {
			
			hasJoinedlunch = true;
		} else {
			hasJoinedlunch = false;
		}
	});
</script>

<div class="column is-one-quarter-desktop is-half-tablet is-one-fifth-widescreen">
	<div class="card p-5 m-3">
		<div class="level pb-5">
			<!-- Left side -->
			<div class="level-left">
				<div class="level-item">
					<h2 class="title is-4">{GetDay(lunch.created_at)}s Lunch</h2>
				</div>
			</div>

			<!-- Right side -->
			<div class="level-right">
				<h4 class="subtitle">{GetDateMonthYear(lunch.created_at)}</h4>
			</div>
		</div>

		<div>
			<div class="columns is-multiline ">
				{#if !hasJoinedlunch}
					<div class="column">
						<button class=" button  is-rounded is-outlined" on:click={() => handleJoinLunch(lunch)}
							>Join Lunch</button
						>
					</div>
				{:else}
					<div class="column">
						<button class=" button  is-rounded is-danger" on:click={() => handleLeaveLunch(lunch)}
							>Leave Lunch</button
						>
					</div>
				{/if}
				{#each localLunchMembers as members}
					<div class="column">
						<button class=" button is-success is-rounded is-outlined" disabled
							>{members.username}</button
						>
					</div>
				{/each}
			</div>
		</div>

		<button class="button is-fullwidth is-warning is-rounded mt-2">Open Lunch</button>
	</div>
</div>
