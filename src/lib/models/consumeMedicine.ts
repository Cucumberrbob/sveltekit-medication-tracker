import { get, type Writable } from 'svelte/store';
import type { Dose, Medication } from '../../app';

export function consumeMedicine(medications: Medication[], dose: Dose): Medication[] {
	const medicationToConsumeIndex = medications.findIndex((m) => m.name === dose.medicationName);
	if (medicationToConsumeIndex !== 0 && !medicationToConsumeIndex) {
		throw new Error('Medication to consume not found');
	}
	const medicationToConsume = medications[medicationToConsumeIndex];

	if (!medicationToConsume) throw new Error('Medication to consume not found');
	const newQuantity = Math.max(
		medicationToConsume.quantityRemaining.value - dose.quantity.value,
		0
	);
	medicationToConsume.quantityRemaining.value = newQuantity;
	return medications
		.map((m, i) => (i === medicationToConsumeIndex ? medicationToConsume : m))
		.filter((m) => m.quantityRemaining.value > 0);
}
