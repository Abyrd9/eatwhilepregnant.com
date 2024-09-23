import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import type { DeepPartial } from "~/utils/types/deep-partial";
import { flattenZodFormData } from "./flatten-zod-form-data";
import { flattenZodFormErrors } from "./flatten-zod-form-errors";
import { unflattenZodFormData } from "./unflatten-zod-form-data";

export type ZodObjectOrEffects =
  | z.ZodObject<z.ZodRawShape>
  | z.ZodEffects<z.ZodObject<z.ZodRawShape>>;

export type FieldProps<T> = {
  name: string;
  value: T;
  onChange: (payload: T) => void;
  error: string | null;
  ref: HTMLElement | null;
};

export type NestedFields<T extends z.ZodTypeAny> = T extends z.ZodEffects<
  infer Inner
>
  ? NestedFields<Inner>
  : T extends z.ZodObject<infer Shape extends z.ZodRawShape>
  ? { [K in keyof Shape]: NestedFields<Shape[K]> }
  : T extends z.ZodArray<infer Item>
  ? NestedFields<Item>[]
  : FieldProps<z.infer<T>>;

const exampleZodSchema = z
  .object({
    email: z.string().email(),
    code: z.string().min(1),
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
    thing: z.object({
      cop: z.number(),
    }),
    list: z.array(
      z.object({
        name: z.string(),
      })
    ),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.passwordConfirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["passwordConfirmation"],
      });
    }
    return value;
  });

export type NestedFieldErrors<T extends z.ZodTypeAny> = T extends z.ZodEffects<
  infer Inner
>
  ? NestedFieldErrors<Inner>
  : T extends z.ZodObject<infer Shape>
  ? { [K in keyof Shape]: NestedFieldErrors<Shape[K]> }
  : string;

export type ZodPaths<T extends z.ZodTypeAny> = T extends z.ZodEffects<
  infer Inner
>
  ? ZodPaths<Inner>
  : T extends z.ZodObject<infer Shape>
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
  T extends z.ZodEffects<infer Inner>
    ? ZodPathValue<Inner, P & ZodPaths<Inner>>
    : P extends `${infer Key}.${infer Rest}`
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
  Schema extends ZodObjectOrEffects,
  Path extends ArrayPaths<Schema>
> = Schema extends z.ZodEffects<infer Inner extends ZodObjectOrEffects>
  ? ArrayElementType<Inner, Path>
  : Schema extends z.ZodObject<infer Shape>
  ? Path extends keyof Shape
    ? Shape[Path] extends z.ZodArray<infer E>
      ? z.infer<E>
      : never
    : Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof Shape
      ? Shape[Key] extends z.ZodObject<infer NestedShape>
        ? Rest extends ArrayPaths<z.ZodObject<NestedShape>>
          ? ArrayElementType<z.ZodObject<NestedShape>, Rest>
          : never
        : never
      : never
    : never
  : never;

type ArrayPaths<T extends ZodObjectOrEffects> = T extends z.ZodEffects<
  infer Inner
>
  ? Inner extends ZodObjectOrEffects
    ? ArrayPaths<Inner>
    : never
  : T extends z.ZodObject<infer Shape>
  ? {
      [K in keyof Shape]: Shape[K] extends z.ZodArray<z.ZodTypeAny>
        ? K
        : Shape[K] extends z.ZodObject<z.ZodRawShape>
        ? `${K & string}.${ArrayPaths<Shape[K]>}`
        : never;
    }[keyof Shape]
  : never;

export const useZodForm = <Schema extends ZodObjectOrEffects>({
  schema,
  defaultValues,
  errors,
}: {
  schema: Schema;
  defaultValues?: DeepPartial<z.infer<Schema>>;
  errors?: DeepPartial<NestedFieldErrors<Schema>>;
}) => {
  const [flattenedData, setFlattenedData] = useState(() => {
    const initial = defaultValues ?? ({} as DeepPartial<z.infer<Schema>>);
    return flattenZodFormData(schema, initial);
  });

  const flattenedErrors = useMemo(() => {
    return flattenZodFormErrors(errors);
  }, [errors]);

  const fields = useMemo((): NestedFields<Schema> => {
    const getFieldProps = <T extends z.ZodTypeAny>(
      field: T,
      path: string[] = []
    ): NestedFields<T> => {
      if (field instanceof z.ZodEffects) {
        return getFieldProps(field.innerType(), path) as NestedFields<T>;
      }

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

        return (
          (nested?.map((_: unknown, index: number) =>
            getFieldProps(field.element, [...path, index.toString()])
          ) as NestedFields<T>) ?? []
        );
      }

      const fieldPath = path.join(".") as ZodPaths<Schema>;
      const value = flattenedData[fieldPath] as z.infer<T>;

      return {
        name: fieldPath,
        value,
        onChange: (payload: z.infer<T>) => {
          setFlattenedData((prev) => ({ ...prev, [fieldPath]: payload }));
        },
        error: flattenedErrors.get(fieldPath) ?? null,
      } as unknown as NestedFields<T>;
    };

    return getFieldProps(schema) as NestedFields<Schema>;
  }, [schema, flattenedData, flattenedErrors]);

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
