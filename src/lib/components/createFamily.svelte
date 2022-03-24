<script lang="ts">
	import { t } from '$lib/helpers/i18n';

	import { ErrorToast } from '$lib/helpers/toast';
	import { createFamily } from '$lib/stores/userStore';
	import { createEventDispatcher } from 'svelte';
	let familyName: string = '';
	let isLoading: boolean = false;

	const dispatch = createEventDispatcher();

	const handleCreateFamily = async () => {
		isLoading = true;
		const error = await createFamily(familyName);
		if (error) {
			ErrorToast(error.message);
			return;
		}
		isLoading = false;
		dispatch('familyCreated');
	};
</script>

<div class="card p-5 mt-5">
	<h1 class="title">{$t('family')}</h1>
	<form on:submit|preventDefault={handleCreateFamily}>
		<div class="subtitle is-6 pt-3 ">
			{$t('your-user-does-not-belong-to-a-family')} <br />
			<span class="has-text-weight-semiboldlunchId">{$t('please-create-a-new-family')}</span>
		</div>
		<div class="field">
			<div class="control">
				<!-- svelte-ignore a11y-autofocus -->
				<input
					class="input "
					type="text"
					bind:value={familyName}
					placeholder={$t('family-name')}
					autofocus />
			</div>
		</div>
		<div class="control">
			<button
				class="button is-primary"
				disabled={isLoading || familyName.length < 3}
				is-loading={isLoading}
				type="submit">{$t('create-family')}</button>
		</div>
	</form>
</div>
