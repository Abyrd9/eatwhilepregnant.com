import OpenAi from "openai";
import { env } from "~/env";

export const getOpenAi = () =>
  new OpenAi({
    apiKey: env.OPEN_AI_API_KEY,
  });
