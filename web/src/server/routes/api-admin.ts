import { getRedisClient } from "../../core/redis-client";
import { handleRefreshFood } from "./api-food";

type FeedbackRecord = {
	foodSlug: string;
	foodName: string;
	feedback: string;
	createdAt: string;
};

/**
 * Returns true when the request carries the configured admin API key.
 */
const hasValidAdminKey = (request: Request): boolean => {
	const adminApiKey = process.env.ADMIN_API_KEY?.trim();

	if (!adminApiKey) {
		return false;
	}

	const requestKey =
		request.headers.get("x-admin-key")?.trim() ??
		request.headers
			.get("authorization")
			?.replace(/^Bearer\s+/i, "")
			.trim() ??
		"";

	return requestKey.length > 0 && requestKey === adminApiKey;
};

/**
 * Returns 401 for unauthorized admin requests.
 */
export const requireAdminKey = (request: Request): Response | null => {
	if (hasValidAdminKey(request)) {
		return null;
	}

	return Response.json(
		{ status: "error", message: "Unauthorized admin request." },
		{ status: 401 },
	);
};

/**
 * Lists food slugs that currently have feedback entries.
 */
export const handleAdminFeedbackIndex = async (): Promise<Response> => {
	const redisClient = getRedisClient();
	const foodSlugs = await redisClient.smembers("feedback:index");

	const cleanedFoodSlugs = foodSlugs.sort();

	return Response.json({
		status: "ok",
		foodSlugs: cleanedFoodSlugs,
	});
};

/**
 * Returns feedback entries for one slug.
 */
export const handleAdminFeedbackBySlug = async (
	foodSlug: string,
): Promise<Response> => {
	if (!foodSlug) {
		return Response.json(
			{ status: "error", message: "foodSlug query is required." },
			{ status: 400 },
		);
	}

	const redisClient = getRedisClient();
	const feedbackKey = `feedback:${foodSlug}`;
	const rawFeedbackItems = await redisClient.lrange(feedbackKey, 0, 99);

	const feedbackItems: FeedbackRecord[] = [];

	for (const rawFeedbackItem of rawFeedbackItems) {
		try {
			feedbackItems.push(JSON.parse(rawFeedbackItem) as FeedbackRecord);
		} catch {}
	}

	return Response.json({
		status: "ok",
		foodSlug,
		feedbackItems,
	});
};

/**
 * Forces a food refresh for admin update workflows.
 */
export const handleAdminRefreshFood = async (
	foodSlug: string,
): Promise<Response> => {
	return handleRefreshFood(foodSlug);
};
