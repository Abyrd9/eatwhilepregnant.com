import { type LoaderFunction } from "@remix-run/node";
import { getSupabaseClient } from "~/utils/helpers/supabase.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { client } = getSupabaseClient(request);

  let content = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const { data: searches } = await client.from("documents").select("*");
  if (searches) {
    searches.forEach((search) => {
      content += `
      <url>
        <loc>https://www.eatwhilepregnant.com/${search.search}</loc>
        <lastmod>${search.updated_at}</lastmod>
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
