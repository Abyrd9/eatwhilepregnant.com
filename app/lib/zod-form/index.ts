import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import type { DeepPartial } from "~/utils/types/deep-partial";
import { flattenZodFormData } from "./flatten-zod-form-data";
import { unflattenZodFormData } from "./unflatten-zod-form-data";

// TODO: We need to support these ZodEffect types, for now just use this function to unwrap them

type ZodObjectOrEffects =
  | z.ZodObject<z.ZodRawShape>
  | z.ZodEffects<z.ZodObject<z.ZodRawShape>>;

type UnwrappedShape<T extends ZodObjectOrEffects> = T extends z.ZodObject<
  infer Shape
>
  ? Shape
  : T extends z.ZodEffects<z.ZodObject<infer Shape>>
  ? Shape
  : never;

export function unwrapZodEffects<T extends ZodObjectOrEffects>(
  schema: T
): z.ZodObject<UnwrappedShape<T>> {
  if (schema instanceof z.ZodEffects) {
    return unwrapZodEffects(
      schema.innerType() as z.ZodObject<UnwrappedShape<T>>
    );
  }

  const newShape: z.ZodRawShape = {};
  for (const [key, value] of Object.entries(schema.shape)) {
    if (value instanceof z.ZodEffects) {
      newShape[key] = unwrapZodEffects(value);
    } else if (value instanceof z.ZodObject) {
      newShape[key] = unwrapZodEffects(value);
    } else {
      newShape[key] = value;
    }
  }

  return z.object(newShape) as z.ZodObject<UnwrappedShape<T>>;
}

// -----------------------------------------------------------------------------

export type FieldProps<T> = {
  name: string;
  value: T;
  onChange: (payload: T) => void;
  error: string | null;
  ref: HTMLElement | null;
};

type NestedFields<T extends z.ZodTypeAny> = T extends z.ZodObject<infer Shape>
  ? { [K in keyof Shape]: NestedFields<Shape[K]> }
  : T extends z.ZodArray<infer Item>
  ? NestedFields<Item>[]
  : FieldProps<z.infer<T>>;

export type ZodPaths<T extends z.ZodTypeAny> = T extends z.ZodObject<
  infer Shape
>
  ? {
      [Key in keyof Shape]: Shape[Key] extends z.ZodArray<z.ZodTypeAny>
        ? Key
        : Shape[Key] extends z.ZodObject<z.ZodRawShape>
        ? Key | `${Key & string}.${ZodPaths<Shape[Key]>}`
        : Key;
    }[keyof Shape]
  : never;

export type ZodPathValue<
  T extends z.ZodTypeAny,
  P extends ZodPaths<T>
> = DeepPartial<
  P extends `${infer Key}.${infer Rest}`
    ? T extends z.ZodObject<infer Shape>
      ? Key extends keyof Shape
        ? Shape[Key] extends z.ZodTypeAny
          ? Rest extends ZodPaths<Shape[Key]>
            ? ZodPathValue<Shape[Key], Rest>
            : never
          : never
        : never
      : never
    : T extends z.ZodObject<infer Shape>
    ? P extends keyof Shape
      ? z.infer<Shape[P]>
      : never
    : never
>;

type ArrayElementType<
  Schema extends z.ZodObject<z.ZodRawShape>,
  P extends ArrayPaths<Schema>
> = z.infer<
  P extends keyof Schema["shape"]
    ? Schema["shape"][P] extends z.ZodArray<infer E>
      ? E
      : never
    : P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof Schema["shape"]
      ? Schema["shape"][Key] extends z.ZodObject<infer NestedShape>
        ? Rest extends ArrayPaths<z.ZodObject<NestedShape>>
          ? NestedShape[Rest] extends z.ZodArray<infer E>
            ? E
            : never
          : never
        : never
      : never
    : never
>;

