<script lang="ts">
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
	<h1 class="title">Family</h1>
	<form on:submit|preventDefault={handleCreateFamily}>
		<div class="subtitle is-6 pt-3 ">
			Your User does not belong to a Family. <br />
			<span class="has-text-weight-semiboldlunchId">Please create a new Family</span>
		</div>
		<div class="field">
			<div class="control">
				<!-- svelte-ignore a11y-autofocus -->
				<input class="input " type="text" bind:value={familyName} placeholder="Family Name"  autofocus/>
			</div>
		</div>
		<div class="control">
			<button
				class="button is-primary"
				disabled={isLoading || familyName.length < 3}
				is-loading={isLoading}
				type="submit">Create Family</button>
		</div>
	</form>
</div>
