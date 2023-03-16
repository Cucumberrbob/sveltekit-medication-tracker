import { dev } from '$app/environment';
import { AUTH0_CLIENT_SECRET, JWT_PRIVATE_KEY } from '$env/static/private';
import { PUBLIC_AUTH0_CLIENT_ID, PUBLIC_AUTH0_DOMAIN } from '$env/static/public';
import type { SignInToken } from 'auth0';
import { redirect } from '@sveltejs/kit';
import jsonwebtoken from '@tsndr/cloudflare-worker-jwt';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	if (!code) throw redirect(301, url.origin + '/login');
	let loginRes: SignInToken;

	try {
		const body = new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: PUBLIC_AUTH0_CLIENT_ID,
			client_secret: AUTH0_CLIENT_SECRET,
			code,
			redirect_uri: `${url.origin}/api/login`
		});
		const loginResponse = await fetch(`https://${PUBLIC_AUTH0_DOMAIN}/oauth/token`, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body
		});
		loginRes = await loginResponse.json<SignInToken>();
	} catch (e) {
		console.log(e);
		throw redirect(302, url.origin + '');
	}

	const idToken = jsonwebtoken.decode(loginRes.id_token).payload;
	const signedCookie = await jsonwebtoken.sign(
		{
			accessToken: loginRes.access_token,
			idToken: { ...idToken },
			exp: loginRes.expires_in
		},
		JWT_PRIVATE_KEY
	);
	cookies.set('auth0', signedCookie, {
		path: '/',
		domain: url.hostname,
		sameSite: 'lax',
		secure: !dev && url.hostname !== 'http://localhost',
		// expires: new Date(+new Date() + 24 * 60 * 60 * 1000),
		maxAge: 24 * 60 * 60
	});
	throw redirect(303, '/');
};
