<script lang="ts">
	import { GetDay, ToLocalTime } from '$lib/helpers/time';
	import type { definitions } from '$lib/models';

	import {
		getUser,
		getUserByID,
		joinLunch,
		leaveLunch,
		lunchMembers,
		removeCookForLunch,
		setCookForLunch
	} from '$lib/stores/userStore';
	import JoinTimeModal from './JoinTimeModal.svelte';

	export let lunch: definitions['lunchs'];
	export let hasJoinedlunch = false;
	let localLunchMembers: definitions['lunch_members'][] = [];
	let isMouseOnLunch = false;
	let isShowingJoinModal = false;
	const handleImTheCook = async (lunch) => {
		const error = await setCookForLunch(lunch);
	};

	const handleImNotTheCook = async (lunch) => {
		const error = await removeCookForLunch(lunch);
	};

	const handleJoinLunch = async (e: CustomEvent<{ startTime: string; endTime: string }>) => {
		const error = await joinLunch(lunch, e.detail.startTime, e.detail.endTime);
		isShowingJoinModal = false;
	};

	const handleLeaveLunch = async (lunch) => {
		if (lunch.cook_id === getUser().id) {
			const error = await removeCookForLunch(lunch);
		}
		const error = await leaveLunch(lunch);
	};
	lunchMembers.subscribe((members) => {
		// check if user is in the members list
		if (members.some((member) => member.user_id === getUser().id && member.lunch_id === lunch.id)) {
			hasJoinedlunch = true;
		} else {
			hasJoinedlunch = false;
		}
		localLunchMembers = members.filter((member) => member.lunch_id === lunch.id);
	});
</script>

<div>
	<JoinTimeModal bind:isShowingJoinModal on:joinLunch={handleJoinLunch} />
	<div class="card p-5 mb-3">
		<h2 class="title is-4">{GetDay(lunch.created_at)}s Lunch</h2>
		<p class="subtitle is-6">
			{ToLocalTime(lunch.created_at)} created by {getUserByID(lunch.created_by)?.name}
		</p>

		<div>
			{#each localLunchMembers as members}
				<button class="m-1 button is-success is-rounded is-outlined" disabled
					>{members.username}
					{#if lunch.cook_id === members.user_id} 👨‍🍳 {/if}</button
				>
			{/each}
		</div>
		<div>
			{#if !hasJoinedlunch}
				<button
					class="m-1 button  is-rounded is-outlined is-responsive"
					on:click={() => (isShowingJoinModal = true)}>Join Lunch</button
				>
			{:else}
				<button
					class="m-1 button  is-rounded is-danger is-responsive"
					on:click={() => handleLeaveLunch(lunch)}>Leave Lunch</button
				>
				{#if !lunch.cook_id || lunch.cook_id === getUser().id}
					<!-- content here -->
					{#if lunch.cook_id == getUser().id}
						{#if isMouseOnLunch}
							<button
								on:focus={() => (isMouseOnLunch = true)}
								on:blur={() => (isMouseOnLunch = false)}
								on:mouseover={() => (isMouseOnLunch = true)}
								on:mouseout={() => (isMouseOnLunch = false)}
								on:click={() => handleImNotTheCook(lunch)}
								class="m-1 button is-rounded is-outlined is-danger">I don't want to cook</button
							>{:else}
							<button
								on:focus={() => (isMouseOnLunch = true)}
								on:blur={() => (isMouseOnLunch = false)}
								on:mouseover={() => (isMouseOnLunch = true)}
								on:mouseout={() => (isMouseOnLunch = false)}
								on:click={() => handleImNotTheCook(lunch)}
								class="m-1 button is-rounded is-outlined">👨‍🍳 &nbsp; You are the cook</button
							>
						{/if}
					{:else}
						<button
							class="m-1 button is-warning is-rounded is-responsive"
							on:click|once={() => handleImTheCook(lunch)}>👨‍🍳 &nbsp; I'm the cook</button
						>
						<!-- else content here -->
					{/if}
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
</style>
