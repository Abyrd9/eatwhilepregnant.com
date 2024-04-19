import { useEffect, useState } from "react";
import { Dialog } from "~/primitives/dialog";
import { cx } from "~/utils/helpers/cx";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";
import { type ActionData } from "~/utils/types/generics";
import { Button } from "~/primitives/button";
import { Label } from "~/primitives/label";
import { InferSelectModel } from "drizzle-orm";
import { documents } from "~/drizzle/schema";

export type FeedbackFormSchemaType = z.infer<typeof FeedbackFormSchema>;

export const FeedbackFormSchema = z.object({
  documentId: z.string(),
  food: z.string(),
  feedback: z.string({ required_error: "Please provide feedback." }),
});

export const FEEDBACK_FORM_INTENT = "FEEDBACK_FORM_INTENT";

export type FeedbackFormActionData = ActionData<typeof FEEDBACK_FORM_INTENT>;

type FeedbackProps = {
  className?: string;
  document: InferSelectModel<typeof documents>;
};

export const Feedback = ({ document, className }: FeedbackProps) => {
  const fetcher = useFetcher();
  const data = fetcher.data as FeedbackFormActionData | undefined;

  const [open, setOpen] = useState(false);

  const [form, fields] = useForm<FeedbackFormSchemaType>({
    lastResult: data?.submission,
    defaultValue: {
      documentId: document.id,
      food: document.search,
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
  }, [data]);

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
              <fetcher.Form
                {...getFormProps(form)}
                method="POST"
                action="/api/feedback"
              >
                <input
                  {...getInputProps(fields.documentId, { type: "hidden" })}
                />
                <input {...getInputProps(fields.food, { type: "hidden" })} />

                <div className="pb-4 pt-2">
                  <Label htmlFor={fields.feedback.id}>
                    Feedback for{" "}
                    <span className="capitalize">{document.search}</span>
                  </Label>
                  <textarea
                    {...getInputProps(fields.feedback, { type: "text" })}
                    placeholder={`What's wrong with this response?`}
                    className="w-full resize-none overflow-y-scroll h-32 p-2 rounded-md border border-slate-200 focus:border-slate-300 focus:ring focus:ring-slate-200 focus:ring-opacity-50 placeholder:text-sm text-sm"
                    maxLength={1000}
                  />
                  <p className="text-sm text-red-400">
                    {fields.feedback.errors}
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
