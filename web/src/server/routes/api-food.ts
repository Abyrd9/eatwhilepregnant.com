import {
	getFoodOnlyBySlug,
	isCanonicalFoodSlug,
	refreshFoodBySlug,
} from "../../core/food/food-service";
import {
	feedbackInputSchema,
	foodRefreshInputSchema,
} from "../../schema/food-schema";

/**
 * Returns a single food record by slug.
 */
export const handleGetFood = async (foodSlug: string): Promise<Response> => {
	const readCacheHeaders = {
		"Cache-Control": "public, max-age=0, s-maxage=300",
	};

	if (!isCanonicalFoodSlug(foodSlug)) {
		return Response.json(
			{ status: "error", message: "Invalid food slug." },
			{ status: 400, headers: readCacheHeaders },
		);
	}

	const foodRecord = await getFoodOnlyBySlug(foodSlug);

	if (!foodRecord) {
		return Response.json(
			{ status: "error", message: "Food was not found in cache." },
			{ status: 404, headers: readCacheHeaders },
		);
	}

	return Response.json(
		{ status: "ok", food: foodRecord },
		{ headers: readCacheHeaders },
	);
};

/**
 * Forces a refresh for a food slug.
 */
export const handleRefreshFood = async (
	foodSlug: string,
): Promise<Response> => {
	if (!isCanonicalFoodSlug(foodSlug)) {
		return Response.json(
			{ status: "error", message: "Invalid food slug." },
			{ status: 400 },
		);
	}

	const refreshedFoodRecord = await refreshFoodBySlug(foodSlug);
	return Response.json({ status: "ok", food: refreshedFoodRecord });
};

/**
 * Accepts manual refresh requests using free-text food names.
 */
export const handleRefreshFoodByName = async (
	request: Request,
): Promise<Response> => {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return Response.json(
			{ status: "error", message: "Invalid JSON body." },
			{ status: 400 },
		);
	}

	const parsedInput = foodRefreshInputSchema.safeParse(payload);

	if (!parsedInput.success) {
		return Response.json(
			{ status: "error", message: "Invalid refresh payload." },
			{ status: 400 },
		);
	}

	const foodSlug = parsedInput.data.foodName
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");

	return handleRefreshFood(`can-i-eat-${foodSlug}-while-pregnant`);
};

/**
 * Validates feedback payload for downstream storage.
 */
export const parseFeedbackPayload = async (
	request: Request,
): Promise<
	| {
			success: true;
			data: { foodSlug: string; foodName: string; feedback: string };
	  }
	| { success: false; response: Response }
> => {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return {
			success: false,
			response: Response.json(
				{ status: "error", message: "Invalid JSON body." },
				{ status: 400 },
			),
		};
	}

	const parsedInput = feedbackInputSchema.safeParse(payload);

	if (!parsedInput.success) {
		return {
			success: false,
			response: Response.json(
				{ status: "error", message: "Invalid feedback payload." },
				{ status: 400 },
			),
		};
	}

	return { success: true, data: parsedInput.data };
};
