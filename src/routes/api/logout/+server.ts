import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	cookies.set('auth0', '', { path: '/' });
	throw redirect(303, '/');
};
