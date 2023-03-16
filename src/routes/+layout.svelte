<script lang="ts">
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.postcss';

	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { Modal, storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import { AppBar, AppShell, LightSwitch, popup } from '@skeletonlabs/skeleton';
	import { PUBLIC_AUTH0_DOMAIN, PUBLIC_AUTH0_CLIENT_ID } from '$env/static/public';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';
	import { localStorageOptIn } from '$lib/stores/localStorageOptIn';
	import { slide } from 'svelte/transition';

	export let data: LayoutData;

	const loginURL =
		`https://${PUBLIC_AUTH0_DOMAIN}/authorize?` +
		new URLSearchParams({
			response_type: 'code',
			client_id: PUBLIC_AUTH0_CLIENT_ID,
			redirect_uri: $page.url.origin + `/api/login`,
			scope: 'openid profile offline_access email'
		});
	const logoutURL = `https://${PUBLIC_AUTH0_DOMAIN}/v2/logout?client_id=${PUBLIC_AUTH0_CLIENT_ID}&returnTo=${$page.url.origin}/api/logout`;
</script>

<Modal buttonPositive="variant-filled-error" />
<AppShell>
	<AppBar slotLead="space-x-4 flex align-baseline">
		<svelte:fragment slot="lead">
			<a class="text-xl font-bold" href="/" data-sveltekit-preload-data>
				<span class="max-sm:hidden"> Meds Tracker </span>
				<span class="sm:hidden">🥦</span>
			</a>
			{#if data.idToken || $localStorageOptIn}
				<a href="/stats" data-sveltekit-preload-data>Stats</a>
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="trail">
			<LightSwitch />
			{#if !!data.idToken}
				<div class="relative">
					<span use:popup={{ event: 'hover-click', target: 'logout' }}
						>{data.idToken.nickname ||
							data.idToken.name ||
							data.idToken.given_name ||
							data.idToken.email?.split('@')[0]}</span
					>
					<div class="card p-4" data-popup="logout">
						<a href={logoutURL} class="btn variant-glass-error"> Logout</a>
					</div>
				</div>
			{:else}
				<a href={loginURL} class="btn btn-primary">Login</a>
			{/if}
		</svelte:fragment>
	</AppBar>
	<div class="p-4 max-md:p-2">
		<slot />
	</div>
	<svelte:fragment slot="footer">
		{#if $page.route.id !== '/privacy'}
			<div class="bg-transparent flex justify-center" transition:slide>
				<a href="/privacy" data-sveltekit-preload-data class="!text-primary-600 !text-opacity-50"
					>Privacy Policy</a
				>
			</div>
		{/if}
	</svelte:fragment>
</AppShell>
