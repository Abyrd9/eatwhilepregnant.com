import { useFetcher } from "@remix-run/react";
import type { InferSelectModel } from "drizzle-orm";
import { useEffect, useState } from "react";
import { z } from "zod";
import type { documents } from "~/database/schema";
import { useZodForm } from "~/lib/zod-form";
import { Button } from "~/primitives/button";
import { Dialog } from "~/primitives/dialog";
import { Label } from "~/primitives/label";
import { cx } from "~/utils/helpers/cx";
import type { ActionData } from "~/utils/types/generics";

export type FeedbackFormSchemaType = z.infer<typeof FeedbackFormSchema>;

export const FeedbackFormSchema = z.object({
  documentId: z.string(),
  food: z.string(),
  feedback: z.string({ required_error: "Please provide feedback." }),
});

export const FEEDBACK_FORM_INTENT = "FEEDBACK_FORM_INTENT";

export type FeedbackFormActionData = ActionData<
  typeof FEEDBACK_FORM_INTENT,
  typeof FeedbackFormSchema
>;

type FeedbackProps = {
  className?: string;
  document: InferSelectModel<typeof documents>;
};

export const Feedback = ({ document, className }: FeedbackProps) => {
  const fetcher = useFetcher();
  const data = fetcher.data as FeedbackFormActionData | undefined;

  const [open, setOpen] = useState(false);

  const { fields } = useZodForm({
    schema: FeedbackFormSchema,
    defaultValues: {
      documentId: document.id,
      food: document.search ?? undefined,
    },
  });

  const isSubmitting =
    ["submitting", "loading"].includes(fetcher.state) &&
    fetcher.formData?.get("intent") === FEEDBACK_FORM_INTENT;

  useEffect(() => {
    if (data?.status === "ok") {
      sessionStorage.setItem(`feedback-${document.id}`, "true");
      setOpen(false);
    }
  }, [data, document.id]);

  const hasGivenFeedback =
    typeof window !== "undefined" &&
    sessionStorage.getItem(`feedback-${document.id}`);

  return (
    <>
      {hasGivenFeedback ? (
        <p className={cx("text-sm text-slate-500 w-full", className)}>
          Thank you for your feedback.
        </p>
      ) : (
        <div className={cx("w-full text-sm text-slate-500", className)}>
          Concerned with this response?{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-blue-500 underline"
          >
            Let us know.
          </button>
        </div>
      )}

      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <Dialog.Portal>
          <Dialog.Overlay>
            <Dialog.Content>
              <Dialog.Title>Feedback</Dialog.Title>
              <fetcher.Form method="POST" action="/api/feedback">
                <input
                  name={fields.documentId.name}
                  value={fields.documentId.value}
                  onChange={(e) => fields.documentId.onChange(e.target.value)}
                  type="hidden"
                />
                <input
                  name={fields.food.name}
                  value={fields.food.value}
                  onChange={(e) => fields.food.onChange(e.target.value)}
                  type="hidden"
                />

                <div className="pb-4 pt-2">
                  <Label htmlFor={fields.feedback.name}>
                    Feedback for{" "}
                    <span className="capitalize">{document.search}</span>
                  </Label>
                  <textarea
                    name={fields.feedback.name}
                    value={fields.feedback.value}
                    onChange={(e) => fields.feedback.onChange(e.target.value)}
                    placeholder={`What's wrong with this response?`}
                    className="w-full resize-none overflow-y-scroll h-32 p-2 rounded-md border border-slate-200 focus:border-slate-300 focus:ring focus:ring-slate-200 focus:ring-opacity-50 placeholder:text-sm text-sm"
                    maxLength={1000}
                  />
                  <p className="text-sm text-red-400">
                    {fields.feedback.error}
                  </p>
                </div>

                <div>
                  <Button
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    type="submit"
                    name="intent"
                    value={FEEDBACK_FORM_INTENT}
                  >
                    <Button.Loader>
                      <span>Submit Feedback</span>
                    </Button.Loader>
                  </Button>
                </div>
              </fetcher.Form>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog>
    </>
  );
};
