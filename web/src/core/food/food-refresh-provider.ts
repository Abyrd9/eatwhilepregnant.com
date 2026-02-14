import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
	type FoodRecord,
	type FoodSafety,
	foodRecordSchema,
} from "../../schema/food-schema";
import { normalizeFoodName, toFoodSlug } from "./food-normalization";

const aiFoodResponseSchema = foodRecordSchema.omit({
	slug: true,
	expiresAt: true,
});

const defaultSummaryBySafety: Record<FoodSafety, string> = {
	safe: "Generally considered safe for most pregnancies when prepared hygienically.",
	caution:
		"Can be safe in moderation depending on preparation, trimester, and medical history.",
	avoid: "Generally recommended to avoid in pregnancy due to elevated risk.",
};

/**
 * Generates a safe fallback record when no AI provider is configured.
 */
const createFallbackFoodRecord = (
	foodName: string,
	foodTtlSeconds: number,
): FoodRecord => {
	const normalizedFoodName = normalizeFoodName(foodName);
	const reviewedDate = new Date();
	const expiresDate = new Date(reviewedDate.getTime() + foodTtlSeconds * 1000);

	return {
		slug: toFoodSlug(normalizedFoodName),
		name: normalizedFoodName,
		pregnancySafety: "caution",
		summary: defaultSummaryBySafety.caution,
		details:
			"This entry was generated without an external medical reference provider. Talk with your OB-GYN or midwife before making diet changes.",
		source: "fallback-local",
		reviewedAt: reviewedDate.toISOString(),
		expiresAt: expiresDate.toISOString(),
	};
};

/**
 * Converts model output to the persisted food record shape.
 */
const toFoodRecordFromModel = (
	foodName: string,
	foodTtlSeconds: number,
	modelOutput: Omit<FoodRecord, "slug" | "expiresAt">,
): FoodRecord => {
	const normalizedFoodName = normalizeFoodName(foodName);
	const reviewedDate = new Date(modelOutput.reviewedAt);
	const expiresDate = new Date(reviewedDate.getTime() + foodTtlSeconds * 1000);

	return {
		...modelOutput,
		slug: toFoodSlug(normalizedFoodName),
		name: normalizedFoodName,
		expiresAt: expiresDate.toISOString(),
	};
};

const aiSystemPrompt =
	"You generate concise food safety guidance for pregnancy. Return only strict JSON.";

const aiUserPrompt = (foodName: string): string => {
	return `Food: ${foodName}\n\nReturn JSON with fields: name, pregnancySafety (safe|caution|avoid), summary, details, source, reviewedAt (ISO datetime).`;
};

const getOpenAiFoodRecord = async (
	foodName: string,
	foodTtlSeconds: number,
	openAiApiKey: string,
): Promise<FoodRecord> => {
	const modelName = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
	const openAiProvider = createOpenAI({ apiKey: openAiApiKey });
	const { object: modelOutput } = await generateObject({
		model: openAiProvider(modelName),
		schema: aiFoodResponseSchema,
		schemaName: "pregnancy_food_guidance",
		schemaDescription:
			"Structured pregnancy food safety guidance with concise summary and details.",
		system: aiSystemPrompt,
		prompt: aiUserPrompt(foodName),
		temperature: 0,
	});

	return toFoodRecordFromModel(foodName, foodTtlSeconds, modelOutput);
};

/**
 * Fetches or synthesizes the latest food guidance.
 */
export const refreshFoodRecord = async (
	foodName: string,
	foodTtlSeconds: number,
): Promise<FoodRecord> => {
	const openAiApiKey = process.env.OPENAI_API_KEY;

	if (!openAiApiKey) {
		return createFallbackFoodRecord(foodName, foodTtlSeconds);
	}

	try {
		return await getOpenAiFoodRecord(foodName, foodTtlSeconds, openAiApiKey);
	} catch {
		return createFallbackFoodRecord(foodName, foodTtlSeconds);
	}
};
