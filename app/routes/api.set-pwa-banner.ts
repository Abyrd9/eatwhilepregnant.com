import { parseWithZod } from "@conform-to/zod";
import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import {
  commitPwaBannerSession,
  getPwaBannerSession,
} from "~/utils/cookies/pwa-banner-cookie.server";
import {
  PWA_FORM_INTENT,
  PwaBannerFormSchema,
} from "~/utils/helpers/client/pwa";

export const loader: LoaderFunction = () => json({}, { status: 404 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const intent = form.get("intent");

  switch (intent) {
    case PWA_FORM_INTENT: {
      const submission = parseWithZod(form, { schema: PwaBannerFormSchema });
      if (submission.status !== "success") {
        console.error("Invalid PWA banner status:", submission.error);
        return json({}, { status: 400 });
      }

      const cookie = request.headers.get("Cookie");
      const session = await getPwaBannerSession(cookie);
      session.set("status", submission.value.status);

      return json(
        {},
        {
          status: 200,
          headers: {
            "Set-Cookie": await commitPwaBannerSession(session, {
              maxAge: 1728000, // 20 days
            }),
          },
        }
      );
    }
    default:
      console.error("No intent found:", intent);
      break;
  }
};
