import { error, type Handle } from '@sveltejs/kit';
import jsonwebtoken from '@tsndr/cloudflare-worker-jwt';
import type { IdToken } from './app';
import { dev } from '$app/environment';
import { createTRPCHandle } from '$lib/trpc/createServerHandle';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/context';
import { sequence } from '@sveltejs/kit/hooks';
import { JWT_PRIVATE_KEY } from '$env/static/private';

import '@total-typescript/ts-reset';

export const handleAuth: Handle = async ({ event, resolve }) => {
	const cookie = event.cookies.get('auth0');
	if (cookie) {
		if (!jsonwebtoken.verify(cookie, JWT_PRIVATE_KEY)) {
			event.cookies.set('auth0', '', { path: '/' });
			throw error(403, 'jwt invalid');
		}
		event.locals.idToken = (jsonwebtoken.decode(cookie).payload as { idToken: IdToken }).idToken;
	}
	if (dev) {
		const { fallBackPlatformToMiniFlareInDev } = await import('$lib/clients/miniflare');
		event.platform = await fallBackPlatformToMiniFlareInDev(event.platform);
	}
	const response = await resolve(event);
	return response;
};

export const handleTrpc: Handle = createTRPCHandle({ router, createContext });

export const handle = sequence(handleAuth, handleTrpc);
