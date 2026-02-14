import type { FoodRecord } from "../../schema/food-schema";
import {
	fromFoodSlug,
	normalizeFoodName,
	toFoodSlug,
} from "./food-normalization";
import { refreshFoodRecord } from "./food-refresh-provider";
import {
	getFoodByName,
	getFoodBySlug,
	saveFood,
	searchFoods,
} from "./food-repository";

const defaultFoodTtlSeconds = 60 * 60 * 24 * 30;

/**
 * Returns the configured food TTL in seconds.
 */
export const getFoodTtlSeconds = (): number => {
	const configuredFoodTtlSeconds = Number(process.env.FOOD_TTL_SECONDS);

	if (
		!Number.isFinite(configuredFoodTtlSeconds) ||
		configuredFoodTtlSeconds <= 0
	) {
		return defaultFoodTtlSeconds;
	}

	return Math.floor(configuredFoodTtlSeconds);
};

/**
 * Returns a cached food if available, otherwise refreshes and stores it.
 */
export const getOrRefreshFoodByName = async (
	foodName: string,
): Promise<FoodRecord> => {
	const normalizedFoodName = normalizeFoodName(foodName);
	const existingFoodRecord = await getFoodByName(normalizedFoodName);

	if (existingFoodRecord) {
		return existingFoodRecord;
	}

	const foodTtlSeconds = getFoodTtlSeconds();
	const refreshedFoodRecord = await refreshFoodRecord(
		normalizedFoodName,
		foodTtlSeconds,
	);
	await saveFood(refreshedFoodRecord, foodTtlSeconds);

	return refreshedFoodRecord;
};

/**
 * Forces a food refresh by slug and persists the latest value.
 */
export const refreshFoodBySlug = async (
	foodSlug: string,
): Promise<FoodRecord> => {
	const foodTtlSeconds = getFoodTtlSeconds();
	const foodName = fromFoodSlug(foodSlug);
	const refreshedFoodRecord = await refreshFoodRecord(foodName, foodTtlSeconds);
	await saveFood(refreshedFoodRecord, foodTtlSeconds);

	return refreshedFoodRecord;
};

/**
 * Gets a food by slug without performing a refresh.
 */
export const getFoodOnlyBySlug = async (
	foodSlug: string,
): Promise<FoodRecord | null> => {
	return getFoodBySlug(foodSlug);
};

/**
 * Searches existing indexed foods only.
 */
export const suggestFoods = async (
	searchTerm: string,
	limit = 10,
): Promise<FoodRecord[]> => {
	return searchFoods(searchTerm, limit);
};

/**
 * Returns whether a slug is the canonical route shape.
 */
export const isCanonicalFoodSlug = (foodSlug: string): boolean => {
	return /^can-i-eat-[a-z0-9-]+-while-pregnant$/.test(foodSlug);
};

/**
 * Converts free text search to canonical slug.
 */
export const toCanonicalFoodSlug = (searchTerm: string): string => {
	return toFoodSlug(searchTerm);
};
