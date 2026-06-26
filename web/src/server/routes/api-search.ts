import { isCanonicalFoodSlug } from "../../core/food/food-normalization";
import {
	getOrRefreshFoodByName,
	suggestFoods,
	toCanonicalFoodSlug,
} from "../../core/food/food-service";

/**
 * Returns food suggestions and optionally refreshes a cache miss.
 */
export const handleSearch = async (request: Request): Promise<Response> => {
	const requestUrl = new URL(request.url);
	const searchTerm = requestUrl.searchParams.get("q")?.trim() ?? "";
	const suggestOnly = requestUrl.searchParams.get("suggestOnly") === "true";
	const minSuggestionLength = 2;

	if (!searchTerm) {
		return Response.json(
			{ status: "error", message: "Search is required." },
			{ status: 400 },
		);
	}

	const foodSlug = toCanonicalFoodSlug(searchTerm);

	if (!isCanonicalFoodSlug(foodSlug)) {
		return Response.json(
			{
				status: "error",
				message: "Search must include letters or numbers.",
			},
			{ status: 400 },
		);
	}

	if (suggestOnly && searchTerm.length < minSuggestionLength) {
		return Response.json({
			status: "ok",
			suggestions: [],
		});
	}

	const suggestions = await suggestFoods(searchTerm, 8);

	if (suggestOnly) {
		return Response.json({
			status: "ok",
			suggestions,
		});
	}

	const foodRecord = await getOrRefreshFoodByName(searchTerm);
	const responseSuggestions = suggestions.some(
		(suggestedFoodRecord) => suggestedFoodRecord.slug === foodRecord.slug,
	)
		? suggestions
		: [foodRecord, ...suggestions].slice(0, 8);

	return Response.json({
		status: "ok",
		food: foodRecord,
		slug: foodSlug,
		suggestions: responseSuggestions,
	});
};
