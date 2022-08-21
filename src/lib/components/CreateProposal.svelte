<script lang="ts">
	import type { definitions } from '$lib/models';

	import { createLunchProposal, fetchMeals } from '$lib/stores/userStore';
	// @ts-ignore
	import AutoComplete from 'simple-svelte-autocomplete';
	import { t } from '$lib/helpers/i18n';
	import type { Database } from '$lib/DatabaseDefinitions';
	export let lunch: Database['public']['Tables']['lunchs']['Row'];
	export let hasJoinedLunch: boolean;
	let isLoading = false;
	let isProposalMenu = false;
	let mealName: string = '';
	let selectedFood: Database['public']['Tables']['meals']['Row'];
	let lunchSuggestions: Database['public']['Tables']['meals']['Row'][] = [];

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

	const getItems = async (keyword: string) => {
		isLoading = true;
		mealName = keyword;
		const lunches = await fetchMeals();
		lunchSuggestions = lunches;
		isLoading = false;
		return lunches;
	};
</script>

<div class="card p-3 mb-3 ">
	<h2 class="title is-4 p-3">{$t('what-to-eat')}</h2>
	<p class="subtitle is-6 pl-3">{$t('there-are-no-suggestions')} <br /> {$t('make-one')}</p>
	<button
		disabled={!hasJoinedLunch}
		class="button is-primary is-fullwidth is-rounded is-link"
		on:click={() => (isProposalMenu = true)}>
		{$t('create-proposal')}
	</button>
	<div class="modal" class:is-active={isProposalMenu}>
		<div class="modal-background" />
		<div class="modal-content">
			<form on:submit|preventDefault={handleCreateLunchProposal}>
				<div class="card">
					<header class="card-header">
						<p class="card-header-title">{$t('create-proposal')}</p>
					</header>
					<div class="card-content">
						<div class="subtitle">{$t('what-food-do-you-want-to-eat')}</div>
						<div class="field">
							<label class="label">{$t('name')}</label>
							<div class="control pb-6">
								<AutoComplete
									class="input"
									type="text"
									searchFunction={getItems}
									bind:selectedItem={selectedFood}
									localFiltering="false"
									maxItemsToShowInList="3"
									placeholder={$t('enter-food-name')}
									labelFieldName="name"
									valueFieldName="id"
									hideArrow="true">
									<div slot="no-results">
										<span>{$t('create-new-food')} {mealName}</span>
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
									is-loading={isLoading}>{$t('create-proposal')}</button>
							</div>
							<div class="control">
								<button
									class="button is-link is-light"
									type="reset"
									on:click={() => {
										isProposalMenu = false;
									}}>{$t('cancel')}</button>
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
			aria-label="close" />
	</div>
</div>
