import { consumeMedicine } from '$lib/models/consumeMedicine';
import type { Context } from '$lib/trpc/context';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';
import type { Dose, IdToken, Medication, Quantity } from '../../app';
export const t = initTRPC.context<Context>().create({ transformer: superjson });

export const loggedInProcedure = t.procedure.use(
	t.middleware(async ({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({ code: 'UNAUTHORIZED' });
		}
		return next({ ctx: ctx as Context & { user: IdToken } });
	})
);

function validateQuantity(quantity: unknown): quantity is Quantity {
	return (
		typeof quantity === 'object' &&
		!!quantity &&
		'value' in quantity &&
		typeof quantity.value === 'number' &&
		'unit' in quantity &&
		typeof quantity.unit === 'string'
	);
}

function validateMedication(meds: unknown): meds is Medication[] {
	return (
		Array.isArray(meds) &&
		meds.every((med) => {
			return (
				typeof med === 'object' &&
				!!med &&
				'name' in med &&
				typeof med.name === 'string' &&
				'initialQuantity' in med &&
				validateQuantity(med.initialQuantity) &&
				'quantityRemaining' in med &&
				validateQuantity(med.quantityRemaining)
			);
		})
	);
}

function parseDoseData(doses: unknown): Dose[] {
	if (!Array.isArray(doses)) {
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
	}
	const result: Dose[] = [];
	for (const dose of doses) {
		if (!Array.isArray(dose)) {
			throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
		}
		if (dose.length < 3) {
			throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
		}
		const [medicationName, quantity, dateTime] = dose;
		if (
			typeof medicationName !== 'string' ||
			typeof quantity !== 'number' ||
			typeof dateTime !== 'number'
		) {
			throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
		}
		result.push({
			medicationName,
			quantity: { value: quantity, unit: 'g' },
			dateTime: new Date(dateTime)
		});
	}
	return result;
}

async function getDoses(sub: string, platform?: App.Platform) {
	if (!platform) {
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'KV bindings not found' });
	}
	const dosesRaw = await platform.env.USER_DOSES.get(sub);
	if (!dosesRaw) {
		return [];
	}
	return parseDoseData(JSON.parse(dosesRaw));
}
async function putDoses(sub: string, doses: Dose[], platform?: App.Platform) {
	if (!platform) {
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'KV bindings not found' });
	}
	await platform.env.USER_DOSES.put(
		sub,
		JSON.stringify(doses.map((d) => [d.medicationName, d.quantity.value, +d.dateTime]))
	);
}

async function getMedications(sub: string, platform?: App.Platform) {
	if (!platform) {
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'KV bindings not found' });
	}
	const medsRaw = await platform.env.USER_MEDICATIONS.get(sub);
	if (!medsRaw) {
		return [];
	}
	const meds = JSON.parse(medsRaw);
	if (!validateMedication(meds)) {
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
	}
	return meds;
}
async function putMedications(sub: string, meds: Medication[], platform?: App.Platform) {
	if (!platform) {
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'KV bindings not found' });
	}
	await platform.env.USER_MEDICATIONS.put(sub, JSON.stringify(meds));
}

export const router = t.router({
	medications: loggedInProcedure.query(async ({ ctx }): Promise<Medication[]> => {
		return await getMedications(ctx.user.sub, ctx.platform);
	}),
	addMedication: loggedInProcedure
		.input(
			z.object({
				name: z.string(),
				quantity: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const parsedInput: Medication = {
				name: input.name,
				initialQuantity: { value: input.quantity, unit: 'g' },
				quantityRemaining: { value: input.quantity, unit: 'g' }
			};
			const meds = await getMedications(ctx.user.sub, ctx.platform);
			meds.push(parsedInput);
			await putMedications(ctx.user.sub, meds, ctx.platform);
		}),
	doses: loggedInProcedure.query(async ({ ctx }): Promise<Dose[]> => {
		return await getDoses(ctx.user.sub, ctx.platform);
	}),
	addDose: loggedInProcedure
		.input(
			z.object({
				dateTime: z.date(),
				quantity: z.object({ value: z.number(), unit: z.string() }),
				medicationName: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const meds = consumeMedicine(await getMedications(ctx.user.sub, ctx.platform), input);
			await putMedications(ctx.user.sub, meds, ctx.platform);

			const doses = await getDoses(ctx.user.sub, ctx.platform);
			doses.push(input);
			await putDoses(ctx.user.sub, doses, ctx.platform);
		}),
	deleteAllData: loggedInProcedure.mutation(async ({ ctx }) => {
		await Promise.all([
			ctx.platform?.env.USER_DOSES.delete(ctx.user.sub),
			ctx.platform?.env.USER_MEDICATIONS.delete(ctx.user.sub)
		]);
	})
});

export type Router = typeof router;
