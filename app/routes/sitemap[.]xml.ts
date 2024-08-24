import type { LoaderFunction } from "@remix-run/node";
import { db } from "~/database/db.server";
import { getDomainUrl } from "~/utils/helpers/domain-url";

// A sitemap.xml file tells search engine crawlers which URLs the crawler can access on your site.
export const loader: LoaderFunction = async ({ request }) => {
	const url = getDomainUrl(request);

	let content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

	const documents = await db.query.documents.findMany();
	for (const document of documents) {
		if (!document.created_at) continue;

		content += `
    <url>
      <loc>${url}/${document.search}</loc>
      <lastmod>${new Date(document.created_at).toISOString().split("T")[0]}</lastmod>
      <priority>1.0</priority>
    </url>`;
	}

	content += "</urlset>";

	return new Response(content, {
		headers: {
			"Content-Type": "application/xml",
			"X-Content-Type-Options": "nosniff",
		},
	});
};
