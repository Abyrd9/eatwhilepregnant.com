import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { Feedback } from "~/components/Feedback";
import { Result } from "~/components/Result";
import { getSupabaseClient } from "~/utils/helpers/supabase.server";
import { Database } from "~/utils/types/supabase";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type LoaderData = {
  document: Database["public"]["Tables"]["documents"]["Row"];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { client } = await getSupabaseClient(request);

  if (!params?.search) {
    console.error("No search value provided.");
    throw new Response("Bad Request", { status: 400 });
  }

  const search = params?.search.toLowerCase();

  const { data: document, error } = await client
    .from("documents")
    .select("*")
    .eq("search", search)
    .single();

  if (error) {
    console.error(error);
    throw new Response("Internal Server Error", { status: 500 });
  }

  if (!document) {
    console.error("No column found.");
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>(
    { document },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=86400",
      },
    }
  );
};

export default function Index() {
  const { document } = useLoaderData<LoaderData>();

  return (
    <>
      <Result className="pb-4" document={document} />
      <Feedback className="pb-8" document={document} />
    </>
  );
}
