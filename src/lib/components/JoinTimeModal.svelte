<script lang="ts">
	import type { definitions } from '$lib/models';
	import dayjs, { Dayjs } from 'dayjs';
	import isToday from 'dayjs/plugin/isToday.js';
	import customParseFormat from 'dayjs/plugin/customParseFormat.js';
	import { createEventDispatcher, onMount } from 'svelte';
	import { t } from '$lib/helpers/i18n';

	dayjs.extend(isToday);
	dayjs.extend(customParseFormat);

	export let isShowingJoinModal;
	export let currentDate: string;
	export let hasJoinedlunch: boolean = false;

	export let startTime: string = $t('start-time');
	export let endTime: string = $t('stop-time');

	const dispatcher = createEventDispatcher<{
		joinLunch: { startTime: string; endTime: string };
		editLunchTime: { startTime: string; endTime: string };
	}>();

	let times: Array<Dayjs> = [];
	let startTimes: Array<Dayjs> = [];
	let endTimes: Array<Dayjs> = [];

	$: {
		startTimes = dayjs(currentDate).isToday()
			? times.filter((time) => dayjs(time).isAfter(dayjs()))
			: times;
		if (startTime) {
			endTimes = startTimes.filter((time) => time.isAfter(dayjs(startTime, 'HH:mm')));
		}
	}

	const generateTime = (): void => {
		const start = dayjs().hour(0).minute(0).second(0);
		let time = start;
		while (time.isToday()) {
			time = dayjs(time).add(5, 'minute');
			times.push(time);
		}
	};
	const handleJoinLunch = (): void => {
		if (hasJoinedlunch) {
			dispatcher('editLunchTime', { startTime: startTime, endTime: endTime });
			return;
		}
		dispatcher('joinLunch', { startTime: startTime, endTime: endTime });
	};
	const handleJoinLunchNoTime = (): void => {
		if (hasJoinedlunch) {
			dispatcher('editLunchTime', { startTime: null, endTime: null });
			return;
		}
		dispatcher('joinLunch', { startTime: null, endTime: null });
	};

	generateTime();
	onMount(() => {
		if (!hasJoinedlunch || !startTime || !endTime) {
			startTime = $t('start-time');
			endTime = $t('stop-time');
		}
	});
</script>

<div class="modal" class:is-active={isShowingJoinModal}>
	<div class="modal-background" />
	<div class="modal-content">
		<form on:submit|preventDefault={handleJoinLunch}>
			<div class="card">
				<header class="card-header">
					<p class="card-header-title">{$t('join-lunch')}</p>
				</header>
				<div class="card-content">
					<p class="subtitle is-6">{$t('in-what-time-frame-do-you-have-time-to-eat')}</p>
					<div class="field is-grouped">
						<div class="control">
							<div class="select is-rounded">
								<select bind:value={startTime}>
									<option>{$t('start-time')}</option>
									{#each startTimes as start}
										<option>{start.format('HH:mm')}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="control">
							<div class="select is-rounded">
								<select bind:value={endTime}>
									<option>{$t('stop-time')}</option>
									{#each endTimes as start}
										<option>{start.format('HH:mm')}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>
					<div class="field is-grouped">
						<div class="control">
							{#if hasJoinedlunch}
								<button
									type="submit"
									class="button is-link"
									disabled={startTime == 'Start Time' || endTime == 'Stop Time'}>
									{$t('edit-lunchtime')}</button>
							{:else}
								<button
									type="submit"
									class="button is-link"
									disabled={startTime == 'Start Time' || endTime == 'Stop Time'}>
									{$t('join-lunch')}</button>
							{/if}
						</div>
						<div class="control">
							<button
								class="button is-warning "
								type="reset"
								on:click={() => {
									handleJoinLunchNoTime();
								}}>{$t('i-dont-know')}</button>
						</div>
						<div class="control">
							<button
								class="button is-link is-light"
								type="reset"
								on:click={() => {
									isShowingJoinModal = false;
								}}>{$t('cancel')}</button>
						</div>
					</div>
				</div>
			</div>
		</form>
	</div>
	<button
		class="modal-close is-large"
		on:click={() => {
			isShowingJoinModal = false;
		}}
		aria-label="close" />
</div>
