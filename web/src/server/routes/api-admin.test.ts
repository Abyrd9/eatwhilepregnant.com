import { beforeEach, describe, expect, mock, test } from "bun:test";

let foodSlugs: string[] = [];
let feedbackCounts = new Map<string, number>();
let feedbackItemsByKey = new Map<string, string[]>();
let removedFoodSlugs: string[] = [];

mock.module("../../core/redis-client", () => ({
	getRedisClient: () => ({
		smembers: async () => foodSlugs,
		llen: async (key: string) => feedbackCounts.get(key) ?? 0,
		lrange: async (key: string) => feedbackItemsByKey.get(key) ?? [],
		srem: async (_key: string, foodSlug: string) => {
			removedFoodSlugs.push(foodSlug);
			return 1;
		},
	}),
}));

const { handleAdminFeedbackBySlug, handleAdminFeedbackIndex } = await import(
	"./api-admin"
);

describe("handleAdminFeedbackIndex", () => {
	beforeEach(() => {
		foodSlugs = [];
		feedbackCounts = new Map();
		feedbackItemsByKey = new Map();
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

describe("handleAdminFeedbackBySlug", () => {
	beforeEach(() => {
		feedbackItemsByKey = new Map();
	});

	test("skips malformed stored feedback rows", async () => {
		feedbackItemsByKey = new Map([
			[
				"feedback:apple",
				[
					JSON.stringify({
						foodSlug: "apple",
						foodName: "apple",
						feedback: "helpful",
						createdAt: "2026-06-20T12:00:00.000Z",
					}),
					"{not-json}",
					JSON.stringify({
						foodSlug: "apple",
						foodName: "apple",
						feedback: "missing timestamp",
					}),
				],
			],
		]);

		const response = await handleAdminFeedbackBySlug("apple");

		expect(await response.json()).toEqual({
			status: "ok",
			foodSlug: "apple",
			feedbackItems: [
				{
					foodSlug: "apple",
					foodName: "apple",
					feedback: "helpful",
					createdAt: "2026-06-20T12:00:00.000Z",
				},
			],
		});
	});
});
