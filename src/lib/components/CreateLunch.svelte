<script lang="ts">
	import { createLunch, family, lunches } from '$lib/stores/userStore';
	import Lunch from './Lunches.svelte';
	import Users from '$lib/components/Users.svelte';
	import { t } from '$lib/helpers/i18n';
	const handleCreateLunch = async () => {
		const error = await createLunch();
	};
</script>

<svelte:head>
	{#if $family}
		<title>{$family.name} {$t('lunch')}</title>
	{/if}
</svelte:head>

<div class="card p-3">
	<h2 class="title is-4 p-3">{$t('create-lunch')}</h2>
	<p class="subtitle pl-3">{$t('nobody-wants-to-eat-today')}</p>
	<button
		class="button is-medium is-primary is-fullwidth"
		disabled={$lunches.length >= 3}
		on:click={handleCreateLunch}>
		{$t('schedule-lunch-for-today')}
	</button>
</div>
