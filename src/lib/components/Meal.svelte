<script lang="ts">

	import type { definitions } from '$lib/models';

	import { createVote } from '$lib/stores/userStore';
	export let upvote = 0;
	export let downvote = 0;
	export let name = '';
	export let lunchProposal: definitions['lunch_proposal'];
	export let lunchId: string
	export let canVote: boolean;

	const handleVote = async (upvote: boolean) => {
		console.log(lunchProposal.id);
		await createVote(lunchProposal.id, lunchId, upvote);
	};
</script>

<div>
	<p class="card-header-title is-centered">{name}</p>
	<div class="level is-mobile">
		<div class="level-item has-text-centered">
			<div>
				<button
					class="button is-success is-rounded is-responsive is-light"
					disabled={!canVote}
					on:click={async () => {
						await handleVote(true);
					}}>{upvote} 👍</button
				>
			</div>
		</div>
		<div class="level-item has-text-centered">
			<div>
				<button
					class="button is-danger is-rounded is-responsive is-light"
					disabled={!canVote}
					on:click={async () => {
						await handleVote(false);
					}}
				>
					{downvote} 👎</button
				>
			</div>
		</div>
	</div>
</div>
