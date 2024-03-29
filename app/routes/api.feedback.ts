import { parseWithZod } from "@conform-to/zod";
import { ActionFunction, json } from "@remix-run/node";
import {
  FEEDBACK_FORM_INTENT,
  FeedbackFormActionData,
  FeedbackFormSchema,
} from "~/components/Feedback";
import { getSupabaseClient } from "~/utils/helpers/supabase.server";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.clone().formData();
  const intent = form.get("intent");

  switch (intent) {
    case FEEDBACK_FORM_INTENT: {
      const data = parseWithZod(form, { schema: FeedbackFormSchema });

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

      const { client } = await getSupabaseClient(request);

      try {
        const { error } = await client.from("feedback").insert({
          document_id: data.value.documentId,
          food: data.value.food,
          feedback: data.value.feedback,
        });

        if (error) {
          console.error(error);
        }

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
