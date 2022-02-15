<script context="module">
	export async function load(params) {
		console.log(params);
		if (params.params.lunchId) {
			return {
				status: 200
			};
		}
		//TODO check if exists
		return {
			status: 302,
			redirect: '/overview'
		};
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getUser, lunchsLocal } from '$lib/stores/userStore';

	import { onMount } from 'svelte';

	const lunchId = $page.params['lunchId'];
	onMount(async () => {
		if (getUser()) {
			goto('/login');
		}
		if (lunchId) {
			goto("/overview");
		}
		if (!lunchsLocal.some(l => l.id === lunchId)) {
			goto("/overview");
		}
	});
</script>
