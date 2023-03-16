<script lang="ts">
	import CumulativeDosesByHour from '$lib/charts/CumulativeDosesByHour.svelte';
	import CumulativeDosesByMedication from '$lib/charts/CumulativeDosesByMedication.svelte';
	import DosesByDayByMedicine from '$lib/charts/DosesByDayByMedication.svelte';
	import { localStorageOptIn } from '$lib/stores/localStorageOptIn';
	import { createDataTableStore } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';

	export let data: PageData;
	const timeOptions = [
		{ label: 'Last 24 hours', value: 1 },
		{ label: 'Last 7 days', value: 7 },
		{ label: 'Last 30 days', value: 30 },
		{ label: 'Last 90 days', value: 90 },
		{ label: 'All time', value: 0 }
	];
	const chartOptions = [
		{ name: 'byDayByMedication', label: 'By Day by Medication' },
		{ name: 'cumulative', label: 'Cumulative' },
		{ name: 'cumulativeMedication', label: 'Cumulative by Medication' },
		{ name: 'scatter', label: 'Scatter (Coming Soon)', disabled: true }
	];
	const activeOption: [(typeof timeOptions)[number], (typeof chartOptions)[number]] = [
		timeOptions[1],
		chartOptions[0]
	];
</script>

<div class="container h-full mx-auto space-y-4">
	<h1>Your Dose History</h1>
	{#if data.idToken || $localStorageOptIn}
		<div class="grid grid-cols-2 max-xl:grid-cols-1 gap-4 w-full">
			<div class="flex flex-wrap space-x-4">
				{#each timeOptions as timeOption}
					<button
						class="chip my-2"
						class:variant-ringed-primary={timeOption !== activeOption[0]}
						class:variant-filled-primary={timeOption === activeOption[0]}
						on:click={() => {
							activeOption[0] = timeOption;
						}}
					>
						{timeOption.label}
					</button>
				{/each}
			</div>
			<div class="flex flex-wrap xl:justify-end space-x-4">
				{#each chartOptions as chartOption}
					<button
						class="chip my-2"
						disabled={chartOption.disabled}
						class:variant-ringed-primary={chartOption !== activeOption[1]}
						class:variant-filled-primary={chartOption === activeOption[1]}
						on:click={() => {
							activeOption[1] = chartOption;
						}}>{chartOption.label}</button
					>
				{/each}
			</div>
		</div>
		<div
			class="chart-container flex items-center justify-center max-sm:h-[calc(100dvh_-_15rem)] min-h-[320px]"
		>
			{#if activeOption[1] === chartOptions[0]}
				<DosesByDayByMedicine doses={data.doses} daysToShow={activeOption[0].value} />
			{:else if activeOption[1] === chartOptions[1]}
				<CumulativeDosesByHour doses={data.doses} daysToShow={activeOption[0].value} />
			{:else if activeOption[1] === chartOptions[2]}
				<CumulativeDosesByMedication doses={data.doses} daysToShow={activeOption[0].value} />
			{/if}
		</div>
	{:else}
		<div class="flex items-center justify-center h-full mx-auto">
			<span> You need to log in, or choose local storage mode </span>
			<a href="/" data-sveltekit-preload-data={true}>Go Home</a>
		</div>
	{/if}
</div>
