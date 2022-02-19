<script lang="ts">
	import { createLunchProposal, fetchMeals } from '$lib/stores/userStore';
	import AutoComplete from 'simple-svelte-autocomplete';

	export let lunchId: string;
	let isLoading = false;
	let isProposalMenu = false;
	let mealName: string = '';
	let selectedFood;
	const handleCreateLunchProposal = async () => {
		isLoading = true;
		const error = await createLunchProposal(lunchId, mealName, selectedFood?.id);
		isLoading = false;
		if (error) {
			alert(error);
		}
		isProposalMenu = false;
	};

	const getItems = async (keyword) => {
		isLoading = true;
		mealName = keyword;
		const lunches = await fetchMeals(lunchId);
		isLoading = false;
		return lunches;
	};
</script>

<div class="card p-3 mb-3">
	<h2 class="title is-4 p-3">What to eat?</h2>
	<p class="subtitle pl-3">There are no suggestions. <br /> Make one</p>
	<button class="button is-medium is-primary is-fullwidth" on:click={() => (isProposalMenu = true)}>
		Create new suggestion
	</button>
	<div class="modal" class:is-active={isProposalMenu}>
		<div class="modal-background" />
		<div class="modal-content">
			<div class="card">
				<header class="card-header">
					<p class="card-header-title">Create Lunch Proposal</p>
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
								class="button is-link"
								disabled={isLoading || mealName.length < 3}
								is-loading={isLoading}
								on:click={handleCreateLunchProposal}>Create Suggestion</button
							>
						</div>
						<div class="control">
							<button
								class="button is-link is-light"
								on:click={() => {
									isProposalMenu = false;
								}}>Cancel</button
							>
						</div>
					</div>
				</div>
			</div>
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
