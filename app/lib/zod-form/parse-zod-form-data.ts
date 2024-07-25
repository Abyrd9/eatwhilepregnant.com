import { ZodError, type z } from "zod";
import { coerceFormData } from "./coerce-form-data";
import { flattenZodFormSchema } from "./flatten-zod-form-schema";
import { unflattenZodFormData } from "./unflatten-zod-form-data";

type ParseResult<T extends z.ZodRawShape> =
  | { success: true; data: z.infer<z.ZodObject<T>> }
  | { success: false; errors: Partial<Record<keyof T, string>> };

export const parseZodFormData = <T extends z.ZodRawShape>(
  form: FormData,
  {
    schema,
  }: {
    schema: z.ZodObject<T>;
  }
): ParseResult<T> => {
  const result: Partial<z.infer<z.ZodObject<T>>> = {};
  const errors: Partial<Record<keyof T, string>> = {};

  const flattenedZodSchema = flattenZodFormSchema(schema);

  for (const [key, formDataValue] of form.entries()) {
    const keyWithHash = key.replace(/(\d+)/g, "#");

    if (keyWithHash in flattenedZodSchema.shape) {
      const keySchema = flattenedZodSchema.shape[keyWithHash];
      try {
        result[key as keyof T] = coerceFormData(keySchema).parse(formDataValue);
      } catch (error) {
        if (error instanceof ZodError) {
          errors[key as keyof T] = error.errors[0].message;
        } else {
          console.error(error);
          errors[key as keyof T] = "An unexpected error occurred";
        }
      }
    }
  }

  console.log(result, errors);

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const unflattenedData = unflattenZodFormData(result);
    return { success: true, data: schema.parse(unflattenedData) };
  } catch (error) {
    if (error instanceof ZodError) {
      for (const zodError of error.errors) {
        if (zodError.path.length > 0) {
          errors[zodError.path[0] as keyof T] = zodError.message;
        }
      }
    }
    return { success: false, errors };
  }
};
