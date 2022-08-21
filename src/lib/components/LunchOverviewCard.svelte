<script lang="ts">
	import type { Database } from '$lib/DatabaseDefinitions';

	import { GetDateMonthYear, GetDay, renderTime } from '$lib/helpers/time';
	import {
		lunchMembers,
		joinLunch,
		leaveLunch,
		getUserAsync,
		initalFetchLunchMembers
	} from '$lib/stores/userStore';
	import JoinTimeModal from './JoinTimeModal.svelte';

	export let lunch: Database['public']['Tables']['lunchs']['Row'];
	let localLunchMembers: Database['public']['Tables']['lunch_members']['Row'][] = [];
	let hasJoinedlunch = false;
	let isShowingJoinModal = false;
	$: lunchMembers.subscribe((members) => {
		localLunchMembers = members.filter((member) => member.lunch_id === lunch.id);
	});

	$: lunchMembers.subscribe(async (members) => {
		const userId = await getUserAsync();
		if (
			members.some((member) => {
				if (member.user_id === userId && member.lunch_id === lunch.id) {
					return true;
				} else {
					return false;
				}
			})
		) {
			hasJoinedlunch = true;
		} else {
			hasJoinedlunch = false;
		}
	});

	const handleJoinLunch = async (e: CustomEvent<{ startTime: string; endTime: string }>) => {
		const error = await joinLunch(lunch, e.detail.startTime, e.detail.endTime);
		isShowingJoinModal = false;
		await initalFetchLunchMembers();
	};
	const handleLeaveLunch = async (lunch: any) => {
		const error = await leaveLunch(lunch);
		await initalFetchLunchMembers();
	};
</script>

<div class="column is-4-desktop is-half-tablet is-4-widescreen is-3-fullhd">
	<JoinTimeModal
		bind:isShowingJoinModal
		on:joinLunch={handleJoinLunch}
		currentDate={lunch.created_at} />
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
						<button
							class="button is-rounded is-outlined"
							on:click={() => (isShowingJoinModal = true)}>
							Join Lunch</button>
					</div>
				{:else}
					<div class="column p-1 is-narrow">
						<button class="button is-rounded is-danger" on:click={() => handleLeaveLunch(lunch)}>
							Leave Lunch</button>
					</div>
				{/if}
				{#each localLunchMembers as members}
					<div class="column p-1 is-narrow">
						<button class=" button is-success is-rounded is-outlined" disabled>
							{members.username}
							{#if members.StartTime}
								<div class="tag flex is-warning ml-2">
									{renderTime(members.StartTime, members.EndTime)}
								</div>
							{/if}
						</button>
					</div>
				{/each}
			</div>
		</div>
		<a
			class="button is-fullwidth is-warning is-rounded mt-3"
			sveltekit:prefetch
			href="/lunch/{lunch.id}/">
			Open Lunch</a>
	</div>
</div>
