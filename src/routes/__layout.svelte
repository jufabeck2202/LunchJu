<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import { setupI18n } from '$lib/helpers/i18n';
	import '../app.scss';
	setupI18n();
</script>

<Header />
<slot />
