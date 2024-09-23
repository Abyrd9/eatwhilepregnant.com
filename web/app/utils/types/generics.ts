import type { z } from "zod";
import type { NestedFieldErrors } from "~/lib/zod-form";
import type { DeepPartial } from "./deep-partial";

export type ActionData<
	Intent,
	T extends
		| z.ZodObject<z.ZodRawShape>
		| z.ZodEffects<z.ZodObject<z.ZodRawShape>>,
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
			errors?: DeepPartial<NestedFieldErrors<T>> & {
				form?: string;
				global?: string;
			};
	  }
	| undefined;
