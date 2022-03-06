<script lang="ts">
	import type { definitions } from '$lib/models';
	import dayjs, { Dayjs } from 'dayjs';
	import isToday from 'dayjs/plugin/isToday.js';
	import customParseFormat from 'dayjs/plugin/customParseFormat.js';
	import { createEventDispatcher, onMount } from 'svelte';

	dayjs.extend(isToday);
	dayjs.extend(customParseFormat);

	export let isShowingJoinModal;
	export let currentDate: string;
	export let hasJoinedlunch: boolean = false;

	export let startTime: string = 'Start Time';
	export let endTime: string = 'Stop Time';

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
			dispatcher('editLunchTime', { startTime: undefined, endTime: undefined });
			return;
		}
		dispatcher('joinLunch', { startTime: undefined, endTime: undefined });
	};

	generateTime();
	onMount(() => {
		if (!hasJoinedlunch) {
			startTime = 'Start Time';
			endTime = 'Stop Time';
		}
	});
</script>

<div class="modal" class:is-active={isShowingJoinModal}>
	<div class="modal-background" />
	<div class="modal-content">
		<form on:submit|preventDefault={handleJoinLunch}>
			<div class="card">
				<header class="card-header">
					<p class="card-header-title">Join Lunch</p>
				</header>
				<div class="card-content">
					<p class="subtitle is-6">Select the time you want to eat:</p>
					<div class="field is-grouped">
						<div class="control">
							<div class="select is-rounded">
								<select bind:value={startTime}>
									<option>Start Time</option>
									{#each startTimes as start}
										<option>{start.format('HH:mm')}</option>
									{/each}
								</select>
							</div>
						</div>
						<div class="control">
							<div class="select is-rounded">
								<select bind:value={endTime}>
									<option>Stop Time</option>
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
									Edit Lunchtime</button>
							{:else}
								<button
									type="submit"
									class="button is-link"
									disabled={startTime == 'Start Time' || endTime == 'Stop Time'}>
									Join Lunch</button>
							{/if}
						</div>
						<div class="control">
							<button
								class="button is-warning "
								type="reset"
								on:click={() => {
									handleJoinLunchNoTime();
								}}>I don't know</button>
						</div>
						<div class="control">
							<button
								class="button is-link is-light"
								type="reset"
								on:click={() => {
									isShowingJoinModal = false;
								}}>Cancel</button>
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
