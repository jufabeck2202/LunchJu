<script lang="ts">
import { ToLocalTime } from '$lib/helpers/time';

	import type { definitions } from '$lib/models';
	import { createCommentForLunch, getUserByID, initalFetchLunchComments } from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';
	import type { RealtimeSubscription } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	onMount(async () => {
		comments.set(await initalFetchLunchComments(lunch.id));
		await subscribeComments();
	});

	export let lunch: definitions['lunchs'];

	const handleCreateComment = async () => {
		if (text.length > 0) {
			await createCommentForLunch(lunch.id, text);
			text = '';
			isCreatingComment = false;
		}
	};
	let isCreatingComment = false;
	let text = '';
	const comments = writable<definitions['lunch_proposal_comments'][] | []>([]);

	let commentsSubscription: RealtimeSubscription;

	const subscribeComments = async () => {
		commentsSubscription = await supabase
			.from<definitions['lunch_proposal_comments']>('lunch_proposal_comments')
			.on('INSERT', (comment) => {
				console.table(comment);
				//TODO: add to RLS
				if (comment.new.lunch_id == lunch.id) {
					comments.update((c) => [comment.new, ...c].sort((a, b) => a.created_at - b.created_at));
				}
			})
			.on('DELETE', (comment) => {
				comments.update((l) => l.filter((c) => c.id !== comment.old.id));
			})
			.subscribe();
	};
</script>

<div>
	{#each $comments as comment}
		<!-- content here -->
		<div class="card mb-3">
			<div class="card-content">
				<div class="msg-header">
					<span class="msg-from"><small>From: {getUserByID(comment.user_id)?.name}</small></span>
					<span class="msg-timestamp"><small> {ToLocalTime(comment.created_at)}</small></span>
					<span class="msg-attachment"><i class="fa fa-paperclip" /></span>
				</div>
				<div class="msg-snippet">
				{comment.text}
				</div>
			</div>
		</div>
	{/each}
	<div class="content mb-6 mt-3">
		{#if isCreatingComment}
			<form on:submit|preventDefault={handleCreateComment}>
				<div class="pt-2">
					<textarea bind:value={text} class="textarea is-link" placeholder="Enter Comment Text" />
				</div>
				<div class="mt-3">
					<button
						class="button is-link is-light is-pulled-right is-outlined is-rounded ml-3"
						type="reset"
						on:click={() => {
							isCreatingComment = false;
						}}>Cancel</button
					>
					<button
						class="button is-link is-rounded is-pulled-right"
						on:click={() => (isCreatingComment = true)}>Send Comment</button
					>
				</div>
			</form>
		{:else}
			<button
				class="button is-primary is-rounded is-pulled-right"
				on:click={() => (isCreatingComment = true)}>Create Comment</button
			>
		{/if}
	</div>
</div>

<style>
	button {
		box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%), 0 0px 0 1px rgb(10 10 10 / 2%);
	}
</style>
