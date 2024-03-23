import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { Label } from "@radix-ui/react-label";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { LuSearch, LuCornerDownLeft } from "react-icons/lu";
import { z } from "zod";
import { InputComposer } from "~/primitives/input";
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
  const isSubmitting = ["submitting", "loading"].includes(navigation.state);

  return (
    <Form {...getFormProps(form)} method="POST" className="w-full">
      <div className="w-full flex flex-col">
        <Label>Can I eat it?</Label>
        <InputComposer className="w-full grid grid-cols-[24px_1fr_54px]">
          <div>
            <LuSearch className="text-slate-700" />
          </div>
          <InputComposer.Input
            {...getInputProps(fields.search, { type: "text" })}
            className="w-full"
            placeholder="Watermelon, Deli Meat, fish, etc."
            maxLength={200}
          />
          <div
            className={cx(
              "flex items-center space-x-1 justify-end text-gray-400",
              {
                "opacity-0": !fields.search.value,
                "opacity-100": fields.search.value,
              }
            )}
          >
            <span className="text-xs">Enter</span>
            <LuCornerDownLeft className="text-xs" />
          </div>
        </InputComposer>
        {data?.submission.error?.search && (
          <span className="ml-auto text-xs text-red-500">
            {data?.submission.error?.search}
          </span>
        )}
      </div>
    </Form>
  );
};
