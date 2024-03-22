import OpenAi from "openai";
import { env } from "~/env";

export const openai = new OpenAi({
  apiKey: env.OPEN_AI_API_KEY,
});
