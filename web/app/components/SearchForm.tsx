import { Link, useFetcher, useNavigate, useParams } from "@remix-run/react";
import type { InferSelectModel } from "drizzle-orm";
import { matchSorter } from "match-sorter";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiCornerDownLeft, FiLoader, FiSearch } from "react-icons/fi";
import { z } from "zod";
import type { documents } from "~/database/schema";
import { useZodForm } from "~/lib/zod-form";
import { Label } from "~/primitives/label";
import { cx } from "~/utils/helpers/cx";
import type { ActionData } from "~/utils/types/generics";

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

type Documents = InferSelectModel<typeof documents>[];

type SearchFormProps = {
  className?: string;
  documents: Documents;
};

export const SearchForm = ({
  className,
  documents: passedInDocuments,
}: SearchFormProps) => {
  const search = useFetcher();
  const data = search.data as SearchFormActionData;
  const searchIsSubmitting =
    search.state === "loading" || search.state === "submitting";

  const navigate = useNavigate();
  const params = useParams();

  const { fields } = useZodForm({
    schema: SearchFormSchema,
    errors: data?.errors,
  });

  const documents = useMemo(() => {
    if (!passedInDocuments) return [];
    if (!fields.search.value) return [];

    const filtered = matchSorter(passedInDocuments, fields.search.value, {
      keys: ["search"],
      threshold: matchSorter.rankings.STARTS_WITH,
    }).slice(0, 10);

    return filtered;
  }, [passedInDocuments, fields.search.value]);

  const [inputIsFocused, setInputIsFocused] = useState(false);

  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    useState<number>();

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 414px)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    // Set the initial value
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Check if the new focus target is inside the suggestions div
    if (suggestionsRef.current?.contains(e.relatedTarget as Node)) {
      // If so, prevent blur by refocusing the input
      inputRef.current?.focus();
    } else {
      setInputIsFocused(false);
    }

    setSelectedSuggestionIndex(undefined);
  }, []);

  useEffect(() => {
    if (inputIsFocused && documents?.length > 0) {
      const onArrowDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowDown") {
          setSelectedSuggestionIndex((prev) => {
            let nextSelectedIndex = 0;
            if (typeof prev === "number") {
              nextSelectedIndex = prev + 1;
            }

            if (nextSelectedIndex >= documents.length) {
              nextSelectedIndex = 0;
            }

            return nextSelectedIndex;
          });
        }
      };
      const onArrowUp = (e: KeyboardEvent) => {
        if (e.key === "ArrowUp") {
          setSelectedSuggestionIndex((prev) => {
            let nextSelectedIndex = 0;
            if (typeof prev === "number") {
              nextSelectedIndex = prev - 1;
            }

            if (nextSelectedIndex < 0) {
              nextSelectedIndex = documents.length - 1;
            }

            return nextSelectedIndex;
          });
        }
      };

      window.addEventListener("keydown", onArrowDown);
      window.addEventListener("keydown", onArrowUp);
      return () => {
        window.removeEventListener("keydown", onArrowDown);
        window.removeEventListener("keydown", onArrowUp);
      };
    }
  }, [documents, inputIsFocused]);

  const showSuggestionPopover =
    inputIsFocused && !searchIsSubmitting && documents?.length > 0;

  return (
    <div className={cx("w-full max-w-[400px]", className)}>
      <div className="w-full flex flex-col">
        <div>
          <Label
            htmlFor={fields.search.name}
            className="mb-2 block text-sm font-medium leading-none text-zinc-600"
          >
            What can I eat while pregnant?
          </Label>
          <div className="relative w-full">
            <div className="relative w-full items-center overflow-clip rounded-md border border-black/10 py-2 text-zinc-700 shadow-input shadow-black/[8%] ring-blue-700 ring-offset-2 after:pointer-events-none after:absolute after:-inset-y-[0.25px] after:left-0 after:h-[calc(100%_+_4px)] after:w-full after:rounded-md focus-within:border-black/10 dark:bg-stone-900 dark:shadow-black/10 dark:ring-muted-zinc-700/10 dark:after:shadow-highlight dark:after:shadow-white/[2%] [&:has(:focus-visible)]:ring-2 [&:has(input:is(:disabled))]:opacity-50 bg-white">
              <div className="absolute left-3 top-0 flex items-center justify-center h-full w-[16px]">
                <FiSearch className="text-slate-700" />
              </div>
              <input
                ref={inputRef}
                autoComplete="off"
                onFocus={() => {
                  setInputIsFocused(true);
                  if (isMobile) {
                    setTimeout(() => {
                      inputRef.current?.scrollIntoView({
                        behavior: "instant",
                        block: "start",
                      });
                    }, 200);
                  }
                }}
                onBlur={handleBlur}
                className="block w-full bg-transparent text-sm outline-none pl-[36px] pr-[54px] leading-none"
                style={{ scrollMarginTop: "40px" }}
                placeholder="Watermelon, Deli Meat, Fish, etc."
                maxLength={200}
                name={"query"}
                disabled={searchIsSubmitting}
                value={fields.search.value}
                onChange={(e) => {
                  setSelectedSuggestionIndex(undefined);
                  fields.search.onChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = fields.search.value;
                    if (typeof selectedSuggestionIndex === "number") {
                      const doc = documents[selectedSuggestionIndex];
                      if (doc.search)
                        navigate(
                          `/can-i-eat-${doc.search
                            .toLowerCase()
                            .replace(/ /g, "-")}-while-pregnant`
                        );
                    }

                    if (params.search === value) return;

                    const form = new FormData();
                    form.set("search", value);
                    search.submit(form, {
                      action: "/api/search",
                      method: "POST",
                    });
                  }
                }}
              />

              <div
                className={cx(
                  "flex items-center space-x-1 justify-end text-gray-400 absolute right-3 h-full top-0 w-[54px]",
                  {
                    "opacity-0": !fields.search.value,
                    "opacity-100": fields.search.value,
                  }
                )}
              >
                {searchIsSubmitting ? (
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

            <div
              ref={suggestionsRef}
              className={cx(
                "absolute top-[calc(100%_+_8px)] left-0 w-full bg-white shadow flex flex-col mt-1 rounded-md border border-gray-200 overflow-y-auto opacity-0 pointer-events-none touch-none z-20",
                {
                  "opacity-100 pointer-events-auto touch-auto":
                    showSuggestionPopover,
                }
              )}
            >
              {showSuggestionPopover &&
                documents.map((doc) => {
                  if (!doc.search) return null;

                  const isSelected =
                    selectedSuggestionIndex === documents.indexOf(doc);
                  return (
                    <Link
                      key={doc.id}
                      to={`/can-i-eat-${doc.search
                        .toLowerCase()
                        .replace(/ /g, "-")}-while-pregnant`}
                      prefetch={
                        isSelected || fields.search.value === doc.search
                          ? "viewport"
                          : "intent"
                      }
                      className={cx(
                        "p-2 hover:bg-gray-100 cursor-pointer capitalize",
                        {
                          "bg-gray-100": isSelected,
                        }
                      )}
                      aria-selected={isSelected}
                    >
                      {doc.search}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
        {data?.status === "error" && data?.errors?.search && (
          <span className="ml-auto text-xs text-red-500 pt-2">
            {data?.errors?.search}
          </span>
        )}
      </div>
    </div>
  );
};
