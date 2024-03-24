import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { FiAlertTriangle, FiCheckCircle, FiXOctagon } from "react-icons/fi";
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
      <div className="w-full pb-8">
        {document.is_safe && (
          <div
            className={cx(
              "p-2 font-medium rounded-md tracking-wide uppercase flex items-center space-x-2 w-full border",
              {
                "text-yellow-500 bg-yellow-50 border-yellow-200":
                  document.is_safe === "yellow",
                "text-red-500 bg-red-50 border-red-200":
                  document.is_safe === "red",
                "text-green-500 bg-green-50 border-green-200":
                  document.is_safe === "green",
              }
            )}
          >
            <span>
              {document.is_safe === "green" ? (
                <FiCheckCircle className="text-lg" />
              ) : document.is_safe === "red" ? (
                <FiXOctagon className="text-lg" />
              ) : document.is_safe === "yellow" ? (
                <FiAlertTriangle className="text-lg" />
              ) : null}
            </span>
            <span className="text-base">
              {document.is_safe === "green"
                ? "safe to eat"
                : document.is_safe === "red"
                  ? "do not eat"
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
