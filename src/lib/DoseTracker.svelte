<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { createEventDispatcher } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Dose, Medication, QuickLog } from '../app';
	import MedicationDropdown from './MedicationDropdown.svelte';
	export let medications: Writable<Medication[]>;

	const dispatch = createEventDispatcher();
	function handleAddDose(e: SubmitEvent) {
		const formData = new FormData(formEl);

		const name = formData.get('name')?.toString();
		console.log(formData);
		const foundMedication = $medications.find((m) => m.name === name);
		if (!name || !foundMedication) errorFields = [...errorFields, 'name'];

		const quantityStr = formData.get('quantity')?.toString();
		if (!quantityStr) errorFields = [...errorFields, 'quantity'];
		const quantity = parseFloat(quantityStr || '');
		if (isNaN(quantity) || quantity > (foundMedication?.quantityRemaining.value || 0))
			errorFields = [...errorFields, 'quantity'];
		console.log(errorFields);
		if (errorFields.length > 0) return;

		dispatch('addDose', {
			medicationName: name,
			quantity: { value: quantity, unit: 'g' },
			dateTime: new Date()
		} as Dose);
	}

	let errorFields: ('name' | 'quantity')[] = [];
	let formEl: HTMLFormElement;
</script>

<form
	class="card p-4 space-y-2 w-96 max-md:w-full max-md:row-start-1  flex flex-col justify-items-stretch"
	bind:this={formEl}
	on:submit|preventDefault={handleAddDose}
>
	<span class="text-xl">Log a dose</span>
	<label for="name">
		<span>Medication Name</span>
		<!-- <input
			type="text"
			placeholder="Enter Medication Name..."
			class="input"
			on:input={() => (errorFields = errorFields.filter((f) => f !== 'name'))}
			class:input-error={errorFields.includes('name')}
			name="name"
		/> -->
		<MedicationDropdown options={$medications} name="name" selected={undefined} />
	</label>
	<label for="quantity">
		<span>Quantity</span>
		<div
			class="input-group grid grid-cols-[1fr_auto] pr-2 "
			class:input-error={errorFields.includes('quantity')}
		>
			<input
				type="number"
				step="0.01"
				class="!appearance-none !m-0"
				on:input={() => (errorFields = errorFields.filter((f) => f !== 'quantity'))}
				name="quantity"
				placeholder="Enter Quantity..."
			/>
			<span class="my-auto">g</span>
		</div>
	</label>
	<div class="h-full" />
	<button class="btn variant-filled-primary w-full">Log</button>
</form>
