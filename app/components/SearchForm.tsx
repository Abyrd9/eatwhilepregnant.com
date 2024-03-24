import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { FiCornerDownLeft, FiLoader, FiSearch } from "react-icons/fi";
import { z } from "zod";
import { InputComposer } from "~/primitives/input";
import { Label } from "~/primitives/label";
import { cx } from "~/utils/helpers/cx";
import { ActionData } from "~/utils/types/generics";

export type SearchFormSchemaType = z.infer<typeof SearchFormSchema>;
export const SearchFormSchema = z.object({
  search: z
    .string({ required_error: "Search value is required." })
    .min(1)
    .max(200),
});

export type SearchFormActionData = ActionData<SearchFormSchemaType>;

export const SearchForm = () => {
  const data = useActionData() as SearchFormActionData;
  const [form, fields] = useForm<SearchFormSchemaType>({
    lastResult: data?.submission,
  });

  const navigation = useNavigation();
  const isSubmitting =
    ["submitting", "loading"].includes(navigation.state) &&
    Boolean(navigation.formData?.get("search"));

  return (
    <Form
      {...getFormProps(form)}
      method="POST"
      className="w-full max-w-[400px]"
    >
      <div className="w-full flex flex-col">
        <Label htmlFor={fields.search.id} className="mb-2">
          What can I eat?
        </Label>
        <InputComposer className="w-full grid grid-cols-[24px_1fr_54px]">
          <div>
            <FiSearch className="text-slate-700" />
          </div>
          <InputComposer.Input
            {...getInputProps(fields.search, { type: "text" })}
            className="w-full"
            placeholder="Watermelon, Deli Meat, Fish, etc."
            maxLength={200}
            disabled={isSubmitting}
          />
          <div
            className={cx(
              "flex items-center space-x-1 justify-end text-gray-400",
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
        </InputComposer>
        {data?.submission.error?.search && (
          <span className="ml-auto text-xs text-red-500 pt-2">
            {data?.submission.error?.search}
          </span>
        )}
      </div>
    </Form>
  );
};
