import {
  Combobox,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPopover,
  ComboboxProvider,
} from "@ariakit/react";
import { FiCornerDownLeft, FiLoader, FiSearch } from "react-icons/fi";
import { FieldMetadata, useInputControl } from "@conform-to/react";
import { cx } from "~/utils/helpers/cx";
import { useEffect, useState } from "react";
import { SuggestLoaderData } from "~/routes/api.suggest";
import { FetcherWithComponents, useFetcher } from "@remix-run/react";
import { SearchFormActionData } from "./SearchForm";

type SearchFormComboboxProps = {
  searchFetcher: FetcherWithComponents<SearchFormActionData>;
  field: FieldMetadata<string>;
};

export const SearchFormCombobox = ({
  searchFetcher,
  field,
}: SearchFormComboboxProps) => {
  const suggestFetcher = useFetcher<SuggestLoaderData>();

  const search = useInputControl(field);

  useEffect(() => {
    const form = new FormData();

    suggestFetcher.submit(form, {
      method: "POST",
      navigate: false,
      action: `/api/suggest?query=${search.value}`,
    });
  }, [search.value]);

  const isSubmitting =
    searchFetcher.state === "submitting" || searchFetcher.state === "loading";

  const documents = suggestFetcher.data?.documents ?? [];

  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (searchFetcher.state === "submitting") {
      setOpen(false);
    }
  }, [searchFetcher.state]);

  return (
    <ComboboxProvider
      open={documents.length > 0 && open}
      setOpen={setOpen}
      setSelectedValue={(value) => {
        if (typeof value === "string") {
          search.change(value);

          const form = new FormData();
          form.append("search", value);
          searchFetcher.submit(form, {
            method: "POST",
            navigate: true,
            action: "/api/search",
          });

          setOpen(false);
        }

        return null;
      }}
    >
      <ComboboxLabel
        htmlFor={field.id}
        className="mb-2 block text-sm font-medium leading-none text-zinc-600"
      >
        What can I eat while pregnant?
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
          onBlur={() => {
            search.blur();
            setOpen(false);
          }}
          onFocus={search.focus}
          onChange={(e) => {
            search.change(e.target.value);
          }}
        />
        <div
          className={cx(
            "flex items-center space-x-1 justify-end text-gray-400 absolute right-3 h-full top-0 w-[54px]",
            {
              "opacity-0": !field.value,
              "opacity-100": field.value || isSubmitting,
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
        className="bg-white rounded-sm p-2 shadow border border-black/10"
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
            value={document.search ?? ""}
            className="capitalize data-[active-item]:bg-blue-500 data-[active-item]:text-white px-1 py-1.5 rounded hover:bg-blue-100 cursor-pointer text-sm"
          >
            {document.search}
          </ComboboxItem>
        ))}
      </ComboboxPopover>
    </ComboboxProvider>
  );
};
