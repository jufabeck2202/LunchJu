<script lang="ts">
	import { family } from '$lib/stores/userStore';
</script>

<svelte:head>
	{#if $family}
		<title>{$family.name} Lunch</title>
	{/if}
</svelte:head>



<div class="columns is-centered ">
	{#if $family}
		<h1>{$family.name}</h1>
	{/if}
</div>
