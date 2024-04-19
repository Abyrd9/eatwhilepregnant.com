import { type LoaderFunction } from "@remix-run/node";
import { db } from "~/drizzle/driver.server";

export const loader: LoaderFunction = async () => {
  let content = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const searches = await db.query.documents.findMany();
  if (searches) {
    searches.forEach((search) => {
      content += `
      <url>
        <loc>https://www.eatwhilepregnant.com/${search.search}</loc>
        <lastmod>${search.created_at}</lastmod>
        <priority>1.0</priority>
      </url>`;
    });
  }

  content += `</urlset>`;

  return new Response(content, {
    headers: {
      "content-type": "application/xml",
      "xml-version": "1.0",
      encoding: "UTF-8",
    },
  });
};
