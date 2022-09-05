<script lang="ts">
	import type { Database } from '$lib/DatabaseDefinitions';
	import { t } from '$lib/helpers/i18n';
	import { GetDateMonthYear, GetDay, renderTime } from '$lib/helpers/time';
	import { ErrorToast } from '$lib/helpers/toast';
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
	let breakfastMembers: Database['public']['Tables']['lunch_members']['Row'][] = [];
	let lunchfoodMembers: Database['public']['Tables']['lunch_members']['Row'][] = [];
	let dinnerMembers: Database['public']['Tables']['lunch_members']['Row'][] = [];
	let hasJoinedlunch = false;
	let isShowingJoinModal = false;
	$: lunchMembers.subscribe((members) => {
		localLunchMembers = members.filter((member) => member.lunch_id === lunch.id);
		breakfastMembers = localLunchMembers.filter((member) =>
			member.meal_type?.toLowerCase().includes('breakfast')
		);
		lunchfoodMembers = localLunchMembers.filter((member) =>
			member.meal_type?.toLowerCase().includes('lunch')
		);
		dinnerMembers = localLunchMembers.filter((member) =>
			member.meal_type?.toLowerCase().includes('dinner')
		);
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

	const handleJoinLunch = async (e: CustomEvent<{ meal_type: string }>) => {
		const error = await joinLunch(lunch, e.detail.meal_type);
		isShowingJoinModal = false;
		if (error) {
			ErrorToast(error.message);
		}
		await initalFetchLunchMembers();
	};
	const handleLeaveLunch = async (lunch: any) => {
		const error = await leaveLunch(lunch);
		if (error) {
			ErrorToast(error.message);
		}
		await initalFetchLunchMembers();
	};
</script>

<div class="column is-4-desktop is-half-tablet is-4-widescreen is-3-fullhd">
	<JoinTimeModal bind:isShowingJoinModal on:joinMeal={handleJoinLunch} />
	<div class="card pt-4 pb-4 pl-3 pr-2">
		<div class="columns is-mobile">
			<!-- Left side -->
			<div class="column is-half is-pulled-right">
				<h2 class="title is-4">{$t(GetDay(lunch.created_at))}</h2>
			</div>

			<!-- Right side -->
			<div class="column is-half ">
				<h4 class="subtitle is-5 is-pulled-right pr-2">{GetDateMonthYear(lunch.created_at)}</h4>
			</div>
		</div>

		<div class="p-2">
			{#if breakfastMembers.length > 0}
				<div class="columns is-multiline is-mobile">
					<h1 class="subtitle pt-2 pl-1 p-0 m-0">Breakfast</h1>
					{#each breakfastMembers as members}
						<div class="column p-1 is-narrow">
							<figure class="image is-32x32">
								<img
									class="is-rounded"
									src={`https://avatars.dicebear.com/api/initials/${members.username}.svg`}
									alt="avatar" />
							</figure>
						</div>
					{/each}
				</div>
			{/if}
			{#if lunchfoodMembers.length > 0}
				<div class="columns is-multiline is-mobile">
					<h1 class="subtitle pt-2 pl-1 p-0 m-0">Lunch</h1>
					{#each lunchfoodMembers as members}
						<div class="column p-1 is-narrow">
							<figure class="image is-32x32">
								<img
									class="is-rounded"
									src={`https://avatars.dicebear.com/api/initials/${members.username}.svg`}
									alt="avatar" />
							</figure>
						</div>
					{/each}
				</div>
			{/if}
			{#if dinnerMembers.length > 0}
				<div class="columns is-multiline is-mobile">
					<h1 class="subtitle pt-2 pl-1 p-0 m-0">Dinner</h1>
					{#each dinnerMembers as members}
						<div class="column p-1 is-narrow">
							<figure class="image is-32x32">
								<img
									class="is-rounded"
									src={`https://avatars.dicebear.com/api/initials/${members.username}.svg`}
									alt="avatar" />
							</figure>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div class="columns">
			<div class="column">
				<a
					class="button is-fullwidth is-warning is-rounded mt-3"
					sveltekit:prefetch
					href="/lunch/{lunch.id}/">
					{$t('open-lunch')}</a>
			</div>
			<div class="column">
				{#if !hasJoinedlunch}
					<button
						class="button is-fullwidth is-rounded is-outlined mt-3"
						on:click={() => (isShowingJoinModal = true)}>
						{$t('join-lunch')}</button>
				{:else}
					<button
						class="button is-fullwidth is-rounded is-danger mt-3"
						on:click={() => handleLeaveLunch(lunch)}>
						{$t('leave-lunch')}</button>
				{/if}
			</div>
		</div>
	</div>
</div>
