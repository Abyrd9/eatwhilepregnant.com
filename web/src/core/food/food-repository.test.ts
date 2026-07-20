import { beforeEach, describe, expect, mock, test } from "bun:test";

let redisStringValues = new Map<string, string | null>();
let redisSetValues = new Map<string, string[]>();
let redisSaddCalls: Array<{ key: string; values: string[] }> = [];

mock.module("../redis-client", () => ({
	getRedisClient: () => ({
		del: async () => 1,
		expire: async () => 1,
		get: async (key: string) => redisStringValues.get(key) ?? null,
		sadd: async (key: string, ...values: string[]) => {
			redisSaddCalls.push({ key, values });
			return values.length;
		},
		smembers: async (key: string) => redisSetValues.get(key) ?? [],
		srem: async () => 1,
	}),
}));

const { searchFoods } = await import("./food-repository");

describe("searchFoods", () => {
	beforeEach(() => {
		redisStringValues = new Map();
		redisSetValues = new Map();
		redisSaddCalls = [];
	});

	test("does not cache fallback substring matches in the prefix index", async () => {
		const foodSlug = "can-i-eat-greek-yogurt-while-pregnant";

		redisSetValues = new Map([
			["foods:prefix:urt", []],
			["foods:index", [foodSlug]],
		]);
		redisStringValues = new Map([
			[
				`food:${foodSlug}`,
				JSON.stringify({
					slug: foodSlug,
					name: "Greek Yogurt",
					pregnancySafety: "safe",
					summary: "Safe.",
					details: "Pasteurized yogurt is generally safe in pregnancy.",
					source: "Manual review",
					reviewedAt: "2026-07-01T00:00:00.000Z",
					expiresAt: "2026-08-01T00:00:00.000Z",
				}),
			],
		]);

		const foodRecords = await searchFoods("urt");

		expect(foodRecords).toHaveLength(1);
		expect(foodRecords[0]?.slug).toBe(foodSlug);
		expect(redisSaddCalls).toEqual([]);
	});
});
