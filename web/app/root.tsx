import {
  type ClientLoaderFunction,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
} from "@remix-run/react";
import "./tailwind.css";
import "@fontsource-variable/rubik/wght.css";
import "@fontsource-variable/rubik/wght-italic.css";
import type { LoaderFunction } from "@remix-run/node";
import type { InferSelectModel } from "drizzle-orm";
import { desc } from "drizzle-orm";
import ky from "ky";
import localforage from "localforage";
import { type documents, versions } from "~/database/schema";
import { db } from "./database/db.server";
import {
  commitRetrieveDocumentsSession,
  getRetrieveDocumentsSession,
} from "./utils/cookies/retrieve-documents-cookie.server";
import { getDomainUrl } from "./utils/helpers/domain-url";

type Version = InferSelectModel<typeof versions>;
type Document = InferSelectModel<typeof documents>;

export type RootLoaderData = {
  version?: Version | null;
  documents?: Document[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookie = request.headers.get("Cookie");
  const session = await getRetrieveDocumentsSession(cookie);
  const shouldRetrieveDocuments = session.get("shouldRetrieveDocuments");

  if (shouldRetrieveDocuments) {
    const version = await db.query.versions.findFirst({
      orderBy: desc(versions.id),
    });

    session.set("shouldRetrieveDocuments", false);
    return json<RootLoaderData>(
      { version },
      {
        headers: {
          "Set-Cookie": await commitRetrieveDocumentsSession(session),
        },
      }
    );
  }

  const [version, documents] = await Promise.all([
    db.query.versions.findFirst({
      orderBy: desc(versions.id),
    }),
    db.query.documents.findMany(),
  ]);

  session.set("shouldRetrieveDocuments", false);
  return json<RootLoaderData>(
    { version, documents },
    {
      headers: {
        "Set-Cookie": await commitRetrieveDocumentsSession(session),
      },
    }
  );
};

let documentsFromForage: Document[] = [];
(async () => {
  if (typeof window === "undefined") return;
  const documents = await localforage.getItem<Document[]>("documents");
  if (documents) documentsFromForage = documents;
})();

export const clientLoader: ClientLoaderFunction = async ({
  request,
  serverLoader,
}) => {
  const { version, documents } = await serverLoader<RootLoaderData>();

  if (documents && documents.length > 0) {
    await localforage.setItem("documents", documents).catch(() => null);
    await localforage.setItem("version", version).catch(() => null);

    return json<RootLoaderData>({ version, documents });
  }

  const [localCachedVersion] = await Promise.all([
    localforage
      .getItem<Version>("version")
      .then((version) => version ?? null)
      .catch(() => null),
    localforage
      .getItem<Document[]>("documents")
      .then((documents) => documents ?? [])
      .catch(() => []),
  ]);

  if (!localCachedVersion || !version || localCachedVersion.id !== version.id) {
    const response = await ky.get(`${getDomainUrl(request)}/api/documents`);
    const { documents = [] } = (await response.json()) as {
      documents: Document[];
    };

    await localforage.setItem("documents", documents).catch(() => null);
    await localforage.setItem("version", version).catch(() => null);

    return json<RootLoaderData>({ version, documents });
  }

  return json<RootLoaderData>({
    version: localCachedVersion,
    documents: documentsFromForage,
  });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
