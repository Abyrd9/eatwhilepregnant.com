import { describe, expect, test } from "bun:test";
import { isCanonicalFoodSlug, toFoodSlug } from "./food-normalization";

describe("isCanonicalFoodSlug", () => {
	test("accepts slugs generated from searchable food names", () => {
		expect(isCanonicalFoodSlug(toFoodSlug("Deli Meat"))).toBe(true);
	});

	test("rejects empty slug segments", () => {
		expect(isCanonicalFoodSlug("can-i-eat--while-pregnant")).toBe(false);
		expect(isCanonicalFoodSlug(toFoodSlug("!!!"))).toBe(false);
	});
});
