import type { LoaderFunction } from "@remix-run/node";
import { getDomainUrl } from "~/utils/helpers/domain-url";

// A sitemap.xml file tells search engine crawlers which URLs the crawler can access on your site.
export const loader: LoaderFunction = async ({ request }) => {
  const url = getDomainUrl(request);

  let content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  content += `
  <url>
    <loc>${url}/whatever-location</loc>
    <lastmod>1992-01-16</lastmod>
    <priority>1.0</priority>
  </url>`;

  // We can also use the database to generate the sitemap, this is an example
  // const searches = await db.query.documents.findMany();
  // if (searches) {
  //   searches.forEach((search) => {
  //     content += `
  //     <url>
  //       <loc>${url}/${search.search}</loc>
  //       <lastmod>${search.created_at.toISOString().split('T')[0]}</lastmod>
  //       <priority>1.0</priority>
  //     </url>`;
  //   });
  // }

  content += "</urlset>";

  return new Response(content, {
    headers: {
      "Content-Type": "application/xml",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
