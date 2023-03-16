import { doses } from '$lib/stores/doses';
import { localStorageOptIn } from '$lib/stores/localStorageOptIn';
import { trpc } from '$lib/trpc/client';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
export const load: PageLoad = async ({ parent, fetch, url }) => {
	const { idToken } = await parent();

	if (!idToken && get(localStorageOptIn)) {
		return { doses: get(doses) };
	}
	const trpcClient = trpc({ fetch, url });
	return {
		doses: trpcClient.doses.query()
	};
};
