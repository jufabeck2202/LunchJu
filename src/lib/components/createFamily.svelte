<script lang="ts">
	import { createFamily } from '$lib/stores/userStore';
	import { toast } from '@zerodevx/svelte-toast';
	let familyName: string = '';
	let isLoading: boolean = false;

	const handleCreateFamily = async () => {
		isLoading = true;
		const error = await createFamily(familyName);
		if (error) {
			alert(error.message);
			return;
		}

		console.log('toast');
		toast.push('Family created successfully', {
			duration: 1000,
			theme: {
				'--toastBackground': '#00c4a7',
				'--toastColor': 'white',
				'--toastBarBackground': '#f5f5f5',
				'--toastBorderRadius': '7px'
			}
		});

		isLoading = false;
	};
</script>

<div class="columns is-centered ">
	<div class="column is-6 m-2">
		<div class="card p-5">
			<h1 class="title">Family</h1>
			<div class="subtitle is-6 pt-3 ">
				Your User does not belong to a Family. <br />
				<span class="has-text-weight-semiboldlunchId">Please create a new Family</span>
			</div>
			<div class="field">
				<div class="control">
					<input class="input " type="text" bind:value={familyName} placeholder="Family Name" />
				</div>
			</div>
			<div class="control">
				<button
					class="button is-primary"
					disabled={isLoading || familyName.length < 3}
					is-loading={isLoading}
					on:click={handleCreateFamily}>Create Family</button
				>
			</div>
		</div>
	</div>
</div>
