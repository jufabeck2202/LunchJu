<script lang="ts">
	import type { definitions } from '$lib/models';

	import { createLunchProposal, fetchMeals } from '$lib/stores/userStore';
	import AutoComplete from 'simple-svelte-autocomplete';

	export let lunch: definitions['lunchs'];
	export let hasJoinedLunch: boolean;
	let isLoading = false;
	let isProposalMenu = false;
	let mealName: string = '';
	let selectedFood;
	let lunchSuggestions: definitions['meals'][] = [];

	const handleCreateLunchProposal = async () => {
		isLoading = true;
		//check if exists
		const response = lunchSuggestions.find((meal) => meal.name === mealName.toLowerCase());
		const error = await createLunchProposal(lunch.id, mealName, selectedFood?.id || response?.id);
		isLoading = false;
		if (error) {
			alert(error.message);
		}
		isProposalMenu = false;
	};

	const getItems = async (keyword) => {
		isLoading = true;
		mealName = keyword;
		const lunches = await fetchMeals();
		lunchSuggestions = lunches;
		isLoading = false;
		return lunches;
	};
</script>

<div class="card p-3 mb-3 ">
	<h2 class="title is-4 p-3">What to eat?</h2>
	<p class="subtitle is-6 pl-3">There are no suggestions. <br /> Make one</p>
	<button
	disabled={!hasJoinedLunch}
		class="button is-primary is-fullwidth is-rounded is-link"
		on:click={() => (isProposalMenu = true)}
	>
		Create Suggestion
	</button>
	<div class="modal" class:is-active={isProposalMenu}>
		<div class="modal-background" />
		<div class="modal-content">
			<form on:submit|preventDefault={handleCreateLunchProposal}>
				<div class="card">
					<header class="card-header">
						<p class="card-header-title">Create Proposal</p>
					</header>
					<div class="card-content">
						<div class="subtitle">What food do you want to eat?</div>
						<div class="field">
							<label class="label">Name</label>
							<div class="control pb-6">
								<AutoComplete
									class="input"
									type="text"
									searchFunction={getItems}
									bind:selectedItem={selectedFood}
									localFiltering="false"
									maxItemsToShowInList="3"
									placeholder="Enter food name"
									labelFieldName="name"
									valueFieldName="id"
									hideArrow="true"
								>
									<div slot="no-results">
										<span>Create new Food {mealName}</span>
									</div>
								</AutoComplete>
							</div>
						</div>

						<div class="field is-grouped">
							<div class="control">
								<button
									type="submit"
									class="button is-link"
									disabled={!selectedFood && mealName.length < 3}
									is-loading={isLoading}>Create Proposal</button
								>
							</div>
							<div class="control">
								<button
									class="button is-link is-light"
									type="reset"
									on:click={() => {
										isProposalMenu = false;
									}}>Cancel</button
								>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
		<button
			class="modal-close is-large"
			on:click={() => {
				isProposalMenu = false;
			}}
			aria-label="close"
		/>
	</div>
</div>
