<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { t } from '$lib/helpers/i18n';

	export let isShowingJoinModal: boolean;
	export let hasJoinedlunch: boolean = false;

	const dispatcher = createEventDispatcher<{
		joinMeal: { meal_type: string };
		editMeal: { meal_type: string };
	}>();
	let breakfastIsSelected = false;
	let lunchIsSelected = false;
	let dinnerIsSelected = false;

	const buildMealType = () => {
		let mealType = '';
		if (breakfastIsSelected) {
			mealType += 'breakfast,';
		}
		if (lunchIsSelected) {
			mealType += 'lunch,';
		}
		if (dinnerIsSelected) {
			mealType += 'dinner,';
		}
		return mealType.slice(0, -1);
	};
	const handleJoinMeal = (): void => {
		if (hasJoinedlunch) {
			dispatcher('editMeal', { meal_type: buildMealType() });
			return;
		}
		dispatcher('joinMeal', { meal_type: buildMealType() });
	};
</script>

<div class="modal" class:is-active={isShowingJoinModal}>
	<div class="modal-background" />
	<div class="modal-content">
		<form on:submit|preventDefault={handleJoinMeal}>
			<div class="card">
				<header class="card-header">
					<p class="card-header-title">{$t('join-lunch')}</p>
				</header>
				<div class="card-content">
					<p class="subtitle is-6">{$t('in-what-time-frame-do-you-have-time-to-eat')}</p>
					<div class="field">
						<label class="checkbox">
							<input bind:checked={breakfastIsSelected} type="checkbox" />
							Breakfast
						</label>
					</div>
					<div class="field">
						<label class="checkbox">
							<input bind:checked={lunchIsSelected} type="checkbox" />
							Lunch
						</label>
					</div>
					<div class="field">
						<label class="checkbox">
							<input bind:checked={dinnerIsSelected} type="checkbox" />
							Dinner
						</label>
					</div>
					<div class="field">
						<div class="field is-grouped">
							<div class="control">
								{#if hasJoinedlunch}
									<button type="submit" class="button is-link"> {$t('edit-lunchtime')}</button>
								{:else}
									<button
										type="submit"
										class="button is-link"
										disabled={!lunchIsSelected && !breakfastIsSelected && !dinnerIsSelected}>
										{$t('join-lunch')}</button>
								{/if}
							</div>
							<div class="control">
								<button
									class="button is-link is-light"
									type="reset"
									on:click={() => {
										isShowingJoinModal = false;
									}}>{$t('cancel')}</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
	</div>
	<button
		class="modal-close is-large"
		on:click={() => {
			isShowingJoinModal = false;
		}}
		aria-label="close" />
</div>
