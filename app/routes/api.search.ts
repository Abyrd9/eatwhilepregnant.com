import { ActionFunction } from "@remix-run/node";
import { getSupabaseClient } from "~/utils/helpers/supabase.server";

export const action: ActionFunction = async ({ request }) => {
  const { client } = await getSupabaseClient(request);

  const form = await request.formData();
  const intent = form.get("intent");

  switch (intent) {
    default:
      console.error("No intent found:", intent);
      break;
  }
};
