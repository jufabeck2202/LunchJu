<script lang="ts">
	import Meal from './Meal.svelte';

	import type { definitions } from '$lib/models';

	import { getUser, initalFetchLunchProposals, initalFetchLunchVotes } from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';
	import type { RealtimeSubscription } from '@supabase/supabase-js';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let lunch: definitions['lunchs'];
	export let hasJoinedLunch: boolean;

	let lunchProposalSubscription: RealtimeSubscription;
	let voteSubscription: RealtimeSubscription;
	const lunchProposal = writable<definitions['lunch_proposal'][] | []>([]);
	const votes = writable<definitions['lunch_proposal_vote'][] | []>([]);

	onMount(async () => {
		lunchProposal.set(await initalFetchLunchProposals(lunch.id));
		await subscribeLunchProposal();
		await subscribeToVotes();
		votes.set(await initalFetchLunchVotes(lunch.id));
	});

	const subscribeLunchProposal = async () => {
		lunchProposalSubscription = await supabase
			.from<definitions['lunch_proposal']>('lunch_proposal')
			.on('INSERT', (newLunchProp) => {
				//TODO: add to RLS
				if (newLunchProp.new.lunch_id == lunch.id) {
					lunchProposal.update((l) =>
						l.some((ll) => ll.id === newLunchProp.new.id)
							? l
							: [newLunchProp.new, ...l].sort((a, b) => a.created_at - b.created_at)
					);
				}
			})
			.on('DELETE', (deleted) => {
				lunchProposal.update((l) => l.filter((vote) => vote.id !== deleted.old.id));
			})
			.subscribe();
	};
	const subscribeToVotes = async () => {
		//TODO: add to RLS
		voteSubscription = await supabase
			.from<definitions['lunch_proposal_vote']>('lunch_proposal_vote')
			.on('INSERT', (newVote) => {
				//TODO: add to RLS, Maybe add lunchId to vote
				if (newVote.new.family_id == lunch.family_id && newVote.new.lunch_id == lunch.id) {
					votes.update((l) =>
						l.some((ll) => ll.id === newVote.new.id)
							? l
							: [newVote.new, ...l].sort((a, b) => a.created_at - b.created_at)
					);
				}
			})
			.on('DELETE', (deleted) => {
				votes.update((l) => l.filter((vote) => vote.id !== deleted.old.id));
			})
			.subscribe();
	};
	onDestroy(() => {
		lunchProposalSubscription.unsubscribe();
		voteSubscription.unsubscribe();
	});
	const fetchMealName = async (id: string): Promise<string> => {
		const { data, error } = await supabase
			.from<definitions['meals']>('meals')
			.select('*')
			.eq('id', id)
			.single();
		return data?.name ?? '';
	};

	const getUpvotes = (lunchProposalId: string, votes: definitions['lunch_proposal_vote'][]) => {
		return votes.filter((vote) => vote.lunch_proposal_id === lunchProposalId && vote.upvote).length;
	};
	const getDownvotes = (lunchProposalId: string, votes: definitions['lunch_proposal_vote'][]) => {
		return votes.filter((vote) => vote.lunch_proposal_id === lunchProposalId && !vote.upvote)
			.length;
	};
	const hasUpvoted = (lunchProposalId: string, votes: definitions['lunch_proposal_vote'][]) => {
		return (
			votes.find(
				(vote) =>
					vote.lunch_proposal_id === lunchProposalId && vote.upvote && vote.user_id == getUser().id
			) !== undefined
		);
	};
	const hasDownvoted = (lunchProposalId: string, votes: definitions['lunch_proposal_vote'][]) => {
		return (
			votes.find(
				(vote) =>
					vote.lunch_proposal_id === lunchProposalId && !vote.upvote && vote.user_id == getUser().id
			) !== undefined
		);
	};
	$: isCook = lunch.cook_id == getUser().id;
</script>

{#each $lunchProposal as meal}
	<!-- meals here -->
	{#await fetchMealName(meal.meal_type) then name}
		<!-- promise was fulfilled -->
		<Meal
			{isCook}
			{hasJoinedLunch}
			lunchId={lunch.id}
			lunchProposal={meal}
			hasUpvoted={hasUpvoted(meal.id, $votes)}
			hasDownvoted={hasDownvoted(meal.id, $votes)}
			{name}
			upvote={getUpvotes(meal.id, $votes)}
			downvote={getDownvotes(meal.id, $votes)}
			foodIsSelected={lunch.selected_lunch_proposal_id == meal.id}
		/>
	{/await}
{/each}
