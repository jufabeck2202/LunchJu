<script lang="ts">
	import Meal from './Meal.svelte';

	import type { definitions } from '$lib/models';

	import { initalFetchLunchProposals, initalFetchLunchVotes, lunches } from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';
	import type { RealtimeSubscription } from '@supabase/supabase-js';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let lunch: definitions['lunchs'];
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
						[newLunchProp.new, ...l].sort((a, b) => a.created_at - b.created_at)
					);
				}
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
					votes.update((l) => [newVote.new, ...l].sort((a, b) => a.created_at - b.created_at));
				}
			})
			.on('UPDATE', (newVote) => {
				votes.update((l) => {
					const index = l.findIndex((vote) => vote.id === newVote.new.id);
					if (index !== -1) {
						l[index] = newVote.new;
					}
					return l;
				});
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
</script>

{#each $lunchProposal as item}
	<!-- content here -->
	{#await fetchMealName(item.meal_type) then name}
		<!-- promise was fulfilled -->
		<div class="card p-2 mb-2">
			<Meal
				lunchId={lunch.id}
				lunchProposal={item}
				{name}
				upvote={getUpvotes(item.id, $votes)}
				downvote={getDownvotes(item.id, $votes)}
			/>
		</div>
	{/await}
{/each}
