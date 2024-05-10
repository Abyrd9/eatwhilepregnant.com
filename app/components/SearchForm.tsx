import { getFormProps, useForm } from "@conform-to/react";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";
import { cx } from "~/utils/helpers/client/cx";
import { ActionData } from "~/utils/types/generics";
import { SearchFormCombobox } from "./SearchForm.Combobox";
import { InferSelectModel } from "drizzle-orm";
import { documents } from "~/drizzle/schema";
import { createId } from "@paralleldrive/cuid2";
import { useRef } from "react";

export type SearchFormSchemaType = z.infer<typeof SearchFormSchema>;
export const SearchFormSchema = z.object({
  search: z
    .string({ required_error: "Search value is required." })
    .min(1)
    .max(200),
});

export type SearchFormActionData = ActionData<SearchFormSchemaType>;

type SearchFormProps = {
  className?: string;
  documents: InferSelectModel<typeof documents>[];
};

export const SearchForm = ({ className }: SearchFormProps) => {
  // This component has a key for the search param to make sure it re-renders on navigation change
  // We use a generated ID to make sure the fetcher resets on navigation change
  const fetcherId = useRef(createId());
  const fetcher = useFetcher<SearchFormActionData>({ key: fetcherId.current });

  const [form, fields] = useForm<SearchFormSchemaType>({
    lastResult: fetcher.data?.submission,
  });

  return (
    <fetcher.Form
      {...getFormProps(form)}
      action="/api/search"
      method="POST"
      className={cx("w-full max-w-[400px]", className)}
    >
      <div className="w-full flex flex-col">
        <SearchFormCombobox searchFetcher={fetcher} field={fields.search} />
        {fetcher.data?.submission.error?.search && (
          <span className="ml-auto text-xs text-red-500 pt-2">
            {fetcher.data?.submission.error?.search}
          </span>
        )}
      </div>
    </fetcher.Form>
  );
};
