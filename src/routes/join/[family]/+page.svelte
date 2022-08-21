<script lang="ts">
	import { goto } from '$app/navigation';
	import type { definitions } from '$lib/models';
	import { page } from '$app/stores';
	import {
		mountFamily,
		getFamily,
		getUserAsync,
		getUserName
	} from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	import LoginComponent from '$lib/components/LoginComponent.svelte';
	import CreateName from '$lib/components/CreateName.svelte';
	import JoinFamily from '$lib/components/JoinFamily.svelte';
	import type { Database } from '$lib/DatabaseDefinitions';

	enum State {
		LOGIN = 1,
		USERNAME = 2,
		HAS_ALREADY_JOINED = 3,
		JOIN_FAMILY = 4
	}

	const familyID = $page.params['family'];
	let tempFamily: Database['public']['Tables']['families']['Row'] | null = null;
	let currentState = State.LOGIN;
	let userName: string | undefined;

	onMount(async () => {
		await checkUser();
	});

	const checkUser = async () => {
		tempFamily = await getFamily(familyID);
		if (!tempFamily) {
			goto('/404');
		}
		const user = await getUserAsync();
		if (!user) {
			currentState = State.LOGIN;
			return;
		}
		userName = await getUserName();
		if (!userName) {
			currentState = State.USERNAME;
			return;
		}
		const family = await mountFamily();
		if (family) {
			currentState = State.HAS_ALREADY_JOINED;
			goto('/overview');
			return;
		}
		currentState = State.JOIN_FAMILY;
	};

	const handleJoinFamily = async () => {
		await checkUser();
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
</script>

{#if tempFamily}
	<section class="hero is-primary is-fullheight-with-navbar">
		<div>
			<div class="p-3">
				<div class="column has-text-centered">
					<p class="title">
						Join {tempFamily.name}'s Family
					</p>
					<p class="subtitle">You have been invited to join LunchJu</p>
				</div>
				<div class="columns is-centered">
					<div class="column is-4 is-5-tablet is-5-fullhd">
						{#if currentState == State.USERNAME}
							<CreateName on:usernameCreated={handleUsernameCreated} />
						{:else if currentState == State.LOGIN}
							<LoginComponent on:signUp={handleSignUp} on:signIn={handleSignIn} />
						{:else if currentState == State.JOIN_FAMILY}
							<JoinFamily on:familyJoined={handleJoinFamily} family={tempFamily} />
						{/if}
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}
