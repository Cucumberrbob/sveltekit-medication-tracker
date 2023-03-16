import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Dose } from '../../app';

export const doses = localStorageStore<Dose[]>('doses', []);
