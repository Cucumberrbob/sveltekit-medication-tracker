import { doses } from '$lib/stores/doses';
import { localStorageOptIn } from '$lib/stores/localStorageOptIn';
import { trpc } from '$lib/trpc/client';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load: PageLoad = async ({ parent, fetch, url }) => {
	const { idToken } = await parent();

	if (idToken?.sub) {
		const trpcClient = trpc({ fetch, url });
		return {
			doses: trpcClient.doses.query()
		};
	} else if (get(localStorageOptIn)) {
		return { doses: get(doses) };
	}
	throw redirect(303, '/');
};
