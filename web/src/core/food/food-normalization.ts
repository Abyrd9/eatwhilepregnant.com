/**
 * Normalizes user text so lookups stay consistent across Redis keys.
 */
export const normalizeFoodName = (foodName: string): string => {
	return foodName.trim().toLowerCase().replace(/\s+/g, " ");
};

/**
 * Builds the canonical route slug used by both API and frontend links.
 */
export const toFoodSlug = (foodName: string): string => {
	const normalizedFoodName = normalizeFoodName(foodName);
	const slugSegment = normalizedFoodName
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

	return `can-i-eat-${slugSegment}-while-pregnant`;
};

/**
 * Extracts the food name from a canonical slug.
 */
export const fromFoodSlug = (foodSlug: string): string => {
	const strippedFoodSlug = foodSlug
		.replace(/^can-i-eat-/, "")
		.replace(/-while-pregnant$/, "")
		.replace(/-/g, " ");

	return normalizeFoodName(strippedFoodSlug);
};
