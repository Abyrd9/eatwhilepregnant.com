import { type ActionFunction, json } from "@remix-run/node";
import { getRateLimiter } from "cache/rate-limiter.server";
import { type InferSelectModel, like } from "drizzle-orm";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { db } from "~/database/db.server";
import { documents } from "~/database/schema";

export type SuggestLoaderData = {
  documents: InferSelectModel<typeof documents>[];
};

export const action: ActionFunction = async ({ request }) => {
  const ip_address = getClientIPAddress(request);
  if (ip_address) {
    const limiter = getRateLimiter("suggest", 100, 60 * 5);
    await limiter.consume(ip_address).catch(() => {
      return json<SuggestLoaderData>(
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

  const url = new URL(request.url);
  const query = url.searchParams.get("query") as string;

  if (query?.length > 0) {
    const suggestedDocumentsToShow: SuggestLoaderData["documents"] = await db
      .select()
      .from(documents)
      .where(like(documents.search, `%${query}%`))
      .limit(10);

    if (!suggestedDocumentsToShow) {
      console.error("No documents found");
      return json<SuggestLoaderData>(
        {
          documents: [],
        },
        { status: 500 }
      );
    }

    return json<SuggestLoaderData>(
      {
        documents: suggestedDocumentsToShow,
      },
      { status: 200 }
    );
  }

  return json<SuggestLoaderData>({ documents: [] }, { status: 200 });
};
