import { parseWithZod } from "@conform-to/zod";
import { ActionFunction, json } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import {
  FEEDBACK_FORM_INTENT,
  FeedbackFormActionData,
  FeedbackFormSchema,
} from "~/components/Feedback";
import { db } from "~/drizzle/driver.server";
import { feedback } from "~/drizzle/schema";
import { getRateLimiter } from "~/utils/helpers/server/rate-limiter.server";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.clone().formData();
  const intent = form.get("intent");

  switch (intent) {
    case FEEDBACK_FORM_INTENT: {
      const data = parseWithZod(form, { schema: FeedbackFormSchema });

      const ip_address = getClientIPAddress(request);
      if (ip_address) {
        const limiter = getRateLimiter(5, 60 * 60);
        await limiter.consume(ip_address).catch(() => {
          return json<FeedbackFormActionData>(
            {
              status: "error",
              submission: data.reply({
                fieldErrors: {
                  feedback: [
                    "You have exceeded the rate limit for this action.",
                  ],
                },
              }),
            },
            {
              status: 429,
              statusText: "Rate limit exceeded.",
            }
          );
        });
      } else console.error("No IP address found.");

      if (data.status !== "success") {
        return json<FeedbackFormActionData>(
          {
            status: "error",
            intent: FEEDBACK_FORM_INTENT,
            submission: data.reply(),
          },
          { status: 500 }
        );
      }

      try {
        await db.insert(feedback).values({
          document_id: data.value.documentId,
          food: data.value.food,
          feedback: data.value.feedback,
        });

        return json<FeedbackFormActionData>(
          {
            status: "ok",
            intent: FEEDBACK_FORM_INTENT,
            submission: data.reply(),
          },
          { status: 200 }
        );
      } catch (error) {
        console.error(error);
        return json<FeedbackFormActionData>(
          {
            status: "error",
            intent: FEEDBACK_FORM_INTENT,
            submission: data.reply({
              fieldErrors: {
                feedback: ["There was an error submitting your feedback."],
              },
            }),
          },
          { status: 500 }
        );
      }
    }
    default:
      console.error(`Unknown intent: intent`);
      break;
  }
};
