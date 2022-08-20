<script lang="ts">
	import { ToLocalTime } from '$lib/helpers/time';
	import Icon from '@iconify/svelte';
	import type { definitions } from '$lib/models';
	import { fade } from 'svelte/transition';
	import {
		createCommentForLunch,
		getUserByID,
		initalFetchLunchComments
	} from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { t } from '$lib/helpers/i18n';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import type { Database } from '$lib/DatabaseDefinitions';
	onMount(async () => {
		comments.set(await initalFetchLunchComments(lunch.id));
		await subscribeComments();
	});

	export let lunch: Database['public']['Tables']['lunchs']['Row'];
	export let hasJoinedLunch: boolean;
	const handleCreateComment = async () => {
		if (text.length > 0) {
			await createCommentForLunch(lunch.id, text);
			text = '';
			isCreatingComment = false;
		}
	};
	let isCreatingComment = false;
	let isShowingComments = true;
	let text = '';
	const comments = writable<Database['public']['Tables']['lunch_proposal_comments']['Row'][]>([]);

	let commentsSubscription: RealtimeChannel;

	const subscribeComments = async () => {
		// commentsSubscription = await supabase
		// 	.from<definitions['lunch_proposal_comments']>('lunch_proposal_comments')
		// 	.on('INSERT', (comment) => {
		// 		//TODO: add to RLS
		// 		if (comment.new.lunch_id == lunch.id) {
		// 			comments.update((c) =>
		// 				c.some((cc) => cc.id === comment.new.id)
		// 					? c
		// 					: [comment.new, ...c].sort((a, b) => a.created_at - b.created_at)
		// 			);
		// 		}
		// 	})
		// 	.on('DELETE', (comment) => {
		// 		comments.update((l) => l.filter((c) => c.id !== comment.old.id));
		// 	})
		// 	.subscribe();
	};
</script>

<div>
	<div class="box is-shadowless">
		<div class="">
			{#if isCreatingComment}
				<form on:submit|preventDefault={handleCreateComment}>
					<textarea
						bind:value={text}
						class="textarea is-link"
						placeholder={$t('enter-comment-text')} />
					<div class="mt-3">
						<button
							class="button is-link is-light is-pulled-right is-outlined is-rounded ml-3"
							type="reset"
							on:click={() => {
								isCreatingComment = false;
							}}>Cancel</button>
						<button class="button is-link is-rounded is-pulled-right" type="submit"
							>{$t('send-comment')}</button>
					</div>
				</form>
			{:else}
				<button
					disabled={!hasJoinedLunch}
					class="button is-primary is-rounded is-pulled-right"
					on:click={() => (isCreatingComment = true)}>{$t('create-comment')}</button>
			{/if}
		</div>
	</div>
	<div class="card is-small">
		<header class="card-header">
			<p class="card-header-title">{$t('comments')}: {$comments.length}</p>
			<button
				class="card-header-icon"
				aria-label="more options"
				on:click={() => (isShowingComments = !isShowingComments)}>
				<span class="icon">
					<Icon icon={isShowingComments ? 'fa:angle-down' : 'fa:angle-up'} />
				</span>
			</button>
		</header>
	</div>
	{#if isShowingComments}
		{#each $comments as comment}
			<!-- content here -->
			<div class=" card comment mt-3" in:fade>
				<div class="card-content msg">
					<div class="msg-header">
						<span class="msg-from"
							><small>{$t('from')}: {getUserByID(comment.user_id)?.name}</small></span>
						<span class="msg-timestamp"><small> {ToLocalTime(comment.created_at)}</small></span>
						<span class="msg-attachment"><i class="fa fa-paperclip" /></span>
					</div>
					<div class="msg-snippet">
						{comment.text}
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	button {
		box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%), 0 0px 0 1px rgb(10 10 10 / 2%);
	}
	.box {
		background-color: var(--background);
		padding-top: 0px !important;
		padding-bottom: 40px !important;
	}
	.msg {
		padding: 10px !important;
	}
	.comment {
		border-radius: 12px !important;
	}
</style>
