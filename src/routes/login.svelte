<script context="module">
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import CreateFamily from '$lib/components/createFamily.svelte';
	import CreateName from '$lib/components/CreateName.svelte';
	import LoginComponent from '$lib/components/LoginComponent.svelte';

	import { getUserAsync, getUserName, mountFamily, setUsername } from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	import Stats from './stats.svelte';
	// let username = 'beju@beju.de';
	// let password = 'Juliansssss1123';
	// let loading;
	enum State {
		LOGIN = 1,
		USERNAME = 2,
		FAMILY = 3
	}
	onMount(async () => {
		await checkUser();
	});

	let currentState = State.LOGIN;

	const checkUser = async () => {
		const user = await getUserAsync();
		if (!user) {
			currentState = State.LOGIN;
			return;
		}
		const username = await getUserName();
		if (!username) {
			currentState = State.USERNAME;
			return;
		}
		const family = await mountFamily();
		if (!family) {
			currentState = State.FAMILY;
			return;
		}
		goto('/overview');
	};

	const handleSignUp = async () => {
		await checkUser();
	};
	const handleSignIn = async () => {
		await checkUser();
	};
	const handleUsernameCreated = async () => {
		await checkUser();
	};
	const handleFamilyCreated = async () => {
		await checkUser();
	};
</script>

<section>
	<div class="columns is-centered">
		<div class="column is-5 ">
			{#if currentState == State.USERNAME}
				<CreateName on:usernameCreated={handleUsernameCreated} />
			{:else if currentState == State.LOGIN}
				<LoginComponent on:signUp={handleSignUp} on:signIn={handleSignIn} />
			{:else if currentState == State.FAMILY}
				<CreateFamily on:familyCreated={handleFamilyCreated} />
			{/if}
		</div>
	</div>
</section>

<!-- markup (zero or more items) goes here -->
<style>
	/* your styles go here */
</style>
