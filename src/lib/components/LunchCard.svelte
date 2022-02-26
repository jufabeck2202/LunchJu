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

<div class="column is-4-desktop is-half-tablet is-4-widescreen is-3-fullhd">
	<div class="card pt-4 pb-4 pl-3 pr-2">
		<div class="columns is-mobile">
			<!-- Left side -->
			<div class="column is-half is-pulled-right">
				<h2 class="title is-4">{GetDay(lunch.created_at)}</h2>
			</div>

			<!-- Right side -->
			<div class="column is-half ">
				<h4 class="subtitle is-5 is-pulled-right pr-2">{GetDateMonthYear(lunch.created_at)}</h4>
			</div>
		</div>

		<div class="p-2">
			<div class="columns is-multiline is-mobile">
				{#if !hasJoinedlunch}
					<div class="column p-1 is-narrow">
						<button class=" button is-rounded is-outlined" on:click={() => handleJoinLunch(lunch)}
							>Join Lunch</button
						>
					</div>
				{:else}
					<div class="column  p-1 is-narrow">
						<button class=" button  is-rounded is-danger" on:click={() => handleLeaveLunch(lunch)}
							>Leave Lunch</button
						>
					</div>
				{/if}
				{#each localLunchMembers as members}
					<div class="column p-1 is-narrow">
						<button class=" button is-success is-rounded is-outlined" disabled
							>{members.username}</button
						>
					</div>
				{/each}
			</div>
		</div>

		<a
			class="button is-fullwidth is-warning is-rounded mt-3"
			sveltekit:prefetch
			href="/lunch/{lunch.id}/"
		>
			Open Lunch</a
		>
	</div>
</div>
