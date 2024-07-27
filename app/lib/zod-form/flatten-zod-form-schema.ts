import { z } from "zod";

export function flattenZodFormSchema<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): z.ZodObject<z.ZodRawShape> {
  const flattenedSchemaMap = new Map<string, z.ZodTypeAny>();

  function flattenSchema(subSchema: z.ZodTypeAny, prefix = ""): void {
    if (subSchema instanceof z.ZodObject) {
      for (const [key, value] of Object.entries(subSchema.shape)) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        flattenSchema(value as z.ZodTypeAny, newPrefix);
      }
    } else if (subSchema instanceof z.ZodArray) {
      flattenSchema(subSchema.element, `${prefix}.#`);
    } else if (
      subSchema instanceof z.ZodUnion ||
      subSchema instanceof z.ZodDiscriminatedUnion
    ) {
      subSchema.options.forEach((option: z.ZodTypeAny, index: number) => {
        flattenSchema(option, `${prefix}`);
      });
    } else {
      flattenedSchemaMap.set(prefix, subSchema);
    }
  }

  flattenSchema(schema);

  return z.object(Object.fromEntries(flattenedSchemaMap));
}
