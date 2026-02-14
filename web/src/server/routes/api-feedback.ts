import { getRedisClient } from "../../core/redis-client";
import { parseFeedbackPayload } from "./api-food";

/**
 * Persists user feedback in Redis for lightweight review workflows.
 */
export const handleFeedback = async (request: Request): Promise<Response> => {
	const parsedFeedbackPayload = await parseFeedbackPayload(request);

	if (!parsedFeedbackPayload.success) {
		return parsedFeedbackPayload.response;
	}

	const redisClient = getRedisClient();
	const feedbackRecord = {
		...parsedFeedbackPayload.data,
		createdAt: new Date().toISOString(),
	};

	const feedbackKey = `feedback:${parsedFeedbackPayload.data.foodSlug}`;
	await redisClient.lpush(feedbackKey, JSON.stringify(feedbackRecord));
	await redisClient.ltrim(feedbackKey, 0, 249);
	await redisClient.expire(feedbackKey, 60 * 60 * 24 * 90);
	await redisClient.sadd("feedback:index", parsedFeedbackPayload.data.foodSlug);

	return Response.json({ status: "ok" });
};
