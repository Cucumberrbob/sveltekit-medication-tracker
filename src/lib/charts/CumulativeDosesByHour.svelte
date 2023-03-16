<script lang="ts">
	import { Line, Scatter } from 'svelte-chartjs';
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

	Chart.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

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
		const dosesByDay = doses.reduce((acc, dose) => {
			if (dose.dateTime < cutoffTime) {
				return acc;
			}
			const date = new Date(+dose.dateTime - 7 * 3_600_000).toISOString().split('T')[0];
			if (!acc[date]) {
				acc[date] = [];
			}
			acc[date].push(dose);
			return acc;
		}, {} as Record<string, Dose[]>);

		const cumulativeDosesByDay = Object.entries(dosesByDay).reduce((acc, [date, doses]) => {
			let runningTotal = 0;
			acc[date] = doses.map((dose) => {
				runningTotal += dose.quantity.value;
				return {
					...dose,
					runningTotal
				};
			});
			return acc;
		}, {} as Record<string, (Dose & { runningTotal: number })[]>);

		const datasets: ChartData<'scatter', (number | Point)[], unknown>['datasets'] = days
			.map(
				(
					day,
					i
				): ChartData<'scatter', (number | Point)[], unknown>['datasets'][number] | undefined => {
					const doses = cumulativeDosesByDay[day];
					if (!doses) return;
					const dayStartTime = new Date(+new Date(day) + 7 * 3_600_000);
					return {
						label: day,
						data: doses.map((dose) => {
							return {
								x: +dose.dateTime - +dayStartTime,
								y: dose.runningTotal
							};
						}),
						borderWidth: 1,
						pointBackgroundColor: colors[i % colors.length].backgroundColor,
						pointBorderColor: colors[i % colors.length].borderColor,
						pointRadius: 2,
						...colors[i % colors.length],
						pointHoverRadius: 3,
						fill: false,
						tension: 0,
						showLine: true
					};
				}
			)
			.filter(Boolean);

		const data: ChartData<'scatter', (number | Point)[], unknown> = {
			labels: days.filter((d) => !!cumulativeDosesByDay[d]),
			datasets
		};
		// console.log(data);
		return data;
	}
	$: data = calculateData(doses, daysToShow);
</script>

<Scatter
	{data}
	options={{
		responsive: true,
		plugins: {
			tooltip: {
				callbacks: {
					label: (item) => [
						`${item.dataset.label}, ${new Date(item.parsed.x + 7 * 3_600_000).toLocaleTimeString(
							[],
							{
								hour: '2-digit',
								minute: '2-digit'
							}
						)}`,
						` Total ${item.parsed.y.toFixed(2)}g`
					]
				}
			}
		},
		scales: {
			x: {
				ticks: {
					callback(tickValue) {
						const timeOnlyDate = new Date(
							(typeof tickValue === 'string' ? parseInt(tickValue) : tickValue) + 7 * 3_600_000
						);
						return timeOnlyDate.toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit'
						});
					}
				}
			}
		}
	}}
/>
