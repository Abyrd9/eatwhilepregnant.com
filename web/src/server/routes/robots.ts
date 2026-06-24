import { getRequestOrigin } from "../get-request-origin";

/**
 * Returns robots.txt for crawler directives.
 */
export const handleRobots = (request: Request): Response => {
	const origin = getRequestOrigin(request);

	const robotsText = [
		"User-agent: *",
		"Allow: /",
		"Disallow: /admin",
		"Disallow: /api/",
		`Sitemap: ${origin}/sitemap.xml`,
	].join("\n");

	return new Response(robotsText, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=0, s-maxage=3600",
		},
	});
};
