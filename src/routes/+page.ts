import { doses } from '$lib/stores/doses';
import { localStorageOptIn } from '$lib/stores/localStorageOptIn';
import { medications } from '$lib/stores/medications';
import { trpc } from '$lib/trpc/client';
import { writable } from 'svelte/store';
import type { Dose, Medication } from '../app';
import type { PageLoad } from './$types';
export const load: PageLoad = async ({ parent, fetch, url }) => {
	const { idToken } = await parent();
	if (idToken?.sub) {
		localStorageOptIn.set(false);
		const trpcClient = trpc({ fetch, url });
		const [meds, doses] = await Promise.all([
			trpcClient.medications.query(),
			trpcClient.doses.query()
		]);
		return { medications: writable(meds), doses: writable(doses) };
	} else if (localStorageOptIn) {
		return { medications, doses };
	} else {
		return { medications: writable<Medication[]>([]), doses: writable<Dose[]>([]) };
	}
};
