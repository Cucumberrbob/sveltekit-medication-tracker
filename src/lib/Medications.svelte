<script lang="ts">
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import type { Writable } from 'svelte/store';
	import { fly, slide } from 'svelte/transition';
	import type { Medication } from '../app';
	import MedicationDropdown from './MedicationDropdown.svelte';
	import { trpc } from './trpc/client';

	export let medications: Writable<Medication[]>;
	export let shouldUpdateServer = false;
	let state: 'list' | 'add' = 'list';
	function handleAddMedication(event: SubmitEvent) {
		errorFields = [];
		const formData = new FormData(formEl);

		const name = formData.get('medication-name')?.toString();
		if (!name) errorFields.push('name');
		const quantityStr = formData.get('quantity')?.toString();
		if (!quantityStr) errorFields.push('quantity');
		if (!name || !quantityStr) return;

		const quantity = parseInt(quantityStr);
		if (isNaN(quantity)) return errorFields.push('quantity');

		medications.update((meds) => [
			...meds,
			{
				name,
				initialQuantity: { value: quantity, unit: 'g' },
				quantityRemaining: { value: quantity, unit: 'g' }
			}
		]);
		if (shouldUpdateServer) {
			trpc().addMedication.mutate({
				name,
				quantity
			});
		}
		state = 'list';
	}
	let errorFields: Array<'name' | 'quantity'> = [];
	let formEl: HTMLFormElement;
</script>

<div class="card p-4 w-96 max-md:w-full">
	{#if state === 'list'}
		<div
			in:fly={{ x: -100, delay: 259, duration: 250 }}
			out:fly={{ x: -100, duration: 250 }}
			class="space-y-2 relative h-full"
		>
			<span class="text-xl"> Medication remaining </span>
			<div class="medications">
				{#each $medications as medication}
					<div class="grid grid-cols-[1fr_auto] group">
						<span>{medication.name}</span>
						<span
							class="text-surface-500-400-token group-hover:text-surface-900-50-token transition-colors"
							>{medication.quantityRemaining.value}{medication.quantityRemaining.unit}/{medication
								.initialQuantity.value}{medication.initialQuantity.unit}</span
						>
						<div class="col-span-full my-2">
							<ProgressBar
								value={medication.quantityRemaining.value}
								meter="bg-primary-400-500-token transition-[width]"
								max={medication.initialQuantity.value}
							/>
						</div>
					</div>
				{/each}
				{#if $medications.length === 0}
					<span>You don't have any medication added.</span>
				{/if}
			</div>
			<div class="h-12" />
			<div class="flex absolute bottom-0 w-full justify-around">
				<button class="btn variant-filled-primary" on:click={() => (state = 'add')}>
					Add medication
				</button>
			</div>
		</div>
	{:else}
		<div
			in:fly={{ x: -100, delay: 259, duration: 250 }}
			out:fly={{ x: -100, duration: 250 }}
			class="space-y-2"
		>
			<div class="grid w-full grid-cols-[1fr_auto]">
				<span class="text-xl my-auto"> Add Medication </span>
				<button class="btn text-surface-500-400-token" on:click={() => (state = 'list')}>
					&times;
				</button>
			</div>
			<form
				on:submit|preventDefault={handleAddMedication}
				class="space-y-2 flex flex-col"
				on:change={() => (errorFields = [])}
				bind:this={formEl}
			>
				<label for="medication-name">
					<span>Medication Name</span>
					<MedicationDropdown selected={undefined} name="medication-name" options={$medications} />
				</label>
				<label for="quantity">
					<span>Quantity</span>
					<div
						class="input-group grid grid-cols-[1fr_auto] pr-2"
						class:input-error={errorFields.includes('quantity')}
					>
						<input
							type="number"
							inputmode="numeric"
							class="!appearance-none !m-0"
							name="quantity"
							placeholder="Enter Quantity..."
						/>
						<span class="my-auto">g</span>
					</div>
				</label>
				<div class="h-full" />
				<button type="submit" class="btn variant-filled-primary">Add</button>
			</form>
		</div>
	{/if}
</div>
