<script lang="ts">
	import Meal from './Meal.svelte';
	import type { definitions } from '$lib/models';

	import {
		getUserAsync,
		initalFetchLunchProposals,
		initalFetchLunchVotes
	} from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import type { Database } from '$lib/DatabaseDefinitions';

	export let lunch: Database['public']['Tables']['lunchs']['Row'];
	export let hasJoinedLunch: boolean;
	let userId: string | undefined = undefined;
	let lunchProposalSubscription: RealtimeChannel;
	let voteSubscription: RealtimeChannel;
	const lunchProposal = writable<Database['public']['Tables']['lunch_proposal']['Row'][] | []>([]);
	const votes = writable<Database['public']['Tables']['lunch_proposal_vote']['Row'][] | []>([]);

	onMount(async () => {
		userId = await getUserAsync();
		lunchProposal.set(await initalFetchLunchProposals(lunch.id));
		await subscribeLunchProposal();
		await subscribeToVotes();
		votes.set(await initalFetchLunchVotes(lunch.id));
	});

	const subscribeLunchProposal = async () => {
		lunchProposalSubscription = await supabase
			.channel('public:lunch_proposal')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'lunch_proposal' },
				(newLunchProp: any) => {
					if (newLunchProp.new.lunch_id == lunch.id) {
						lunchProposal.update((l) =>
							l.some((ll) => ll.id === newLunchProp.new.id)
								? l
								: [newLunchProp.new, ...l].sort((a, b) => a.created_at - b.created_at)
						);
					}
				}
			)
			.on(
				'postgres_changes',
				{ event: 'DELETE', schema: 'public', table: 'lunch_proposal' },
				(deleted: any) => {
					lunchProposal.update((l) => l.filter((vote) => vote.id !== deleted.old.id));
				}
			)
			.subscribe();
	};
	const subscribeToVotes = async () => {
		voteSubscription = await supabase
			.channel('public:lunch_proposal_vote')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'lunch_proposal_vote' },
				(newVote: any) => {
					//TODO: add to RLS, Maybe add lunchId to vote
					if (newVote.new.family_id == lunch.family_id && newVote.new.lunch_id == lunch.id) {
						votes.update((l) =>
							l.some((ll) => ll.id === newVote.new.id)
								? l
								: [newVote.new, ...l].sort((a, b) => a.created_at - b.created_at)
						);
					}
				}
			)
			.on(
				'postgres_changes',
				{ event: 'DELETE', schema: 'public', table: 'lunch_proposal_vote' },
				(deleted: any) => {
					votes.update((l) => l.filter((vote) => vote.id !== deleted.old.id));
				}
			)
			.subscribe();
	};
	onDestroy(() => {
		lunchProposalSubscription.unsubscribe();
		voteSubscription.unsubscribe();
	});
	const fetchMealName = async (id: string): Promise<string> => {
		const { data, error } = await supabase.from('meals').select('*').eq('id', id).single();
		return data?.name ?? '';
	};

	const getUpvotes = (
		lunchProposalId: string,
		votes: Database['public']['Tables']['lunch_proposal_vote']['Row'][]
	) => {
		return votes.filter((vote) => vote.lunch_proposal_id === lunchProposalId && vote.upvote).length;
	};
	const getDownvotes = (
		lunchProposalId: string,
		votes: Database['public']['Tables']['lunch_proposal_vote']['Row'][]
	) => {
		return votes.filter((vote) => vote.lunch_proposal_id === lunchProposalId && !vote.upvote)
			.length;
	};
	const hasUpvoted = (
		lunchProposalId: string,
		votes: Database['public']['Tables']['lunch_proposal_vote']['Row'][]
	) => {
		if (!userId) {
			throw new Error('No user ID');
		}
		return (
			votes.find(
				(vote) =>
					vote.lunch_proposal_id === lunchProposalId && vote.upvote && vote.user_id == userId
			) !== undefined
		);
	};
	const hasDownvoted = (
		lunchProposalId: string,
		votes: Database['public']['Tables']['lunch_proposal_vote']['Row'][]
	) => {
		if (!userId) {
			throw new Error('No user ID');
		}
		return (
			votes.find(
				(vote) =>
					vote.lunch_proposal_id === lunchProposalId && !vote.upvote && vote.user_id == userId
			) !== undefined
		);
	};
	$: isCook = lunch.cook_id == userId;
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
			foodIsSelected={lunch.selected_lunch_proposal_id == meal.id} />
	{/await}
{/each}
