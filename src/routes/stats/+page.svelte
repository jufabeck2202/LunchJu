<script lang="ts">
	import PageContainer from '$lib/components/PageContainer.svelte';
	import { ToLocalTime } from '$lib/helpers/time';
	import { getFamilyId } from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';

	const fetchMeals = async () => {
		const { data, error } = await supabase
			.from('meals')
			.select('*')
			.eq('family_id', await getFamilyId())
			.select();
		if (error) {
			throw error;
		}
		return data;
	};
	const countVotes = async (id: string) => {
		const { data, error, count } = await supabase
			.from('lunch_proposal_vote')
			.select('id', { count: 'exact' });
		console.log(count);
	};
</script>

<PageContainer>
	<table class="table is-striped is-fullwidth">
		<thead>
			<tr>
				<th><abbr title="Meal Name">Meal Name</abbr></th>
				<th>Created </th>
				<th>Votes</th>
				<th>Options </th>
			</tr>
		</thead>
		<tbody>
			{#await fetchMeals()}
				<div>loading...</div>
			{:then meals}
				{#each meals as meal}
					<tr>
						<th>{meal.name}</th>
						<th />
						<th>{ToLocalTime(meal.created_at || '')}</th>
						<td>
							<button
								class="button is-danger is-small"
								on:click={() => {
									supabase
										.from('meals')
										.delete()
										.match({
											id: meal.id
										})

										.then(() => {
											fetchMeals();
										});
								}}>Delete</button>
						</td></tr>
				{/each}
			{/await}
		</tbody>
	</table>
</PageContainer>
