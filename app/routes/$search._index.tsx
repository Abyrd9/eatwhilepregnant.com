import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { cx } from "~/utils/helpers/cx";
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

  return json<LoaderData>({ document });
};

export default function Index() {
  const { document } = useLoaderData<LoaderData>();

  return (
    <>
      <div className="w-full max-w-[300px] h-px bg-gray-200 my-6" />

      <div className="w-full">
        {document.is_safe && (
          <div
            className={cx(
              "px-2 py-1 rounded-md w-fit font-semibold text-sm uppercase flex items-center space-x-1.5",
              {
                "text-yellow-500 bg-yellow-100": document.is_safe === "yellow",
                "text-red-500 bg-red-100": document.is_safe === "red",
                "text-green-500 bg-green-100": document.is_safe === "green",
              }
            )}
          >
            <div
              className={cx("w-3 h-3  rounded-full", {
                "bg-yellow-500": document.is_safe === "yellow",
                "bg-red-500": document.is_safe === "red",
                "bg-green-500": document.is_safe === "green",
              })}
            />
            <span className="translate-y-px">
              {document.is_safe === "green"
                ? "safe to eat"
                : document.is_safe === "red"
                  ? "unsafe to eat"
                  : document.is_safe === "yellow"
                    ? "proceed with caution"
                    : null}
            </span>
          </div>
        )}

        <h2 className="font-semibold text-xl text-zinc-700 pt-2 capitalize">
          {document.search}
        </h2>
        <p className="font-lg text-base text-zinc-600">{document.content}</p>
      </div>
    </>
  );
}
