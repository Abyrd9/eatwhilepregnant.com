import { beforeEach, describe, expect, mock, test } from "bun:test";

let foodSlugs: string[] = [];
let feedbackCounts = new Map<string, number>();
let removedFoodSlugs: string[] = [];

mock.module("../../core/redis-client", () => ({
	getRedisClient: () => ({
		smembers: async () => foodSlugs,
		llen: async (key: string) => feedbackCounts.get(key) ?? 0,
		srem: async (_key: string, foodSlug: string) => {
			removedFoodSlugs.push(foodSlug);
			return 1;
		},
	}),
}));

const { handleAdminFeedbackIndex } = await import("./api-admin");

describe("handleAdminFeedbackIndex", () => {
	beforeEach(() => {
		foodSlugs = [];
		feedbackCounts = new Map();
		removedFoodSlugs = [];
	});

	test("removes expired food slugs from the feedback index", async () => {
		foodSlugs = ["banana", "apple", "carrot"];
		feedbackCounts = new Map([
			["feedback:banana", 0],
			["feedback:apple", 2],
			["feedback:carrot", 1],
		]);

		const response = await handleAdminFeedbackIndex();

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			status: "ok",
			foodSlugs: ["apple", "carrot"],
		});
		expect(removedFoodSlugs).toEqual(["banana"]);
	});

	test("keeps active food slugs sorted without removing them", async () => {
		foodSlugs = ["carrot", "apple"];
		feedbackCounts = new Map([
			["feedback:carrot", 1],
			["feedback:apple", 3],
		]);

		const response = await handleAdminFeedbackIndex();

		expect(await response.json()).toEqual({
			status: "ok",
			foodSlugs: ["apple", "carrot"],
		});
		expect(removedFoodSlugs).toEqual([]);
	});
});
