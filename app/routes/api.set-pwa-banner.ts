import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import { parseZodFormData } from "~/lib/zod-form/parse-zod-form-data";
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
      const parsed = parseZodFormData(form, { schema: PwaBannerFormSchema });
      if (!parsed.success) {
        console.error("Invalid PWA banner status:", parsed.errors);
        return json({}, { status: 400 });
      }

      const cookie = request.headers.get("Cookie");
      const session = await getPwaBannerSession(cookie);
      session.set("status", parsed.data.status);

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
