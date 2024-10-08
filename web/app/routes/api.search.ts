import { type ActionFunction, json, redirect } from "@remix-run/node";
import { getRateLimiter } from "cache/rate-limiter.server";
import { type InferSelectModel, eq } from "drizzle-orm";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { z } from "zod";
import {
  SEARCH_FORM_INTENT,
  type SearchFormActionData,
  SearchFormSchema,
} from "~/components/SearchForm";
import { db } from "~/database/db.server";
import { documents, versions } from "~/database/schema";
import { parseZodFormData } from "~/lib/zod-form/parse-zod-form-data";
import { getAnthropic } from "~/utils/helpers/anthropic.server";

const AiResponseSchema = z.array(
  z.object({
    food: z.string(),
    is_safe: z.coerce.string(z.enum(["1", "2", "3", "4", "undefined"])),
    note: z.string(),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const form = await request.clone().formData();
  const parsed = parseZodFormData(form, { schema: SearchFormSchema });

  const ip_address = getClientIPAddress(request);
  if (ip_address) {
    const limiter = getRateLimiter("search", 100, 60 * 10, 10000);
    await limiter.consume(ip_address).catch(() => {
      return json<SearchFormActionData>({
        status: "error",
        intent: SEARCH_FORM_INTENT,
        errors: {
          global: "You have exceeded the rate limit for this action.",
        },
      });
    });
  } else console.error("No IP address found.");

  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    const IP = crypto.randomUUID();
    const limiter = getRateLimiter("search", 100, 60 * 10, 10000);
    await limiter.consume(IP).catch(() => {
      return json<SearchFormActionData>({
        status: "error",
        intent: SEARCH_FORM_INTENT,
        errors: {
          global: "You have exceeded the rate limit for this action.",
        },
      });
    });
  }

  if (parsed.success) {
    const search = parsed.data.search.toLowerCase();

    // Let's check to see if we can get a quick match on the search column
    // If we can, let's just return that
    const column = await db.query.documents.findFirst({
      where: eq(documents.search, search),
    });

    if (column) {
      console.log("Found a column in the DB");
      return redirect(`/${column.slug}`);
    }

    try {
      const anthropic = await getAnthropic();

      const message = await anthropic.messages.create({
        max_tokens: 1024,
        model: "claude-3-sonnet-20240229",
        messages: [
          {
            role: "user",
            content: `
              You are an OBGYN and a patient is asking you about food. From the sentence that you get, you need to extract all food items and return a JSON array of objects, where each object represents a single food item.

              For each food item, create an object with the following keys:

              'food': The name of the food item as a string. Make sure it is not plural. If the input is plural, convert it to singular. For example, if the input is 'apples', the output should be 'apple'.
              'is_safe': A code representing the safety of the food for pregnant women:
              If the food is safe to eat, assign '1'.
              If the food is not safe to eat, assign '4'.
              If the food can be eaten in moderation or with certain precautions, assign '2'.
              If the safety of the food is unknown or uncertain, or leans more towards not smart to eat for pregnancy, assign '3'.
              'note': A string providing a concise explanation of the food item's safety for pregnant women. This should only be 2 to 3 sentences long. It should only be about the food item that is associated with this sepcific object.

              If you can't find any food items in the search, return an array with a single object:
              [
                {
                  food: 'none',
                  is_safe: 'undefined',
                  note: 'This doesn't seem to be a food item.'
                }
              ]

              For example, if someone asks about 'sushi and cooked salmon', you would respond with:
              [
                {
                  food: 'sushi',
                  is_safe: 'red',
                  note: 'Raw fish in sushi can contain harmful bacteria and should be avoided during pregnancy.'
                },
                {
                  food: 'cooked salmon',
                  is_safe: 'green',
                  note: 'Cooked salmon is generally safe to consume, as long as it is fully cooked to an internal temperature of 145°F (63°C) to eliminate any harmful parasites or bacteria.'
                }
              ]
              
              But if they only include one item, like "watermelon", you would respond with:
              
              [
                {
                  food: 'watermelon',
                  is_safe: 'green',
                  note: 'Watermelon is a safe and healthy choice
                  during pregnancy, as it is a good source of
                  vitamins and minerals, and is mostly made up of water.'
                }
              ]
              
              Here is the patient's question/query: ${search}`,
          },
          {
            role: "assistant",
            content: "[{",
          },
        ],
      });

      const messageContent = message.content[0];
      if (messageContent.type !== "text") {
        throw new Error("Invalid response type");
      }

      const contents = AiResponseSchema.parse(
        JSON.parse(`[{${messageContent.text}`)
      );

      const content = contents[0];

      if (content.is_safe === "undefined") {
        return json<SearchFormActionData>({
          status: "error",
          intent: SEARCH_FORM_INTENT,
          errors: {
            search: content.note,
          },
        });
      }

      // Let's check if the word that was pulled out is a food item we already have in the DB
      const existing = await db.query.documents.findFirst({
        where: eq(documents.search, content.food.toLowerCase()),
      });

      if (existing) return redirect(`/${existing.slug}`);

      const document = await db.transaction(async (tx) => {
        const [[document]] = await Promise.all([
          tx
            .insert(documents)
            .values({
              search: content.food.toLowerCase(),
              content: content.note,
              is_safe: content.is_safe as InferSelectModel<
                typeof documents
              >["is_safe"],
              slug: `can-i-eat-${content.food
                .toLowerCase()
                .replace(/ /g, "-")}-while-pregnant`,
            })
            .returning(),
          tx.insert(versions).values({
            kind: "create",
          }),
        ]);

        return document;
      });

      return redirect(`/${document.slug}`);
    } catch (error) {
      console.error(error);
      return json<SearchFormActionData>({
        status: "error",
        intent: SEARCH_FORM_INTENT,
        errors: {
          global: "An unexpected error occurred.",
        },
      });
    }
  }

  console.error(parsed.errors);
  return json<SearchFormActionData>({
    status: "error",
    intent: SEARCH_FORM_INTENT,
    errors: {
      global: "An unexpected error occurred.",
    },
  });
};
