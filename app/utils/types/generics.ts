import type { z } from "zod";

export type ActionData<
  Intent,
  T extends
    | z.ZodObject<z.ZodRawShape>
    | z.ZodEffects<z.ZodObject<z.ZodRawShape>>
> =
  | {
      status: "ok";
      intent: Intent;
      payload?: T["_output"];
      errors?: never;
    }
  | {
      status: "error";
      intent: Intent;
      payload?: never;
      errors?: Partial<Record<keyof z.infer<T>, string>> & {
        form?: string;
        global?: string;
      };
    }
  | undefined;
