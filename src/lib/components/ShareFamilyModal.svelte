<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/helpers/i18n';
	// @ts-ignore
	import Clipboard from 'svelte-clipboard';

	export let isOpen: boolean;
	export let familyId: string;
	let url = '';
	onMount(async () => {
		url = window.location.origin + '/join/' + familyId;
	});
</script>

<div class="modal" class:is-active={isOpen}>
	<div class="modal-background" />
	<div class="modal-content">
		<div class="card">
			<header class="card-header">
				<p class="card-header-title">{$t('invite-family')}</p>
			</header>
			<div class="card-content">
				<div class="subtitle">
					{$t('share-this-link-with-your-family-to-invite-them-to-join-you')}
				</div>
				<input
					class="input is-primary"
					type="text"
					placeholder="Primary input"
					disabled
					value={url} />

				<div class="card-footer">
					<div class="mt-4">
						<Clipboard
							text={url}
							let:copy
							on:copy={() => {
								console.log('Has Copied');
							}}>
							<button class="button mr-4" on:click={copy}>{$t('copy-link')}</button>
						</Clipboard>
						<button
							class="button is-primary"
							on:click={() => {
								isOpen = false;
							}}
							aria-label="close">
							{$t('close')}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	<button
		class="modal-close is-large"
		on:click={() => {
			isOpen = false;
		}}
		aria-label="close" />
</div>
