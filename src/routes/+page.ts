import { localStorageOptIn } from '$lib/stores/localStorageOptIn';
import { medications } from '$lib/stores/medications';
import { doses } from '$lib/stores/doses';
import { trpc } from '$lib/trpc/client';
import { get, writable } from 'svelte/store';
import type { Dose, Medication } from '../app';
import type { PageLoad } from './$types';
export const load: PageLoad = async ({ parent, fetch, url }) => {
	if (get(localStorageOptIn)) {
		return { medications, doses };
	} else {
		if ((await parent()).idToken) {
			localStorageOptIn.set(false);
			const trpcClient = trpc({ fetch, url });
			const [meds, doses] = await Promise.all([
				trpcClient.medications.query(),
				trpcClient.doses.query()
			]);
			return { medications: writable(meds), doses: writable(doses) };
		}
		return { medications: writable<Medication[]>([]), doses: writable<Dose[]>([]) };
	}
};
