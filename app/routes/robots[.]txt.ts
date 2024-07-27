import type { LoaderFunction } from "@remix-run/node";
import { getDomainUrl } from "~/utils/helpers/domain-url";

// A robots.txt file provides guidelines to web robots (like search engine crawlers)
// about which parts of your website they should or should not process or scan.
export const loader: LoaderFunction = ({ request }) => {
  const url = getDomainUrl(request);

  const robotText = `User-agent: Googlebot
Disallow: /nogooglebot/

User-agent: *
Allow: /

Sitemap: ${url}/sitemap.xml
`;

  return new Response(robotText.trim(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
