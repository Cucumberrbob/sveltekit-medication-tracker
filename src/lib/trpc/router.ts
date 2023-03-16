import type { Context } from '$lib/trpc/context';
import { initTRPC, TRPCError } from '@trpc/server';
import type { Dose, IdToken, Medication, Quantity } from '../../app';
import { z } from 'zod';
import { consumeMedicine } from '$lib/models/consumeMedicine';
import superjson from 'superjson';
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
function safeParseDoseDate(doses: unknown): Dose[] | null {
	const result: Dose[] = [];
	if (!Array.isArray(doses)) {
		return null;
	}
	for (const dose of doses) {
		if (!(typeof dose === 'object' && dose)) return null;

		if (!('dateTime' in dose && typeof dose.dateTime === 'string')) return null;
		const parsedDate = new Date(dose.dateTime);
		if (isNaN(parsedDate.getTime())) return null;

		if (!('quantity' in dose && validateQuantity(dose.quantity))) return null;
		if (!('medicationName' in dose && typeof dose.medicationName === 'string')) return null;
		result.push({
			medicationName: dose.medicationName,
			quantity: dose.quantity,
			dateTime: parsedDate
		});
	}
	return result;
}

export const router = t.router({
	medications: loggedInProcedure.query(async ({ ctx }): Promise<Medication[]> => {
		const result = await ctx.platform?.env.USER_MEDICATIONS.get(ctx.user.sub);
		if (result) {
			const meds = JSON.parse(result);
			if (validateMedication(meds)) {
				return meds;
			} else {
				throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
			}
		}
		return [];
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
			const meds = await ctx.platform?.env.USER_MEDICATIONS.get(ctx.user.sub);
			if (meds) {
				const medsArray = JSON.parse(meds);
				if (!validateMedication(medsArray)) {
					throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
				}
				medsArray.push(parsedInput);
				await ctx.platform?.env.USER_MEDICATIONS.put(ctx.user.sub, JSON.stringify(medsArray));
			} else {
				await ctx.platform?.env.USER_MEDICATIONS.put(ctx.user.sub, JSON.stringify([parsedInput]));
			}
		}),
	doses: loggedInProcedure.query(async ({ ctx }): Promise<Dose[]> => {
		const doses = await ctx.platform?.env.USER_DOSES.get(ctx.user.sub);
		if (doses) {
			const dosesRaw = JSON.parse(doses);
			if (!dosesRaw) {
				return [];
			}
			const dosesArray = safeParseDoseDate(dosesRaw);
			if (dosesArray) {
				return dosesArray;
			} else {
				throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
			}
		}
		return [];
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
			const meds = await ctx.platform?.env.USER_MEDICATIONS.get(ctx.user.sub);
			if (meds) {
				let medsArray = JSON.parse(meds);
				if (!validateMedication(medsArray)) {
					throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
				}
				medsArray = consumeMedicine(medsArray, input);
				await ctx.platform?.env.USER_MEDICATIONS.put(ctx.user.sub, JSON.stringify(medsArray));

				const dosesRaw = await ctx.platform?.env.USER_DOSES.get(ctx.user.sub);
				const doses = safeParseDoseDate(JSON.parse(dosesRaw || '[]')) || [];

				if (doses) {
					doses.push(input);
					await ctx.platform?.env.USER_DOSES.put(ctx.user.sub, JSON.stringify(doses));
				} else {
					throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
				}
			}
		})
});

export type Router = typeof router;
