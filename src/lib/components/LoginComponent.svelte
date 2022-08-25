<script lang="ts">
	import { browser } from '$app/env';
	import { ErrorToast } from '$lib/helpers/toast';
	import { getUserAsync, signIn, signUp } from '$lib/stores/userStore';
	import { supabase } from '$lib/supabaseclient';
	import Icon from '@iconify/svelte';
	import { AuthError } from '@supabase/supabase-js';
	import { t } from '$lib/helpers/i18n';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	let username: string;
	let password: string;
	let loading = false;
	const dispatch = createEventDispatcher();
	const handleSignUp = async () => {
		try {
			loading = true;
			const [user, error] = await signUp(username, password);
			if (error) {
				throw error;
			}
			if (browser && user) {
				dispatch('signUp', user);
			}
		} catch (error) {
			if (error instanceof AuthError) {
				ErrorToast(error.message);
			} else {
				ErrorToast($t('something-went-wrong'));
			}
		} finally {
			loading = false;
		}
	};
	const handleSignIn = async () => {
		try {
			loading = true;
			const [user, error] = await signIn(username, password);
			if (error) {
				throw error;
			}
			if (browser && user) {
				dispatch('signIn', user);
			}
		} catch (error) {
			if (error instanceof AuthError) {
				ErrorToast(error.message);
			} else {
				ErrorToast($t('something-went-wrong'));
			}
		} finally {
			loading = false;
		}
	};
	const handleSignInGithub = async () => {
		try {
			loading = true;
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'github',
				options: { redirectTo: 'https://lunch-ju.vercel.app/overview' }
			});
			if (error) {
				throw error;
			}
			await getUserAsync();
		} catch (error) {
			if (error instanceof AuthError) {
				ErrorToast(error.message);
			} else {
				ErrorToast($t('something-went-wrong'));
			}
		} finally {
			loading = false;
		}
	};
</script>

<div class="card p-5 mt-5" transition:fade>
	<form on:submit|preventDefault>
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">{$t('email')}</label>
			<div class="control">
				<input
					class="input"
					type="text"
					placeholder={$t('enter-your-email-here')}
					bind:value={username} />
			</div>
		</div>
		<div class="field">
			<label class="label">{$t('password')}</label>
			<div class="control">
				<!-- svelte-ignore a11y-autofocus -->
				<input
					class="input"
					type="password"
					autofocus
					placeholder="{$t('enter-your-password-here')}"
					bind:value={password} />
			</div>
		</div>
		<button class="button is-primary" is-loading={loading} on:click={handleSignUp}>
			{$t('create-account')}
		</button>
		<button class="button is-primary" is-loading={loading} on:click={handleSignInGithub}>
			<Icon icon="akar-icons:github-fill" />
		</button>
		<!-- TODO: Handle Login -->
		<button class="button is-primary" on:click={handleSignIn}> {$t('login-0')} </button>
	</form>
</div>
