import { type SubmissionResult } from "@conform-to/react";

type Status = "ok" | "error";

export type ActionData<Intent> = {
  status: Status;
  intent?: Intent;
  submission: SubmissionResult;
};
