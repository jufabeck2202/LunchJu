<script lang="ts">
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	import { getUser, signOut } from '$lib/stores/userStore';
import { SvelteToast } from '@zerodevx/svelte-toast';

	let mobile;
	const toggleNav = () => {
		mobile = !mobile;
	};


	async function handleSignout() {
		await signOut();
		goto('/login');
	}
</script>

<header>
	<section class="section">
		<nav class="navbar is-light is-fixed-top has-shadow">
			<!--Logo-->
			<div class="navbar-brand">
				<a href="/overview" class="navbar-item" style="font-weight:800">LunchJu</a>
				<a class="navbar-burger" class:is-active={mobile} id="burger" on:click={toggleNav}>
					<span />
					<span />
					<span />
				</a>
			</div>
			<!--Items-->
			<div class="navbar-menu" class:is-active={mobile} id="menu">
				<div class="navbar-start">
					<!--Item-->
					<a
						class="navbar-item"
						class:is-active={$page.url.pathname === '/'}
						sveltekit:prefetch
						href="/stats"
					>
						Statistic
					</a>
					<!--Item-->
					<a
						class="navbar-item"
						class:is-active={$page.url.pathname === '/login'}
						sveltekit:prefetch
						href="/login"
					>
						Login
					</a>
				</div>
			</div>
			<div class="navbar-menu" class:is-active={mobile} id="menu">
				<div class="navbar-end">
					<a
						class="navbar-item"
						class:is-active={$page.url.pathname === '/about'}
						sveltekit:prefetch
						href="/about"
					>
						About
					</a>
				</div>
				<button class="button primary" on:click|once={handleSignout}> Log out </button>
			</div>
		</nav>
	</section>
	<SvelteToast />
</header>

<style>
	/* header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--accent-color);
	} */
</style>
