<script lang="ts">
	import type { definitions } from '$lib/models';
	import Icon from '@iconify/svelte';

	import { createVote, deleteVote, setLunchProposalForVote } from '$lib/stores/userStore';
	export let upvote = 0;
	export let downvote = 0;
	export let name = '';
	export let lunchProposal: definitions['lunch_proposal'];
	export let lunchId: string;
	export let hasUpvoted: boolean;
	export let hasDownvoted: boolean;
	export let foodIsSelected: boolean;

	const handleVote = async (upvote: boolean) => {
		if (hasDownvoted || hasUpvoted) {
			await deleteVote(lunchProposal.id, lunchId);
			return;
		}
		await createVote(lunchProposal.id, lunchId, upvote);
	};
	const selectFood = async () => {
		if (foodIsSelected) {
			return;
		}
		await setLunchProposalForVote(lunchId, lunchProposal.id);
	};
</script>

<div>
	<div class="card p-2 mb-2 {foodIsSelected ? 'has-background-warning-light' : ''}">
		<p class="card-header-title is-centered">{name}</p>
		<div class="level is-mobile">
			<div class="level-item has-text-centered">
				<div>
					{#if foodIsSelected}
						<button
							class="button is-warning is-rounded is-responsive"
							disabled={hasUpvoted}
							on:click={selectFood}
							><Icon icon="akar-icons:circle-x" width="25" />
						</button>
					{:else}
						<button
							class="button is-warning is-rounded is-responsive"
							disabled={hasUpvoted}
							on:click={selectFood}
							><Icon icon="akar-icons:circle-check" width="25" />
						</button>
					{/if}
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div>
					<button
						class="button is-success is-rounded is-responsive is-light"
						disabled={hasDownvoted}
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
						disabled={hasUpvoted}
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
</div>
