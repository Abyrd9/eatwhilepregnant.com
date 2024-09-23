import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  json,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "@remix-run/react";
import { type InferSelectModel, eq } from "drizzle-orm";
import { Disclaimer } from "~/components/Disclaimer";
import { Feedback } from "~/components/Feedback";
import { Footer } from "~/components/Footer";
import { ImageHeadings } from "~/components/ImageHeadings";
import { Result } from "~/components/Result";
import { SearchForm } from "~/components/SearchForm";
import { db } from "~/database/db.server";
import { documents } from "~/database/schema";
import type { RootLoaderData } from "~/root";

type Document = InferSelectModel<typeof documents>;

type LoaderData = {
  document: Document;
};

export const loader: LoaderFunction = async ({ params }) => {
  if (!params?.search) {
    console.error("No search value provided.");
    throw new Response("Bad Request", { status: 400 });
  }

  const search = params?.search.toLowerCase();

  try {
    let document = await db.query.documents.findFirst({
      where: eq(documents.search, search),
    });

    if (!document) {
      document = await db.query.documents.findFirst({
        where: eq(documents.search, search),
      });
    }

    if (!document) {
      console.error("No column found.");
      throw new Response("Not Found", { status: 404 });
    }

    return json<LoaderData>(
      { document },
      {
        headers: {
          "CDN-Cache-Control": "max-age=31536000, s-maxage=31536000",
          "Cloudflare-CDN-Cache-Control": "max-age=31536000, s-maxage=31536000",
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
    { title: `${document.search} | eatwhilepregnant.com` },
    {
      name: "description",
      content: `Is it okay for a pregnant woman to eat ${document.search}?`,
    },
  ];
};

export default function Index() {
  const { document } = useLoaderData<LoaderData>();
  const { documents } = useRouteLoaderData("root") as RootLoaderData;

  const params = useParams();

  return (
    <div className="h-dvh w-dvw flex flex-col items-center sm:pt-[10dvh] p-4 pt-8">
      <ImageHeadings className="pb-10" />
      <div className="max-w-[500px] w-full flex flex-col items-center relative">
        <SearchForm
          key={params.search}
          className="pb-0"
          documents={documents}
        />

        <div className="w-full max-w-[300px] h-px bg-gray-200 my-5" />

        <Result className="pb-4" document={document} />
        <Feedback className="pb-8" document={document} />
        <Disclaimer />
      </div>

      <div className="mt-auto pt-8">
        <Footer />
      </div>
    </div>
  );
}
