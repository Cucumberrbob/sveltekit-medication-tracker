<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_AUTH0_CLIENT_ID, PUBLIC_AUTH0_DOMAIN } from '$env/static/public';
	import DoseTracker from '$lib/DoseTracker.svelte';
	import Medications from '$lib/Medications.svelte';
	import { consumeMedicine } from '$lib/models/consumeMedicine';
	import { localStorageOptIn } from '$lib/stores/localStorageOptIn';
	import { medications as localMedicationsStore } from '$lib/stores/medications';
	import { trpc } from '$lib/trpc/client';
	import type { Dose } from '../app';
	import type { PageData } from './$types';

	export let data: PageData;
	let { medications, doses } = data;
	function handleDoseAdd(e: { detail: Dose }) {
		const medication = $medications.find((m) => m.name === e.detail.medicationName);
		if (!medication) {
			return;
		}
		//no idea f this will work
		$medications = consumeMedicine($medications, e.detail);

		if (data.idToken) {
			console.log('sending to server');
			trpc().addDose.mutate(e.detail);
		}
	}
	const loginURL =
		`https://${PUBLIC_AUTH0_DOMAIN}/authorize?` +
		new URLSearchParams({
			response_type: 'code',
			client_id: PUBLIC_AUTH0_CLIENT_ID,
			redirect_uri: $page.url.origin + `/api/login`,
			scope: 'openid profile offline_access email'
		});
</script>

<div class="container h-full mx-auto ">
	{#if data.idToken || $localStorageOptIn}
		<div class="flex justify-center items-center">
			<div class="grid grid-cols-2 max-md:grid-cols-1 gap-4">
				<Medications {medications} shouldUpdateServer={!!data.idToken} />
				<DoseTracker on:addDose={handleDoseAdd} {medications} />
			</div>
		</div>
	{:else}
		<div class="flex justify-center items-center">
			<div class="flex flex-col space-y-4 mt-32 lg:mx-20 xl:mx-40">
				<span class="text-xl text-center"
					>This site can work both locally, and in the cloud. If you'd rather not share your data,
					local mode will ensure your medication history never leaves your device. If you want to
					access the site from multiple devices, cloud mode will allow you to sync your data
					automatically.
				</span>
				<div class="flex justify-center space-x-4">
					<button
						on:click={() => {
							$localStorageOptIn = true;
							console.log($localStorageOptIn);
							medications = localMedicationsStore;
						}}
						class="btn variant-filled-primary">Use Local Mode</button
					>
					<a href={loginURL} class="btn variant-filled-primary">Login or sign up</a>
				</div>
			</div>
		</div>
	{/if}
</div>
