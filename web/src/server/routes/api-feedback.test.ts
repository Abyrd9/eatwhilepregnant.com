import { beforeEach, describe, expect, mock, test } from "bun:test";

let storedFeedbackRows: string[] = [];
let indexedFoodSlugs: string[] = [];

mock.module("../../core/redis-client", () => ({
	getRedisClient: () => ({
		lpush: async (_key: string, value: string) => {
			storedFeedbackRows.push(value);
			return 1;
		},
		ltrim: async () => 1,
		expire: async () => 1,
		sadd: async (_key: string, foodSlug: string) => {
			indexedFoodSlugs.push(foodSlug);
			return 1;
		},
	}),
}));

const { handleFeedback } = await import("./api-feedback");

describe("handleFeedback", () => {
	beforeEach(() => {
		storedFeedbackRows = [];
		indexedFoodSlugs = [];
	});

	test("rejects non-canonical food slugs before storing feedback", async () => {
		const request = new Request("https://eatwhilepregnant.com/api/feedback", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				foodSlug: "apple",
				foodName: "apple",
				feedback: "helpful",
			}),
		});

		const response = await handleFeedback(request);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			status: "error",
			message: "Invalid food slug.",
		});
		expect(storedFeedbackRows).toEqual([]);
		expect(indexedFoodSlugs).toEqual([]);
	});

	test("rejects feedback when foodName does not match foodSlug", async () => {
		const request = new Request("https://eatwhilepregnant.com/api/feedback", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				foodSlug: "can-i-eat-apple-while-pregnant",
				foodName: "banana",
				feedback: "helpful",
			}),
		});

		const response = await handleFeedback(request);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			status: "error",
			message: "foodName must match foodSlug.",
		});
		expect(storedFeedbackRows).toEqual([]);
		expect(indexedFoodSlugs).toEqual([]);
	});
});
