//localstorage boolean store for whether the user has opted in to localstorage

import { localStorageStore } from '@skeletonlabs/skeleton';

export const localStorageOptIn = localStorageStore<boolean>('localStorageOptIn', false);
