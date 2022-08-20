<script lang="ts">
	import Icon from '@iconify/svelte';

	import {
		createVote,
		deleteLunchProposal,
		deleteVote,
		getUserAsync,
		removeLunchProposalForVote,
		setLunchProposalForVote
	} from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	import type { Database } from '$lib/DatabaseDefinitions';
	export let upvote = 0;
	export let downvote = 0;
	export let name = '';
	export let lunchProposal: Database['public']['Tables']['lunch_proposal']['Row'];
	export let lunchId: string;
	export let hasUpvoted: boolean;
	export let hasDownvoted: boolean;
	export let foodIsSelected: boolean;
	export let isCook: boolean;
	export let hasJoinedLunch: boolean;
	let userId: string | undefined = undefined;
	onMount(async () => {
		userId = (await getUserAsync()).data.user?.id;
	});
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

	const unselectFood = async () => {
		if (!foodIsSelected) {
			return;
		}
		await removeLunchProposalForVote(lunchId);
	};

	const deleteFood = async () => {
		if (foodIsSelected) {
			return;
		}
		await deleteLunchProposal(lunchProposal.id);
	};
</script>

<div>
	<div class="card p-2 mb-2 {foodIsSelected ? 'has-background-warning-light' : ''}">
		<div class="pb-4 p-1">
			<div class="level is-mobile">
				<div class="level-item">
					<div>
						<p class="subtitle is-6">{name}</p>
					</div>
				</div>
				{#if lunchProposal.user_id == userId && !foodIsSelected}
					<div class="level-left">
						<div class="level-item">
							<button
								class="button is-danger is-rounded is-responsiv is-outlined is-small "
								on:click|once={deleteFood}
								><Icon icon="fluent:delete-28-filled" width="25" />
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
		<div class="level is-mobile">
			{#if isCook}
				<div class="level-item has-text-centered">
					<div>
						<!-- content here -->
						{#if foodIsSelected}
							<button
								class="button is-warning is-rounded is-responsive"
								disabled={hasUpvoted}
								on:click={unselectFood}
								><Icon icon="akar-icons:circle-x" width="25" />
							</button>
						{:else}
							<button
								class="button is-warning is-rounded is-light is-responsive"
								disabled={hasUpvoted}
								on:click={selectFood}
								><Icon icon="akar-icons:circle-check" width="25" />
							</button>
						{/if}
					</div>
				</div>
			{/if}
			<div class="level-item has-text-centered">
				<div>
					<button
						class="button is-success is-rounded is-responsive is-light"
						disabled={hasDownvoted || !hasJoinedLunch}
						on:click={async () => {
							await handleVote(true);
						}}>{upvote} 👍</button>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div>
					<button
						class="button is-danger is-rounded is-responsive is-light"
						disabled={hasUpvoted || !hasJoinedLunch}
						on:click={async () => {
							await handleVote(false);
						}}>
						{downvote} 👎</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.card {
		border-radius: 10px;
		border: 2px solid white;
	}
	.card.has-background-warning-light {
		border: 2px solid #ffe28e;
	}
</style>
