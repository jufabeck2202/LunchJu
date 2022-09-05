<script lang="ts">
	import type { Database } from '$lib/DatabaseDefinitions';
	import { GetDay, renderTime, ToLocalTime } from '$lib/helpers/time';
	import { t } from '$lib/helpers/i18n';
	import {
		editLunchTime,
		getUserAsync,
		getUserByID,
		initalFetchLunchMembers,
		joinLunch,
		leaveLunch,
		lunchMembers,
		removeCookForLunch,
		setCookForLunch
	} from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	import JoinTimeModal from './JoinTimeModal.svelte';
	import Icon from '@iconify/svelte';

	export let lunch: Database['public']['Tables']['lunchs']['Row'];
	export let hasJoinedlunch = false;

	let localLunchMembers: Database['public']['Tables']['lunch_members']['Row'][] = [];
	let isMouseOnLunch = false;
	let isShowingJoinModal = false;
	let userId: string | undefined;
	let localLunchMember: Database['public']['Tables']['lunch_members']['Row'];
	let breakfastMembers: Database['public']['Tables']['lunch_members']['Row'][] = [];
	let lunchfoodMembers: Database['public']['Tables']['lunch_members']['Row'][] = [];
	let dinnerMembers: Database['public']['Tables']['lunch_members']['Row'][] = [];

	onMount(async () => {
		userId = await getUserAsync();
	});
	const handleImTheCook = async (lunch: any) => {
		const error = await setCookForLunch(lunch);
	};

	const handleImNotTheCook = async (lunch: any) => {
		const error = await removeCookForLunch(lunch);
	};

	const handleJoinMeals = async (e: CustomEvent<{ meal_type: string }>) => {
		const error = await joinLunch(lunch, e.detail.meal_type);
		isShowingJoinModal = false;
		await initalFetchLunchMembers();
	};

	const handleEditMeals = async (e: CustomEvent<{ meal_type: string }>) => {
		const error = await editLunchTime(lunch, e.detail.meal_type);
		isShowingJoinModal = false;
		await initalFetchLunchMembers();
	};

	const handleLeaveLunch = async (lunch: any) => {
		const userId = await getUserAsync();
		if (!userId) {
			throw new Error('No user ID');
		}
		if (lunch.cook_id === userId) {
			const error = await removeCookForLunch(lunch);
		}
		const error = await leaveLunch(lunch);
		await initalFetchLunchMembers();
	};

	lunchMembers.subscribe(async (members) => {
		// check if user is in the members list
		const userId = await getUserAsync();
		if (!userId) {
			throw new Error('No user ID');
		}
		if (members.some((member) => member.user_id === userId && member.lunch_id === lunch.id)) {
			hasJoinedlunch = true;
			const localMembers = members.find(
				(member) => member.user_id === userId && member.lunch_id === lunch.id
			);
			if (localMembers) {
				localLunchMember = localMembers;
			}
		} else {
			hasJoinedlunch = false;
		}
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
</script>

<div>
	<JoinTimeModal
		bind:isShowingJoinModal
		on:joinMeal={handleJoinMeals}
		{hasJoinedlunch}
		initalMealType={localLunchMember?.meal_type}
		on:editMeal={handleEditMeals} />
	<div class="card p-5 mb-3">
		<h2 class="title is-4">{$t(GetDay(lunch.created_at))}{$t('s-lunch')}</h2>
		<p class="subtitle is-6">
			{ToLocalTime(lunch.created_at)}
		</p>

		<div>
			{#if breakfastMembers.length > 0}
				<div class="columns is-multiline is-mobile m-0 p-0">
					<div class="column is-narrow p-0 pt-2">
						<Icon icon="fluent:food-egg-16-regular" width="32" />
					</div>
					<div class="column is-narrow p-0 pt-3">
						<span class="subtitle">Breakfast</span>
					</div>
					{#each breakfastMembers as members}
						<div class="column is-narrow p-0 m-1">
							<button class="button is-success is-rounded is-outlined" disabled>
								{members.username}
								{#if lunch.cook_id === members.user_id} 👨‍🍳 {/if}
								{#if members.StartTime}
									<div class="tag flex is-warning ml-2">
										{renderTime(members.StartTime, members.EndTime)}
									</div>
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}
			<div class="divider is-right m-0 p-0" />
			{#if lunchfoodMembers.length > 0}
				<div class="columns is-multiline is-mobile p-0 m-0">
					<div class="column is-narrow p-0 pt-2">
						<Icon icon="ic:outline-no-food" width="32" />
					</div>
					<div class="column is-narrow p-0 pt-3">
						<span class="subtitle">Lunch</span>
					</div>
					{#each lunchfoodMembers as members}
						<div class="column is-narrow p-0 m-1">
							<button class="button is-success is-rounded is-outlined" disabled>
								{members.username}
								{#if lunch.cook_id === members.user_id} 👨‍🍳 {/if}
								{#if members.StartTime}
									<div class="tag flex is-warning ml-2">
										{renderTime(members.StartTime, members.EndTime)}
									</div>
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}
			<div class="divider is-right m-0 p-0" />
			{#if dinnerMembers.length > 0}
				<div class="columns is-multiline is-mobile p-0 m-0">
					<div class="column is-narrow p-0 pt-2">
						<Icon icon="cil:dinner" width="32" />
					</div>
					<div class="column is-narrow p-0 pt-3">
						<span class="subtitle">Dinner</span>
					</div>
					{#each dinnerMembers as members}
						<div class="column is-narrow p-0 m-1">
							<button class="button is-success is-rounded is-outlined" disabled>
								{members.username}
								{#if lunch.cook_id === members.user_id} 👨‍🍳 {/if}
								{#if members.StartTime}
									<div class="tag flex is-warning ml-2">
										{renderTime(members.StartTime, members.EndTime)}
									</div>
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div class="divider is-right m-0 p-0" />
		<div class="pt-3">
			{#if !hasJoinedlunch}
				<button
					class="m-1 button  is-rounded is-outlined is-responsive"
					on:click={() => (isShowingJoinModal = true)}>
					{$t('join-lunch')}</button>
			{:else}
				<button
					class="m-1 button  is-rounded is-danger is-responsive"
					on:click={() => handleLeaveLunch(lunch)}>{$t('leave-lunch')}</button>
				<button
					class="m-1 button  is-rounded is-link  is-outlined is-responsive"
					on:click={() => (isShowingJoinModal = true)}>{$t('change-lunchtime')}</button>
				{#if !lunch.cook_id || lunch.cook_id === userId}
					<!-- content here -->
					{#if lunch.cook_id == userId}
						{#if isMouseOnLunch}
							<button
								on:focus={() => (isMouseOnLunch = true)}
								on:blur={() => (isMouseOnLunch = false)}
								on:mouseover={() => (isMouseOnLunch = true)}
								on:mouseout={() => (isMouseOnLunch = false)}
								on:click={() => handleImNotTheCook(lunch)}
								class="m-1 button is-rounded is-outlined is-danger">{$t('no-cook')}</button
							>{:else}
							<button
								on:focus={() => (isMouseOnLunch = true)}
								on:blur={() => (isMouseOnLunch = false)}
								on:mouseover={() => (isMouseOnLunch = true)}
								on:mouseout={() => (isMouseOnLunch = false)}
								on:click={() => handleImNotTheCook(lunch)}
								class="m-1 button is-rounded is-outlined">{$t('im-cook')}</button>
						{/if}
					{:else}
						<button
							class="m-1 button is-warning is-rounded is-responsive"
							on:click|once={() => handleImTheCook(lunch)}>{$t('im-cook-2')}</button>
						<!-- else content here -->
					{/if}
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
</style>
