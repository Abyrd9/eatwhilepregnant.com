import { createCookieSessionStorage } from "@remix-run/node";
import { env } from "~/env";

type RetrieveDocumentsSession = {
  shouldRetrieveDocuments: boolean;
};

export const retrieveDocumentsCookieSessionStorage =
  createCookieSessionStorage<RetrieveDocumentsSession>({
    cookie: {
      name: "eatwhilepregnant-retrieve-documents",
      sameSite: "lax",
      path: "/",
      httpOnly: false,
      secrets: [env.GENERIC_SESSION_SECRET],
      secure: process.env.NODE_ENV === "production",
    },
  });

export const {
  getSession: getRetrieveDocumentsSession,
  commitSession: commitRetrieveDocumentsSession,
  destroySession: destroyRetrieveDocumentsSession,
} = retrieveDocumentsCookieSessionStorage;
