import { type LoaderFunction, json } from "@remix-run/node";
import { getRateLimiter } from "cache/rate-limiter.server";
import type { InferSelectModel } from "drizzle-orm";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { db } from "~/database/db.server";
import type { documents } from "~/database/schema";
import { getDomainUrl } from "~/utils/helpers/domain-url";

type DocumentsLoaderData = {
  documents: InferSelectModel<typeof documents>[];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Allow requests from localhost:5173 (dev) or eatwhilepregnant.com (prod)
  const domain = getDomainUrl(request);
  const allowedOrigins = [
    "http://localhost:5173",
    "https://eatwhilepregnant.com",
    "https://www.eatwhilepregnant.com",
  ];

  if (!domain || !allowedOrigins.includes(domain)) {
    return json({ documents: [] }, { status: 403 });
  }

  const ip_address = getClientIPAddress(request);
  if (ip_address) {
    const limiter = getRateLimiter("all-documents", 5, 10);
    await limiter.consume(ip_address).catch(() => {
      return json<DocumentsLoaderData>(
        {
          documents: [],
        },
        {
          status: 429,
          statusText: "Rate limit exceeded.",
        }
      );
    });
  } else console.error("No IP address found.");

  const documents = await db.query.documents.findMany();
  return json({ documents });
};