type ArrayPaths<T extends z.ZodTypeAny> = T extends z.ZodObject<infer Shape>
  ? {
      [K in keyof Shape]: Shape[K] extends z.ZodArray<z.ZodTypeAny>
        ? K
        : Shape[K] extends z.ZodObject<z.ZodRawShape>
        ? `${K & string}.${ArrayPaths<Shape[K]>}`
        : never;
    }[keyof Shape]
  : never;

export const useZodForm = <Schema extends z.ZodObject<z.ZodRawShape>>({
  schema,
  defaultValues,
}: {
  schema: Schema;
  defaultValues?: DeepPartial<z.infer<Schema>>;
}) => {
  const [flattenedData, setFlattenedData] = useState(() => {
    const initial = defaultValues ?? ({} as DeepPartial<z.infer<Schema>>);
    return flattenZodFormData(schema, initial);
  });

  const fields = useMemo(() => {
    const getFieldProps = <T extends z.ZodTypeAny>(
      field: T,
      path: string[] = []
    ): NestedFields<T> => {
      if (field instanceof z.ZodObject) {
        const objectFields: Record<string, unknown> = {};
        for (const [key, subField] of Object.entries(field.shape)) {
          objectFields[key] = getFieldProps(subField as z.ZodTypeAny, [
            ...path,
            key,
          ]);
        }

        return objectFields as NestedFields<T>;
      }

      if (field instanceof z.ZodArray) {
        const arrayPath = path.join(".") as ZodPaths<Schema>;

        const nested = unflattenZodFormData<z.infer<typeof field>>(
          flattenedData,
          arrayPath
        );

        return nested.map((_: unknown, index: number) =>
          getFieldProps(field.element, [...path, index.toString()])
        ) as NestedFields<T>;
      }

      const fieldPath = path.join(".") as ZodPaths<Schema>;
      const value = flattenedData[fieldPath] as z.infer<T>;

      return {
        name: fieldPath,
        value,
        onChange: (payload: z.infer<T>) => {
          setFlattenedData((prev) => ({ ...prev, [fieldPath]: payload }));
        },
        error: null,
      } as unknown as NestedFields<T>;
    };

    return getFieldProps(schema);
  }, [schema, flattenedData]);

  const getFieldArrayHelpers = useCallback(
    <P extends ArrayPaths<Schema>>(path: P) => {
      return {
        add: (value: ArrayElementType<Schema, P>) => {
          setFlattenedData((prev) => {
            const newData = { ...prev };
            const currentArray = Object.keys(newData)
              .filter((key) => key.startsWith(`${path}.`))
              .reduce((max, key) => {
                const match = key.match(new RegExp(`^${path}\\.(\\d+)`));
                return match
                  ? Math.max(max, Number.parseInt(match[1], 10))
                  : max;
              }, -1);

            const newIndex = currentArray + 1;

            if (typeof value === "object" && value !== null) {
              for (const [key, val] of Object.entries(value)) {
                newData[`${path}.${newIndex}.${key}`] = val;
              }
            } else {
              newData[`${path}.${newIndex}`] = value;
            }

            return newData;
          });
        },
        remove: (index: number) => {
          setFlattenedData((prev) => {
            const newData = { ...prev };
            const prefix = `${path}.${index}`;

            // Remove all keys that start with the prefix
            for (const key of Object.keys(newData)) {
              if (key.startsWith(prefix)) {
                delete newData[key];
              }
            }

            // Shift the indices of the remaining elements
            for (const key of Object.keys(newData)) {
              const match = key.match(new RegExp(`^${path}\\.(\\d+)`));
              if (match) {
                const currentIndex = Number.parseInt(match[1], 10);
                if (currentIndex > index) {
                  const newKey = key.replace(
                    new RegExp(`^${path}\\.${currentIndex}`),
                    `${path}.${currentIndex - 1}`
                  );
                  newData[newKey] = newData[key];
                  delete newData[key];
                }
              }
            }

            return newData;
          });
        },
      };
    },
    []
  );

  return {
    fields,
    getFieldArrayHelpers,
  };
};
