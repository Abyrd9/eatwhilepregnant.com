import { parseWithZod } from "@conform-to/zod";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { getOpenAi } from "../helpers/openai.server";
import { getSupabaseClient } from "../helpers/supabase.server";
import {
  SearchFormActionData,
  SearchFormSchema,
} from "~/components/SearchForm";
import { z } from "zod";

const AiResponseSchema = z.object({
  food: z.string(),
  is_safe: z.enum(["green", "yellow", "red", "undefined"]),
  note: z.string(),
});

export const search: ActionFunction = async ({ request }) => {
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
      // If we can't find a match, let's use AI to pull the food item out
      const openai = await getOpenAi();

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an OBGYN and a patient is asking you about food. From the sentence that you get, you need to pull the food item out and place it in a JSON object with the key of 'food'. The food item should be in the format of a string. If you can't find a food item in the search at all, then return { food: 'none', is_safe: 'undefined', note: 'This doesn't seem to be a food.' }. If it is a food item however, then I want you determine if the food item is okay for a pregnant woman to eat. If it is, add a key of 'is_safe' with a value of 'green'. If it is not, add a key of 'is_safe' with a value of 'red'. If it is unknown, add a key of 'is_safe' with a value of 'yellow'. Then I want you to add a note about the food item and it's safety for pregnant women in the format of a string with the key of 'note'. So if someone asked you about 'sushi', you would respond with: { food: 'sushi', is_safe: 'red', note: 'Sushi is not safe to eat when pregnant.' }",
          },
          {
            role: "user",
            content: search,
          },
        ],
        response_format: { type: "json_object" },
      });

      const choice = response.choices[0];
      if (!choice.message.content) {
        return json<SearchFormActionData>({
          status: "error",
          submission: data,
        });
      }

      const content = AiResponseSchema.parse(
        JSON.parse(choice.message.content)
      );

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

      const result = await openai.embeddings.create({
        input: content.food,
        model: "text-embedding-3-small",
      });

      const [{ embedding }] = result.data;

      // @ts-expect-error - The embedding is correct
      const { data: document, error } = await client
        .from("documents")
        .insert({
          search: content.food.toLowerCase(),
          content: content.note,
          embedding: embedding,
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
