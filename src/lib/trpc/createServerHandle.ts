import type { Handle, RequestEvent } from '@sveltejs/kit';
import type {
    AnyRouter,
    inferRouterContext
} from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import type { ValidRoute } from './ValidRoute';

/**
 * Create a SvelteKit handle function for rRPC requests.
 *
 * If you want to use it in conjunction with other SvelteKit handles,
 * consider [the sequence helper function](https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks).
 * @see https://kit.svelte.dev/docs/hooks
 */
export function createTRPCHandle<Router extends AnyRouter, URL extends string>({
	router,
	url = '/trpc',
	createContext,
	responseMeta,
	onError
}: {
	/**
	 * The tRPC router to use.
	 * @see https://trpc.io/docs/router
	 */
	router: Router;

	/**
	 * The tRPC api endpoint URL.
	 * @default '/trpc'
	 */
	url?: ValidRoute<URL>;

	/**
	 * An async function that returns the tRPC context.
	 * @see https://trpc.io/docs/context
	 */
	createContext?: (event: RequestEvent) => Promise<inferRouterContext<Router>>;

	/**
	 * A function that returns the response meta.
	 * @see https://trpc.io/docs/caching#using-responsemeta-to-cache-responses
	 */
	responseMeta?: Parameters<
		typeof import('@trpc/server/adapters/fetch')['fetchRequestHandler']
	>[0]['responseMeta'];

	/**
	 * A function that is called when an error occurs.
	 * @see https://trpc.io/docs/error-handling#handling-errors
	 */
	onError?: Parameters<
		typeof import('@trpc/server/adapters/fetch')['fetchRequestHandler']
	>[0]['onError'];
}): Handle {
	return async ({ event, resolve }) => {
		if (event.url.pathname.startsWith(url)) {
			const request = event.request;
			return await fetchRequestHandler({
				router,
				req: request,
				createContext: async () => createContext?.(event),
				responseMeta,
				onError,
				endpoint: url
			});
		}

		return resolve(event);
	};
}
