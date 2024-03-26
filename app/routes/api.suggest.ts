import { ActionFunction, json } from "@remix-run/node";
import { getOpenAi } from "~/utils/helpers/openai.server";
import { getSupabaseClient } from "~/utils/helpers/supabase.server";
import { Database } from "~/utils/types/supabase";

export type SuggestLoaderData = {
  documents: Database["public"]["Tables"]["documents"]["Row"][];
};

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") as string;

  const { client } = getSupabaseClient(request);
  if (query?.length > 0) {
    const openai = await getOpenAi();
    const result = await openai.embeddings.create({
      input: query,
      model: "text-embedding-3-small",
    });

    const [{ embedding }] = result.data;

    const { data: documents, error } = await client
      .rpc("match_documents", {
        // @ts-expect-error - The embedding is correct
        query_embedding: embedding,
        match_threshold: 0.45,
        match_count: 10,
      })
      .select("*");

    console.log(documents?.length);

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
