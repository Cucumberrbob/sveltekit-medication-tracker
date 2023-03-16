<script lang="ts">
	import { localStorageOptIn } from '$lib/stores/localStorageOptIn';
	import { trpc } from '$lib/trpc/client';
	import { modalStore } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	export let data: PageData;
	async function download() {
		const trpcClient = trpc();
		const [medications, doses] = await Promise.all([
			trpcClient.medications.query(),
			trpcClient.doses.query()
		]);
		downloadTextFile(JSON.stringify(medications), 'medications.json');
		await new Promise((resolve) => setTimeout(resolve, 250));
		downloadTextFile(JSON.stringify(doses), 'doses.json');
		await new Promise((resolve) => setTimeout(resolve, 250));
		downloadTextFile(JSON.stringify(data.idToken), 'idToken.json');
	}
	function downloadTextFile(text: string, name: string) {
		const a = document.createElement('a');
		const type = name.split('.').pop();
		a.href = URL.createObjectURL(
			new Blob([text], { type: `text/${type === 'txt' ? 'plain' : type}` })
		);
		a.download = name;
		a.click();
	}

	async function deleteAllData() {
		modalStore.trigger({
			type: 'confirm',
			title: 'Delete all data?',
			buttonTextConfirm: 'Delete',
			body: 'Are you sure you want to delete all your data? This cannot be undone. Currently this will not delete your user on Auth0',
			async response(s) {
				if (!s) return;
				const trpcClient = trpc();
				await trpcClient.deleteAllData.mutate();
			}
		});
	}
</script>

<div class="w-full flex flex-col items-center">
	<div class="card p-4 space-y-4 shadow-2xl sm:!max-w-full">
		<h1 class="">Privacy Policy</h1>

		<div class=" prose text-inherit ">
			<div class="key-points">
				<span class="font-bold">Key Points:</span>
				<ul class="mt-2">
					<li>We don't process your data in cloud mode, only store it</li>
					<li>Your data never leaves your device in local mode</li>
					<li>You can request all your data, and/or for all your data to be deleted</li>
					<li>
						We are only legally obligated to do this for personally identifiable information (only
						your email)
					</li>
				</ul>
			</div>
			<p>
				Under GDPR, you have a variety of rights about your personal data. You can request all the
				personal data an organisation holds on you, request deletion, reasonable amendments, and
				withdraw consent for data processing at any time.
			</p>
			<p>All of this is irrelevant if you use local mode. The data will never leave your device.</p>

			<p>
				We promise to never process your data without your explicit, informed consent. The app
				currently does not have functionality to process any data, but we may add the option in the
				future. We will never sell your data to third parties.
			</p>
			<div class="flex w-full max-sm:flex-col max-sm:space-y-4 justify-between">
				{#if data.idToken}
					<button class="btn variant-ghost-error" on:click={deleteAllData}>
						Delete all your data
					</button>
				{/if}
				{#if data.idToken || $localStorageOptIn}
					<button class="btn variant-filled-primary" on:click={download}>
						Download all your data
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
