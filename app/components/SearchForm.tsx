import {
  Combobox,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPopover,
  ComboboxProvider,
} from "@ariakit/react";
import { getFormProps, useForm, useInputControl } from "@conform-to/react";
import {
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useDebounce } from "@uidotdev/usehooks";
import { useDeferredValue, useEffect } from "react";
import { FiCornerDownLeft, FiLoader, FiSearch } from "react-icons/fi";
import { z } from "zod";
import { cx } from "~/utils/helpers/cx";
import { ActionData } from "~/utils/types/generics";
import { Database } from "~/utils/types/supabase";

export type SearchFormSchemaType = z.infer<typeof SearchFormSchema>;
export const SearchFormSchema = z.object({
  search: z
    .string({ required_error: "Search value is required." })
    .min(1)
    .max(200),
});

export type SearchFormActionData = ActionData<SearchFormSchemaType>;

type SearchFormProps = {
  documents: Database["public"]["Tables"]["documents"]["Row"][];
};

export const SearchForm = ({ documents }: SearchFormProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const data = useActionData() as SearchFormActionData;
  const [form, fields] = useForm<SearchFormSchemaType>({
    lastResult: data?.submission,
    defaultValue: {
      search: searchParams.get("search") || "",
    },
  });

  const navigation = useNavigation();
  const isSubmitting =
    ["submitting", "loading"].includes(navigation.state) &&
    Boolean(navigation.formData?.get("search"));

  const search = useInputControl(fields.search);

  const deferred = useDeferredValue(search.value);
  const debounceDeferred = useDebounce(deferred, 200);
  useEffect(() => {
    setSearchParams({ query: deferred ?? "" });
  }, [debounceDeferred, setSearchParams]);

  return (
    <Form
      {...getFormProps(form)}
      method="POST"
      className="w-full max-w-[400px]"
    >
      <div className="w-full flex flex-col">
        <ComboboxProvider
          setSelectedValue={(value) =>
            typeof value === "string" ? search.change(value) : null
          }
        >
          <ComboboxLabel
            htmlFor={fields.search.id}
            className="mb-2 block text-sm font-medium leading-none"
          >
            What can I eat?
          </ComboboxLabel>

          <div className="relative w-full items-center overflow-clip rounded-md border border-black/10 py-2 text-zinc-700 shadow-input shadow-black/[8%] ring-blue-700 ring-offset-2 after:pointer-events-none after:absolute after:-inset-y-[0.25px] after:left-0 after:h-[calc(100%_+_4px)] after:w-full after:rounded-md focus-within:border-black/10 dark:bg-stone-900 dark:shadow-black/10 dark:ring-muted-zinc-700/10 dark:after:shadow-highlight dark:after:shadow-white/[2%] [&:has(:focus-visible)]:ring-2 [&:has(input:is(:disabled))]:opacity-50 bg-white">
            <div className="absolute left-3 top-0 flex items-center justify-center h-full w-[16px]">
              <FiSearch className="text-slate-700" />
            </div>
            <Combobox
              className="block w-full bg-transparent text-sm outline-none pl-[36px] pr-[54px] leading-none"
              placeholder="Watermelon, Deli Meat, Fish, etc."
              maxLength={200}
              disabled={isSubmitting}
              value={search.value}
              onBlur={search.blur}
              onFocus={search.focus}
              onChange={(e) => {
                search.change(e.target.value);
              }}
            />
            <div
              className={cx(
                "flex items-center space-x-1 justify-end text-gray-400 absolute right-3 h-full top-0 w-[54px]",
                {
                  "opacity-0": !fields.search.value,
                  "opacity-100": fields.search.value || isSubmitting,
                }
              )}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="text-sm animate-spin" />
                </>
              ) : (
                <>
                  <span className="text-xs">Enter</span>
                  <FiCornerDownLeft className="text-xs" />
                </>
              )}
            </div>
          </div>

          <ComboboxPopover
            gutter={16}
            sameWidth
            className="bg-white rounded-sm p-2 shadow"
          >
            {documents.length === 0 && (
              <div>
                <ComboboxItem
                  value="No results found"
                  disabled
                  className="capitalize px-1.5 py-1 rounded text-sm text-gray-500 text-center"
                >
                  No results found
                </ComboboxItem>
              </div>
            )}
            {documents.map((document) => (
              <ComboboxItem
                key={document.id}
                value={document.search}
                className="capitalize data-[active-item]:bg-blue-500 data-[active-item]:text-white px-1.5 py-2 rounded hover:bg-blue-100 cursor-pointer"
              >
                {document.search}
              </ComboboxItem>
            ))}
          </ComboboxPopover>
        </ComboboxProvider>

        {data?.submission.error?.search && (
          <span className="ml-auto text-xs text-red-500 pt-2">
            {data?.submission.error?.search}
          </span>
        )}
      </div>
    </Form>
  );
};
