import { z } from "zod";

export const foodSafetySchema = z.enum(["safe", "caution", "avoid"]);

export const foodRecordSchema = z.object({
	slug: z.string().min(1),
	name: z.string().min(1),
	pregnancySafety: foodSafetySchema,
	summary: z.string().min(1),
	details: z.string().min(1),
	source: z.string().min(1),
	reviewedAt: z.string().datetime(),
	expiresAt: z.string().datetime(),
});

export const foodRefreshInputSchema = z.object({
	foodName: z.string().min(1).max(200),
});

export const feedbackInputSchema = z.object({
	foodSlug: z.string().min(1),
	foodName: z.string().min(1),
	feedback: z.string().min(1).max(1000),
});

export type FoodRecord = z.infer<typeof foodRecordSchema>;
export type FoodSafety = z.infer<typeof foodSafetySchema>;
export type FoodRefreshInput = z.infer<typeof foodRefreshInputSchema>;
export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
