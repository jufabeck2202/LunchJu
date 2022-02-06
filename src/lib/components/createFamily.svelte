<script lang="ts">
	import { checkIfUserFamilyExists, createFamily } from '$lib/stores/userStore';

	// your script goes here
	let familyName: string;

	const handleCreateFamily = async () => {
		const result = await createFamily(familyName);
		if (error) {
			alert(error.message);
		}
	};
</script>

<div class="columns is-centered ">
	<div class="column is-6 m-2">
		<div class="card p-5">
			<h1 class="title">Family</h1>
			<div class="subtitle is-6 pt-3 ">
				Your User does not belong to a Family. <br />
				<span class="has-text-weight-semibold	">Please create a new Family</span>
			</div>
			<div class="field">
				<div class="control">
					<input class="input " type="text" bind:value={familyName} placeholder="Text input" />
				</div>
			</div>
			<div class="control">
				<button class="button is-primary" on:click={handleCreateFamily}>Create Family</button>
			</div>
		</div>
	</div>
</div>
