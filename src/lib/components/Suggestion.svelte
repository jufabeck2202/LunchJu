<script lang="ts">
	import Meal from './Meal.svelte';

	import type { definitions } from '$lib/models';

	import { initalFetchLunchProposals, lunches } from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';
	import type { RealtimeSubscription } from '@supabase/supabase-js';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let lunchId;
	let lunchProposalSubscription: RealtimeSubscription;
	const lunchProposal = writable<definitions['lunch_proposal'][] | []>([]);

	onMount(async () => {
		lunchProposal.set(await initalFetchLunchProposals(lunchId));
		await subscribeLunchProposal();
	});

	const subscribeLunchProposal = async () => {
		lunchProposalSubscription = await supabase
			.from<definitions['lunch_proposal']>('lunch_proposal')
			.on('INSERT', (newLunchProp) => {
				//TODO: add to RLS
				if (newLunchProp.new.lunch_id == lunchId) {
					lunchProposal.update((l) =>
						[newLunchProp.new, ...l].sort((a, b) => a.created_at - b.created_at)
					);
				}
			})
			.subscribe();
	};
	onDestroy(() => {
		lunchProposalSubscription.unsubscribe();
	});
</script>

{#each $lunchProposal as item}
	<!-- content here -->
	<div class="card p-2">
		<Meal lunch={item} />
	</div>
{/each}
