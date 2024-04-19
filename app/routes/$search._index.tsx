import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { InferSelectModel, eq } from "drizzle-orm";
import { Feedback } from "~/components/Feedback";
import { Result } from "~/components/Result";
import { db } from "~/drizzle/driver.server";
import { documents } from "~/drizzle/schema";

type LoaderData = {
  document: InferSelectModel<typeof documents>;
};

export const loader: LoaderFunction = async ({ params }) => {
  if (!params?.search) {
    console.error("No search value provided.");
    throw new Response("Bad Request", { status: 400 });
  }

  const search = params?.search.toLowerCase();

  try {
    const document = await db.query.documents.findFirst({
      where: eq(documents.search, search),
    });

    if (!document) {
      console.error("No column found.");
      throw new Response("Not Found", { status: 404 });
    }

    return json<LoaderData>(
      { document },
      {
        headers: {
          "Cache-Control": "public, s-maxage=0, stale-while-revalidate=604800",
        },
      }
    );
  } catch (error) {
    console.error(error);
    throw new Response("Internal Server Error", { status: 500 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const document = data.document as LoaderData["document"];
  return [
    { title: document.search + " | eatwhilepregnant.com" },
    {
      name: "description",
      content: `Is it okay for a pregnant woman to eat ${document.search}?`,
    },
  ];
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
