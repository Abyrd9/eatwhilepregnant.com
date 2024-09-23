import { createCookieSessionStorage } from "@remix-run/node";
import { env } from "~/env";

export const pwaBannerSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "eatwhilepregnant-pwa-banner",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [env.GENERIC_SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const {
  getSession: getPwaBannerSession,
  commitSession: commitPwaBannerSession,
  destroySession: destroyPwaBannerSession,
} = pwaBannerSessionStorage;
