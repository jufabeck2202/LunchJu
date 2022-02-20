<script lang="ts">
	import type { definitions } from '$lib/models';
	import { createVote, initalFetchLunchVotes } from '$lib/stores/userStore';

	import { supabase } from '$lib/supabaseclient';
	import type { RealtimeSubscription } from '@supabase/supabase-js';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let lunchProposal: definitions['lunch_proposal'];

	let uptimeVotes = 0;
	let downvoteVotes = 0;

	votes.subscribe((votes) => {
		uptimeVotes = votes.filter(
			(vote) => vote.upvote && vote.lunch_proposal_id == lunchProposal.id
		).length;
		downvoteVotes = votes.filter(
			(vote) => !vote.upvote && vote.lunch_proposal_id == lunchProposal.id
		).length;
	});

	onMount(async () => {
		votes.set(await initalFetchLunchVotes(lunchProposal.id));
	});


	const handleVote = async (upvote: boolean) => {
		console.log(lunchProposal.id);
		await createVote(lunchProposal.id, upvote);
	};


</script>

<div class="level-item has-text-centered">
	<div>
		Lunch Proposal {lunchProposal.id}
		<button
			class="button is-success is-rounded is-responsive is-light"
			on:click={async () => {
				await handleVote(true);
			}}>{uptimeVotes} 👍</button
		>
	</div>
</div>
<div class="level-item has-text-centered">
	<div>
		<button
			class="button is-danger is-rounded is-responsive is-light"
			on:click={async () => {
				await handleVote(false);
			}}
		>
			{downvoteVotes} 👎</button
		>
	</div>
</div>
