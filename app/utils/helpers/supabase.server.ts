import { createServerClient, parse, serialize } from "@supabase/ssr";
import { env } from "~/env";
import { Database } from "../types/supabase";

const { SUPABASE_URL, SUPABASE_KEY } = env;

export const getSupabaseClient = (request: Request) => {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  const client = createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      get(key) {
        return cookies[key];
      },
      set(key, value, options) {
        headers.append("Set-Cookie", serialize(key, value, options));
      },
      remove(key, options) {
        headers.append("Set-Cookie", serialize(key, "", options));
      },
    },
  });

  return { client };
};
