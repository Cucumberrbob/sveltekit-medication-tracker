const strains = [
	{ name: 'Strawberry Cough', preferredTime: 'morning' },
	{ name: 'Blue Dream', preferredTime: 'afternoon' },
	{ name: 'Gelato', preferredTime: 'evening' }
] as const;
import type { ServerDose } from './src/app';

function createRandomDose(timeWindowStart: Date, timeWindowDuration: number): ServerDose {
	let strain: (typeof strains)[number]['name'];
	const seed = Math.random();
	if (timeWindowStart.getHours() < 14) {
		if (seed < 0.1) {
			strain = strains[1].name;
		} else if (seed < 0.9) {
			strain = strains[0].name;
		} else {
			strain = strains[2].name;
		}
	} else if (timeWindowStart.getHours() < 20) {
		if (seed < 0.1) {
			strain = strains[2].name;
		} else if (seed < 0.9) {
			strain = strains[1].name;
		} else {
			strain = strains[0].name;
		}
	} else {
		if (seed < 0.1) {
			strain = strains[0].name;
		} else if (seed < 0.9) {
			strain = strains[2].name;
		} else {
			strain = strains[1].name;
		}
	}
	return [
		strain,
		Math.round(Math.random() * 5 + 1) / 10,
		+new Date(timeWindowStart.getTime() + Math.random() * timeWindowDuration)
	];
}

const doses: ServerDose[] = [];
const daysToGenerate = 25;
let i = 0;
for (const _ in Array(daysToGenerate).fill(0)) {
	i++;
	const firstDoseDateTime = new Date(+new Date() - 86_400_000 * (25 - i));
	firstDoseDateTime.setHours(9 + Math.floor(Math.random() * 3));
	firstDoseDateTime.setMinutes(Math.floor(Math.random() * 60));
	const lastDoseDateTime = new Date(+new Date(firstDoseDateTime.toDateString()) + 86_400_000);
	let currentDoseDateTime = firstDoseDateTime;
	while (currentDoseDateTime < lastDoseDateTime) {
		const dose = createRandomDose(currentDoseDateTime, 60 * 60 * 1000);
		currentDoseDateTime = new Date(dose[2]);
		doses.push(dose);
	}
}
console.log(JSON.stringify(doses));
