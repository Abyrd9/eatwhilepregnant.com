import { describe, expect, test } from "bun:test";
import { getRequestOrigin } from "./get-request-origin";

describe("getRequestOrigin", () => {
	test("returns the request origin when no proxy headers are present", () => {
		const request = new Request("http://localhost:3000/robots.txt");

		expect(getRequestOrigin(request)).toBe("http://localhost:3000");
	});

	test("uses the first forwarded host and protocol values", () => {
		const request = new Request("http://internal:3000/sitemap.xml", {
			headers: {
				"x-forwarded-host": "eatwhilepregnant.com, internal:3000",
				"x-forwarded-proto": "https, http",
			},
		});

		expect(getRequestOrigin(request)).toBe("https://eatwhilepregnant.com");
	});

	test("keeps the request host when only the forwarded protocol is provided", () => {
		const request = new Request("http://localhost:3000/robots.txt", {
			headers: {
				host: "localhost:3000",
				"x-forwarded-proto": "https",
			},
		});

		expect(getRequestOrigin(request)).toBe("https://localhost:3000");
	});
});
