<script lang="ts">
	import PageContainer from '$lib/components/PageContainer.svelte';
	import type { Database } from '$lib/DatabaseDefinitions';
	import { ToLocalTime } from '$lib/helpers/time';
	import { ErrorToast, SuccessToast } from '$lib/helpers/toast';
	import { getFamilyId } from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { t } from '$lib/helpers/i18n';
	let selectedMeal: Database['public']['Tables']['meals']['Row'] | null = null;
	let newMealName: string = '';
	const meals = writable<Database['public']['Tables']['meals']['Row'][]>();
	onMount(async () => {
		meals.set(await fetchMeals());
	});

	const fetchMeals = async () => {
		const { data, error } = await supabase
			.from('meals')
			.select('*')
			.eq('family_id', await getFamilyId());
		if (error) {
			throw error;
		}
		//TODO implement later on
		// await countVotes();
		return data;
	};
	const countVotes = async () => {
		const { data, error } = await supabase
			.from('lunch_proposal_vote')
			.select(
				`
				lunch_proposal_id(
					meal_type(
						id
					)
				)
				)
			`
			)
			.eq('family_id', await getFamilyId());
	};

	const renameMeal = async () => {
		if (!selectedMeal) {
			return;
		}
		const { error } = await supabase
			.from('meals')
			.update({ name: newMealName })
			.eq('id', selectedMeal.id);
		selectedMeal = null;
		if (error) {
			ErrorToast(error.message);
		}
		SuccessToast('Meal renamed');
		meals.set(await fetchMeals());
	};
	const deleteMeal = async (id: string) => {
		const { error } = await supabase.from('meals').delete().eq('id', id);
		if (error) {
			ErrorToast(error.message);
		}
		meals.set(await fetchMeals());
		SuccessToast('Meal deleted');
	};
</script>

<PageContainer>
	<div class="modal" class:is-active={selectedMeal}>
		<div class="modal-background" />
		<div class="modal-content">
			<div class="card">
				<header class="card-header">
					<p class="card-header-title">Rename {selectedMeal?.name}</p>
				</header>
				<div class="card-content">
					<div class="subtitle">Enter new Name</div>
					<div class="field">
						<label class="label">{$t('name')}</label>
						<input class="input " type="text" bind:value={newMealName} />
					</div>

					<div class="field is-grouped">
						<div class="control">
							<button type="submit" class="button is-link" on:click={renameMeal}>Rename</button>
						</div>
						<div class="control">
							<button
								class="button is-link is-light"
								type="reset"
								on:click={() => {
									selectedMeal = null;
								}}>{$t('cancel')}</button>
						</div>
					</div>
				</div>
			</div>
		</div>
		<button
			class="modal-close is-large"
			on:click={() => {
				selectedMeal = null;
			}}
			aria-label="close" />
	</div>
	<table class="table is-striped is-fullwidth">
		<thead>
			<tr>
				<th><abbr title="Meal Name">Meal Name</abbr></th>
				<th>Created </th>
				<th>Options </th>
			</tr>
		</thead>
		<tbody>
			{#if $meals}
				{#each $meals as meal}
					<tr>
						<th>{meal.name}</th>
						<th>{ToLocalTime(meal.created_at || '')}</th>
						<td>
							<button
								class="button is-danger is-small"
								on:click={async () => {
									await deleteMeal(meal.id);
								}}>Delete</button>
							<button
								class="button is-link is-small"
								on:click={() => {
									newMealName = meal.name;
									selectedMeal = meal;
								}}>Rename</button>
						</td></tr>
				{/each}
			{/if}
		</tbody>
	</table>
</PageContainer>
