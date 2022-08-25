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

	export let lunch: Database['public']['Tables']['lunchs']['Row'];
	export let hasJoinedlunch = false;

	let localLunchMembers: Database['public']['Tables']['lunch_members']['Row'][] = [];
	let isMouseOnLunch = false;
	let isShowingJoinModal = false;
	let userId: string | undefined;
	let localLunchMember: Database['public']['Tables']['lunch_members']['Row'];

	onMount(async () => {
		userId = await getUserAsync();
	});
	const handleImTheCook = async (lunch: any) => {
		const error = await setCookForLunch(lunch);
	};

	const handleImNotTheCook = async (lunch: any) => {
		const error = await removeCookForLunch(lunch);
	};

	const handleJoinLunch = async (e: CustomEvent<{ startTime: string; endTime: string }>) => {
		const error = await joinLunch(lunch, e.detail.startTime, e.detail.endTime);
		isShowingJoinModal = false;
		await initalFetchLunchMembers();
	};

	const handleEditLunchTime = async (e: CustomEvent<{ startTime: string; endTime: string }>) => {
		const error = await editLunchTime(lunch, e.detail.startTime, e.detail.endTime);
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
	});
</script>

<div>
	<JoinTimeModal
		bind:isShowingJoinModal
		on:joinLunch={handleJoinLunch}
		currentDate={lunch.created_at}
		{hasJoinedlunch}
		on:editLunchTime={handleEditLunchTime}
		startTime={localLunchMember?.StartTime}
		endTime={localLunchMember?.EndTime} />
	<div class="card p-5 mb-3">
		<h2 class="title is-4">{$t(GetDay(lunch.created_at))}{$t('s-lunch')}</h2>
		<p class="subtitle is-6">
			{ToLocalTime(lunch.created_at)} {$t("created-by")} {getUserByID(lunch.created_by)?.name}
		</p>
		<div>
			<div class="columns is-multiline is-mobile p-2">
				{#each localLunchMembers as members}
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
		</div>
		<div>
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
								class="m-1 button is-rounded is-outlined">{$t("im-cook")}</button>
						{/if}
					{:else}
						<button
							class="m-1 button is-warning is-rounded is-responsive"
							on:click|once={() => handleImTheCook(lunch)}>{$t("im-cook-2")}</button>
						<!-- else content here -->
					{/if}
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
</style>
