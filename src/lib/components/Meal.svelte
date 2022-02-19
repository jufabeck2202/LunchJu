<script lang="ts">
	import type { definitions } from '$lib/models';

	import { supabase } from '$lib/supabaseclient';

	import { onMount } from 'svelte';

	export let lunch: definitions['lunch_proposal'];

	const fetchMealName = async (): Promise<string> => {
		const { data, error } = await supabase
			.from<definitions['meals']>('meals')
			.select('*')
			.eq('id', lunch.meal_type)
			.single();
		return data?.name ?? '';
	};
</script>

<div>
	{#await fetchMealName() then name}
		<p class="card-header-title is-centered">{name}</p>
		<div class="level is-mobile">
			<div class="level-item has-text-centered">
				<div>
					<button class="button is-success is-rounded  is-responsive is-light">1 👍</button>
				</div>
			</div>
			<div class="level-item has-text-centered">
				<div>
					<button class="button is-danger is-rounded is-responsive is-light">0 👎</button>
				</div>
			</div>
		</div>
	{/await}
</div>
