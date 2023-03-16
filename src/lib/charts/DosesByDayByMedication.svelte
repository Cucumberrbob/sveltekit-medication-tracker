<script lang="ts">
	import { onMount } from 'svelte';
	import type { Dose } from '../../app';
	import { Bar } from 'svelte-chartjs';
	import {
		Chart,
		Title,
		Tooltip,
		Legend,
		BarElement,
		CategoryScale,
		LinearScale,
		type ChartData
	} from 'chart.js';
	import colors from './colors';

	Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

	export let doses: Dose[];
	export let daysToShow: number;
	function calculateData(doses: Dose[], daysToShow: number) {
		const earliestDose = doses.reduce((acc, dose) => {
			if (dose.dateTime < acc) {
				return dose.dateTime;
			}
			return acc;
		}, new Date());
		const daysSinceEarliestDose = Math.ceil((+new Date() - +earliestDose) / 86_400_000);
		//if days to show is zero (falsy), show all days (daysSinceEarliestDose)
		const cutoffTime = new Date(+new Date() - 86_400_000 * (daysToShow || daysSinceEarliestDose));
		const days = Array(daysToShow || daysSinceEarliestDose)
			.fill(0)
			.map((_, i) => {
				const date = new Date(
					+new Date() - 86_400_000 * ((daysToShow || daysSinceEarliestDose) - i - 1)
				);
				return date.toISOString().split('T')[0];
			});
		const dosesByMedicine = doses.reduce((acc, dose) => {
			if (dose.dateTime < cutoffTime) {
				return acc;
			}
			if (!acc[dose.medicationName]) {
				acc[dose.medicationName] = [];
			}
			acc[dose.medicationName].push(dose);
			return acc;
		}, {} as Record<string, Dose[]>);

		const dosesByMedicineByDay = Object.entries(dosesByMedicine).reduce(
			(acc, [medicine, doses]) => {
				acc[medicine] = doses.reduce((acc, dose) => {
					const date = dose.dateTime.toISOString().split('T')[0];
					if (!acc[date]) {
						acc[date] = [];
					}
					acc[date].push(dose);
					return acc;
				}, Object.fromEntries(days.map((d) => [d, []])) as Record<string, Dose[]>);
				return acc;
			},
			{} as Record<string, Record<string, Dose[]>>
		);
		return {
			labels: days,
			datasets: Object.entries(dosesByMedicineByDay).map(([medicine, dosesByDay], i) => ({
				label: medicine,
				data: Object.values(dosesByDay).map((doses) =>
					doses.reduce((acc, dose) => acc + dose.quantity.value, 0)
				),
				...colors[i % colors.length],
				borderWidth: 1
			}))
		};
	}

	let data: ChartData<'bar', (number | [number, number])[], unknown>;
	$: data = calculateData(doses, daysToShow);
</script>

<Bar
	{data}
	options={{
		responsive: true,
		plugins: {
			tooltip: {
				callbacks: { label: (item) => `${item.dataset.label} - ${item.formattedValue}g` }
			}
		}
	}}
/>
