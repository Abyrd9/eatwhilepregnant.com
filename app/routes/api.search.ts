import { parseWithZod } from "@conform-to/zod";
import { ActionFunction, json, redirect } from "@remix-run/node";
// import { getOpenAi } from "~/utils/helpers/openai.server";
import { getSupabaseClient } from "~/utils/helpers/supabase.server";
import {
  SearchFormActionData,
  SearchFormSchema,
} from "~/components/SearchForm";
import { z } from "zod";
import { getAnthropic } from "~/utils/helpers/anthropic.server";
import { getOpenAi } from "~/utils/helpers/openai.server";

const AiResponseSchema = z.array(
  z.object({
    food: z.string(),
    is_safe: z.coerce.string(z.enum(["1", "2", "3", "4", "undefined"])),
    note: z.string(),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const { client } = await getSupabaseClient(request);
  const form = await request.clone().formData();
  const data = parseWithZod(form, { schema: SearchFormSchema });

  if (data.status === "success") {
    const search = data.value.search.toLowerCase();

    // Let's check to see if we can get a quick match on the search column
    // If we can, let's just return that
    const { data: column } = await client
      .from("documents")
      .select("*")
      .eq("search", search)
      .single();

    if (column) return redirect(`/${column.search}`);

    try {
      const anthropic = await getAnthropic();

      const message = await anthropic.messages.create({
        max_tokens: 1024,
        model: "claude-3-haiku-20240307",
        messages: [
          {
            role: "user",
            content: `
              You are an OBGYN and a patient is asking you about food. From the sentence that you get, you need to extract all food items and return a JSON array of objects, where each object represents a single food item.

              For each food item, create an object with the following keys:

              'food': The name of the food item as a string.
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

      const contents = AiResponseSchema.parse(
        JSON.parse("[{" + message.content[0].text)
      );

      const content = contents[0];

      if (content.is_safe === "undefined") {
        return json<SearchFormActionData>({
          status: "error",
          submission: data.reply({
            fieldErrors: {
              search: [content.note],
            },
          }),
        });
      }

      // Let's check if the word that was pulled out is a food item we already have in the DB
      const { data: existing } = await client
        .from("documents")
        .select("*")
        .eq("search", content.food.toLowerCase())
        .single();

      if (existing) return redirect(`/${existing.search}`);

      const openai = await getOpenAi();
      const result = await openai.embeddings.create({
        input: content.food,
        model: "text-embedding-3-small",
      });

      const [{ embedding }] = result.data;

      const { data: document, error } = await client
        .from("documents")
        .insert({
          // @ts-expect-error - The embedding is correct
          embedding,
          search: content.food.toLowerCase(),
          content: content.note,
          is_safe: content.is_safe,
        })
        .select()
        .single();

      if (error || !document) {
        console.error(error);
        return json<SearchFormActionData>({
          status: "error",
          submission: data,
        });
      }

      return redirect(`/${document.search}`);
    } catch (error) {
      console.error(error);
      return json<SearchFormActionData>({
        status: "error",
        submission: data,
      });
    }
  }
};
