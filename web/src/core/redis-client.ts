import { redis } from "bun";

/**
 * Returns the shared Bun Redis client configured by REDIS_URL.
 */
export const getRedisClient = () => {
	return redis;
};
