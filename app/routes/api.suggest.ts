import { ActionFunction, json } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { getRateLimiter } from "~/utils/helpers/rate-limiter.server";
import { getSupabaseClient } from "~/utils/helpers/supabase.server";
import { Database } from "~/utils/types/supabase";

export type SuggestLoaderData = {
  documents: Database["public"]["Tables"]["documents"]["Row"][];
};

export const action: ActionFunction = async ({ request }) => {
  const ip_address = getClientIPAddress(request);
  if (ip_address) {
    const limiter = getRateLimiter(100, "5 m");
    const res = await limiter.limit(ip_address);
    if (!res.success) {
      return json<SuggestLoaderData>(
        {
          documents: [],
        },
        {
          status: 500,
          statusText: "Rate limit exceeded.",
        }
      );
    }
  } else console.error("No IP address found.");

  const url = new URL(request.url);
  const query = url.searchParams.get("query") as string;

  const { client } = getSupabaseClient(request);
  if (query?.length > 0) {
    const { data: documents, error } = await client
      .rpc("match_documents", {
        query: query + ":*",
        match_count: 10,
      })
      .select("*");

    if (!documents || error) {
      console.error(error ? error : "No documents found");
      return json<SuggestLoaderData>(
        {
          documents: [],
        },
        { status: 500 }
      );
    }

    return json<SuggestLoaderData>(
      {
        documents,
      },
      { status: 200 }
    );
  }

  return json<SuggestLoaderData>({ documents: [] }, { status: 200 });
};
