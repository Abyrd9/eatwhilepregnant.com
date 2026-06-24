import { getFoodBySlug, listFoodSlugs } from "../../core/food/food-repository";
import { getRequestOrigin } from "../get-request-origin";

/**
 * Escapes XML entities for sitemap values.
 */
const escapeXml = (value: string): string => {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
};

/**
 * Returns sitemap.xml with all indexed food pages.
 */
export const handleSitemap = async (request: Request): Promise<Response> => {
	const origin = getRequestOrigin(request);
	const indexedFoodSlugs = await listFoodSlugs();

	let sitemapContent =
		'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

	sitemapContent += `\n  <url>\n    <loc>${origin}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`;

	for (const foodSlug of indexedFoodSlugs) {
		const foodRecord = await getFoodBySlug(foodSlug);

		if (!foodRecord) {
			continue;
		}

		const foodUrl = `${origin}/${escapeXml(foodSlug)}`;
		const reviewedDate = new Date(foodRecord.reviewedAt)
			.toISOString()
			.split("T")[0];

		sitemapContent += `\n  <url>\n    <loc>${foodUrl}</loc>\n    <lastmod>${reviewedDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
	}

	sitemapContent += "\n</urlset>";

	return new Response(sitemapContent, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=0, s-maxage=3600",
		},
	});
};
