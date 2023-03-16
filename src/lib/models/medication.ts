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
		Math.round(100 * (medicationToConsume.quantityRemaining.value - dose.quantity.value)) / 100,
		0
	);
	medicationToConsume.quantityRemaining.value = newQuantity;
	return medications
		.map((m, i) => (i === medicationToConsumeIndex ? medicationToConsume : m))
		.filter((m) => m.quantityRemaining.value > 0);
}

export function addMedication(medication: Medication, medications: Medication[]) {
	const existingMedication = medications.find((m) => m.name === medication.name);
	if (existingMedication) {
		existingMedication.initialQuantity.value = medication.initialQuantity.value;
		existingMedication.quantityRemaining.value += medication.initialQuantity.value;
		return [...medications.filter((m) => m.name !== medication.name), existingMedication];
	}
	return [...medications, medication];
}
