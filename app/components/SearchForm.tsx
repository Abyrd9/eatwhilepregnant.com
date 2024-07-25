import { useFetcher } from "@remix-run/react";
import { z } from "zod";
import { cx } from "~/utils/helpers/client/cx";
import { ActionData } from "~/utils/types/generics";
import { SearchFormCombobox } from "./SearchForm.Combobox";
import { InferSelectModel } from "drizzle-orm";
import { documents } from "~/drizzle/schema";
import { createId } from "@paralleldrive/cuid2";
import { useRef } from "react";
import { useZodForm } from "~/lib/zod-form";

export type SearchFormSchemaType = z.infer<typeof SearchFormSchema>;
export const SearchFormSchema = z.object({
  search: z
    .string({ required_error: "Search value is required." })
    .min(1)
    .max(200),
});

export const SEARCH_FORM_INTENT = "SEARCH_FORM_INTENT";

export type SearchFormActionData = ActionData<
  typeof SEARCH_FORM_INTENT,
  typeof SearchFormSchema
>;

type SearchFormProps = {
  className?: string;
  documents: InferSelectModel<typeof documents>[];
};

export const SearchForm = ({ className }: SearchFormProps) => {
  // This component has a key for the search param to make sure it re-renders on navigation change
  // We use a generated ID to make sure the fetcher resets on navigation change
  const fetcherId = useRef(createId());
  const fetcher = useFetcher<SearchFormActionData>({ key: fetcherId.current });
  const data = fetcher.data;

  const { fields } = useZodForm({
    schema: SearchFormSchema,
  });

  return (
    <fetcher.Form
      action="/api/search"
      method="POST"
      className={cx("w-full max-w-[400px]", className)}
    >
      <div className="w-full flex flex-col">
        <SearchFormCombobox searchFetcher={fetcher} field={fields.search} />
        {data?.status === "error" && data?.errors?.search && (
          <span className="ml-auto text-xs text-red-500 pt-2">
            {data?.errors?.search}
          </span>
        )}
      </div>
    </fetcher.Form>
  );
};
