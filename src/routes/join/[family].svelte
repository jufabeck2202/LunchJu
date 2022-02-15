<script context="module">
	export async function load(params) {
		if (params.params.family) {
			return {
				status: 200
			};
		}
		//TODO check if exists
		return {
			status: 302,
			redirect: '/login'
		};
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import type { definitions } from '$lib/models';
	import { page } from '$app/stores';
	import {
		checkIfUserFamilyExists,
		getFamily,
		getUser,
		joinFamily,
		signOut
	} from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	import LoginComponent from '$lib/components/LoginComponent.svelte';
	import { fade } from 'svelte/transition';
	import { ErrorToast, SuccessToast } from '$lib/helpers/toast';

	const familyID = $page.params['family'];
	let tempFamily: definitions['families'] = null;
	let isLoading: boolean = false;
	let hasJoinedFamily = false;
	let name: string = '';
	onMount(async () => {
		if (!getUser()) {
			goto('/login');
			return;
		}
		const data = await getFamily(familyID);
		if (!data) {
			goto('/404');
		}
		tempFamily = data;
		console.log(getUser());
		if (getUser()) {
			console.log('user is logged in');
			if (await checkIfUserFamilyExists()) {
				console.log('hi');
				ErrorToast(
					'<strong>You have already joined a family.</strong> <br>Please create a new account if you wish to join another family.'
				);
				const error = await signOut();
				goto('/login');
			}
		}
	});

	const handleJoinFamily = async () => {
		hasJoinedFamily = true;
		if (getUser()) {
			SuccessToast('You Have Successfully Joined The Family');
			const error = await joinFamily(tempFamily.id, name);
			if (error) {
				ErrorToast(error.message);
			} else {
				goto('/');
			}
		}
	};

	const handleSignUp = async (user) => {
		const error = await joinFamily(tempFamily.id, name);
		if (error) {
			ErrorToast(error.message);
		} else {
			goto('/');
		}
	};
</script>

{#if tempFamily}
	<div class="columns is-centered ">
		<div class="column is-6 m-2">
			{#if !hasJoinedFamily}
				<!-- content here -->
				<div class="card p-5" transition:fade>
					<h1 class="title">Join {tempFamily?.name}</h1>
					<div class="subtitle is-6 pt-3 ">
						You have been invited to join the family {tempFamily?.name} <br />
						<span class="has-text-weight-semibold"
							>Enter your name and the button if you want to join</span
						>
					</div>
					<div class="field">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">Your Name</label>
						<div class="control">
							<input class="input" type="text" placeholder="Enter your name" bind:value={name} />
						</div>
					</div>

					<div class="control">
						<button
							class="button is-primary"
							disabled={isLoading}
							is-loading={isLoading}
							on:click|once={handleJoinFamily}>Join Family</button
						>
					</div>
				</div>
			{:else}
				<LoginComponent on:signUp={handleSignUp} />
			{/if}
		</div>
	</div>
{/if}
