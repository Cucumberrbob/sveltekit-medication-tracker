// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
import type { KVNamespace } from '@cloudflare/workers-types';
declare global {
	namespace App {
		// interface PageData {}
		// interface Error {}
		interface Locals {
			idToken?: IdToken;
		}
		interface Platform {
			env: {
				USER_MEDICATIONS: KVNamespace;
				USER_DOSES: KVNamespace;
			};
		}
	}
}

// copy and pasted from auth0; most of these fields are undefined
export type IdToken = {
	iss: string;
	sub: string;
	aud: string;
	exp: number;
	iat: number;
	name?: string;
	given_name?: string;
	family_name?: string;
	gender?: string;
	birthdate?: string;
	email?: string;
	email_verified?: boolean;
	picture?: string;
	nickname?: string;
	updated_at?: string;
};

type Quantity = {
	value: number;
	unit: string;
};
type Medication = {
	name: string;
	quantityRemaining: Quantity;
	initialQuantity: Quantity;
};
type Dose = {
	//since we use localStorage, it will be read back as a string sometimes
	dateTime: Date | string;
	quantity: Quantity;
	medicationName: string;
};
/** [medicationName, quantity.value in grams, unix time] */
type ServerDose = [string, number, number];
