import type { FoodRecord } from "../../schema/food-schema";
import { foodRecordSchema } from "../../schema/food-schema";
import { getRedisClient } from "../redis-client";
import { normalizeFoodName, toFoodSlug } from "./food-normalization";

const foodIndexKey = "foods:index";
const foodKeyPrefix = "food:";
const foodPrefixKeyPrefix = "foods:prefix:";
const foodSlugPrefixesKeyPrefix = "food-prefixes:";
const minSuggestionPrefixLength = 2;

/**
 * Returns the full Redis key for a prefix lookup set.
 */
const toFoodPrefixKey = (foodPrefix: string): string => {
	return `${foodPrefixKeyPrefix}${foodPrefix}`;
};

/**
 * Returns the key that tracks which prefixes are attached to a food slug.
 */
const toFoodSlugPrefixesKey = (foodSlug: string): string => {
	return `${foodSlugPrefixesKeyPrefix}${foodSlug}`;
};

/**
 * Removes a food slug from every tracked suggestion prefix set.
 */
const removeFoodFromSuggestionIndex = async (
	foodSlug: string,
): Promise<void> => {
	const redisClient = getRedisClient();
	const foodSlugPrefixesKey = toFoodSlugPrefixesKey(foodSlug);
	const existingSuggestionPrefixes =
		await redisClient.smembers(foodSlugPrefixesKey);

	for (const existingSuggestionPrefix of existingSuggestionPrefixes) {
		await redisClient.srem(toFoodPrefixKey(existingSuggestionPrefix), foodSlug);
	}

	await redisClient.del(foodSlugPrefixesKey);
};

/**
 * Returns the full Redis key for a food slug.
 */
const toFoodKey = (foodSlug: string): string => {
	return `${foodKeyPrefix}${foodSlug}`;
};

/**
 * Builds all prefix keys used for suggestion lookup.
 */
const toSuggestionPrefixes = (foodName: string): string[] => {
	const normalizedFoodName = normalizeFoodName(foodName);

	if (!normalizedFoodName) {
		return [];
	}

	const suggestionPrefixSet = new Set<string>();

	for (
		let prefixLength = minSuggestionPrefixLength;
		prefixLength <= normalizedFoodName.length;
		prefixLength += 1
	) {
		suggestionPrefixSet.add(normalizedFoodName.slice(0, prefixLength));
	}

	const normalizedFoodWords = normalizedFoodName.split(" ").filter(Boolean);

	for (const normalizedFoodWord of normalizedFoodWords) {
		for (
			let prefixLength = minSuggestionPrefixLength;
			prefixLength <= normalizedFoodWord.length;
			prefixLength += 1
		) {
			suggestionPrefixSet.add(normalizedFoodWord.slice(0, prefixLength));
		}
	}

	return [...suggestionPrefixSet];
};

/**
 * Loads and validates a food record by slug.
 */
export const getFoodBySlug = async (
	foodSlug: string,
): Promise<FoodRecord | null> => {
	const redisClient = getRedisClient();
	const foodValue = await redisClient.get(toFoodKey(foodSlug));

	if (!foodValue) {
		return null;
	}

	try {
		const parsedFood = JSON.parse(foodValue);
		return foodRecordSchema.parse(parsedFood);
	} catch {
		await redisClient.del(toFoodKey(foodSlug));
		await redisClient.srem(foodIndexKey, foodSlug);
		await removeFoodFromSuggestionIndex(foodSlug);
		return null;
	}
};

/**
 * Resolves a food record by its normalized food name.
 */
export const getFoodByName = async (
	foodName: string,
): Promise<FoodRecord | null> => {
	const foodSlug = toFoodSlug(foodName);
	return getFoodBySlug(foodSlug);
};

/**
 * Stores a food record with TTL and keeps the search index in sync.
 */
export const saveFood = async (
	foodRecord: FoodRecord,
	foodTtlSeconds: number,
): Promise<void> => {
	const redisClient = getRedisClient();
	const foodSlugPrefixesKey = toFoodSlugPrefixesKey(foodRecord.slug);
	const existingSuggestionPrefixes =
		await redisClient.smembers(foodSlugPrefixesKey);

	for (const existingSuggestionPrefix of existingSuggestionPrefixes) {
		await redisClient.srem(
			toFoodPrefixKey(existingSuggestionPrefix),
			foodRecord.slug,
		);
	}

	await redisClient.set(toFoodKey(foodRecord.slug), JSON.stringify(foodRecord));
	await redisClient.expire(toFoodKey(foodRecord.slug), foodTtlSeconds);
	await redisClient.sadd(foodIndexKey, foodRecord.slug);

	const suggestionPrefixes = toSuggestionPrefixes(foodRecord.name);

	for (const suggestionPrefix of suggestionPrefixes) {
		await redisClient.sadd(toFoodPrefixKey(suggestionPrefix), foodRecord.slug);
	}

	await redisClient.del(foodSlugPrefixesKey);

	if (suggestionPrefixes.length > 0) {
		await redisClient.sadd(foodSlugPrefixesKey, ...suggestionPrefixes);
		await redisClient.expire(foodSlugPrefixesKey, foodTtlSeconds);
	}
};

/**
 * Searches indexed foods by normalized name and strips stale entries.
 */
export const searchFoods = async (
	searchTerm: string,
	limit = 10,
): Promise<FoodRecord[]> => {
	const redisClient = getRedisClient();
	const normalizedSearchTerm = normalizeFoodName(searchTerm);

	if (normalizedSearchTerm.length < minSuggestionPrefixLength) {
		return [];
	}

	const prefixKey = toFoodPrefixKey(normalizedSearchTerm);
	let indexedSlugs = await redisClient.smembers(prefixKey);
	const usedGlobalIndexFallback = indexedSlugs.length === 0;

	if (usedGlobalIndexFallback) {
		indexedSlugs = await redisClient.smembers(foodIndexKey);
	}

	const foodRecords: FoodRecord[] = [];
	const matchedFoodSlugs: string[] = [];

	for (const foodSlug of indexedSlugs) {
		const foodRecord = await getFoodBySlug(foodSlug);

		if (!foodRecord) {
			await redisClient.srem(foodIndexKey, foodSlug);
			await redisClient.srem(prefixKey, foodSlug);
			await removeFoodFromSuggestionIndex(foodSlug);
			continue;
		}

		if (normalizeFoodName(foodRecord.name).includes(normalizedSearchTerm)) {
			foodRecords.push(foodRecord);
			matchedFoodSlugs.push(foodSlug);
		}
	}

	if (!usedGlobalIndexFallback && matchedFoodSlugs.length > 0) {
		await redisClient.sadd(prefixKey, ...matchedFoodSlugs);
	}

	return foodRecords
		.sort((aFoodRecord, bFoodRecord) =>
			aFoodRecord.name.localeCompare(bFoodRecord.name),
		)
		.slice(0, limit);
};

/**
 * Returns all indexed food slugs.
 */
export const listFoodSlugs = async (): Promise<string[]> => {
	const redisClient = getRedisClient();
	const foodSlugs = await redisClient.smembers(foodIndexKey);

	return foodSlugs.sort((aFoodSlug, bFoodSlug) =>
		aFoodSlug.localeCompare(bFoodSlug),
	);
};
