import { type ActionFunction, json } from "@remix-run/node";
import { getRateLimiter } from "cache/rate-limiter.server";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import {
  FEEDBACK_FORM_INTENT,
  type FeedbackFormActionData,
  FeedbackFormSchema,
} from "~/components/Feedback";
import { db } from "~/database/db.server";
import { feedback } from "~/database/schema";
import { parseZodFormData } from "~/lib/zod-form/parse-zod-form-data";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.clone().formData();
  const intent = form.get("intent");

  switch (intent) {
    case FEEDBACK_FORM_INTENT: {
      const parsed = parseZodFormData(form, {
        schema: FeedbackFormSchema,
      });

      const ip_address = getClientIPAddress(request);
      if (ip_address) {
        const limiter = getRateLimiter("feedback", 5, 60 * 60);
        await limiter.consume(ip_address).catch(() => {
          return json<FeedbackFormActionData>(
            {
              status: "error",
              intent: FEEDBACK_FORM_INTENT,
              errors: {
                global: "You have exceeded the rate limit for this action.",
              },
            },
            {
              status: 429,
              statusText: "Rate limit exceeded.",
            }
          );
        });
      } else console.error("No IP address found.");

      if (!parsed.success) {
        return json<FeedbackFormActionData>(
          {
            status: "error",
            intent: FEEDBACK_FORM_INTENT,
            errors: parsed.errors,
          },
          { status: 500 }
        );
      }

      try {
        await db.insert(feedback).values({
          document_id: parsed.data.documentId,
          food: parsed.data.food,
          feedback: parsed.data.feedback,
        });

        return json<FeedbackFormActionData>(
          {
            status: "ok",
            intent: FEEDBACK_FORM_INTENT,
            payload: parsed.data,
          },
          { status: 200 }
        );
      } catch (error) {
        console.error(error);
        return json<FeedbackFormActionData>(
          {
            status: "error",
            intent: FEEDBACK_FORM_INTENT,
            errors: {
              feedback: "There was an error submitting your feedback.",
            },
          },
          { status: 500 }
        );
      }
    }
    default:
      console.error(`Unknown intent: ${intent}`);
      break;
  }
};
