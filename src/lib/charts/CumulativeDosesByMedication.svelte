<script lang="ts">
	import type { Dose } from '../../app';

	import colors from './colors';

	import {
		Chart,
		Title,
		Tooltip,
		Legend,
		LineElement,
		CategoryScale,
		LinearScale,
		PointElement,
		type ChartData,
		type Point
	} from 'chart.js';
	import { Scatter } from 'svelte-chartjs';
	import { safeDate } from '$lib/models/safeDateTime';

	Chart.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

	export let doses: Dose[];
	export let daysToShow: number = 7;
	function calculateData(
		doses: Dose[],
		daysToShow: number
	): ChartData<'scatter', (number | Point)[], unknown> {
		const cutoffTime = new Date(+new Date() - daysToShow * 86_400_000);

		const dosesByMedication = doses.reduce((acc, dose) => {
			if (!!daysToShow && dose.dateTime < cutoffTime) {
				return acc;
			}
			if (!acc[dose.medicationName]) {
				acc[dose.medicationName] = [];
			}
			acc[dose.medicationName].push(dose);
			return acc;
		}, {} as Record<string, Dose[]>);
		const cumulativeDosesByMedication = Object.entries(dosesByMedication).reduce(
			(acc, [medicationName, doses]) => {
				let runningTotal = 0;
				acc[medicationName] = doses.map((dose) => {
					runningTotal += dose.quantity.value;
					return {
						...dose,
						runningTotal
					};
				});
				return acc;
			},
			{} as Record<string, (Dose & { runningTotal: number })[]>
		);
		return {
			labels: Object.keys(dosesByMedication),
			datasets: Object.entries(cumulativeDosesByMedication).map(([medicationName, doses], i) => ({
				label: medicationName,
				data: doses.map((dose) => ({
					x: +safeDate(dose.dateTime),
					y: dose.runningTotal
				})),
				borderWidth: 1,
				pointBackgroundColor: colors[i % colors.length].backgroundColor,
				pointBorderColor: colors[i % colors.length].borderColor,
				pointRadius: 2,
				...colors[i % colors.length],
				pointHoverRadius: 3,
				fill: false,
				tension: 0,
				showLine: true
			}))
		};
	}
	$: data = calculateData(doses, daysToShow);
</script>

<Scatter
	{data}
	options={{
		plugins: {
			tooltip: {
				callbacks: {
					label: (item) => {
						const lastPointInDataset = item.chart.data.datasets.find(
							(d) => d.label === item.dataset.label
						)?.data[item.dataIndex - 1];
						if (
							!lastPointInDataset ||
							!(typeof lastPointInDataset === 'object' && 'y' in lastPointInDataset)
						) {
							return [
								`${item.dataset.label}, ${new Date(item.parsed.x).toLocaleString([], {
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								})}`,
								`Consumed ${item.parsed.y.toFixed(2)}g`
							];
						}
						return [
							`${item.dataset.label}, ${new Date(item.parsed.x).toLocaleString('en-gb', {
								month: 'short',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit'
							})}`,
							`Consumed ${(item.parsed.y - lastPointInDataset.y).toFixed(
								2
							)}g - Total ${item.parsed.y.toFixed(2)}g`
						];
					}
				}
			}
		},
		scales: {
			x: {
				ticks: {
					callback(tickValue) {
						return new Date(tickValue).toLocaleDateString('en-gb', {
							month: 'short',
							day: 'numeric'
						});
					}
				}
			}
		}
	}}
/>
