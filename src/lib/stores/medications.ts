import { localStorageStore } from "@skeletonlabs/skeleton";
import type { Medication } from "../../app";

export const medications = localStorageStore<Medication[]>("medications", [])