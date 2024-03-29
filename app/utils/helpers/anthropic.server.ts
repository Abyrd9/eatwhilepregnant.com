import Anthropic from "@anthropic-ai/sdk";

export const getAnthropic = () =>
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
