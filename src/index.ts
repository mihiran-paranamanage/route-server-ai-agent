import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const { text } = await generateText({
  model: google("gemini-2.5-flash"),
  prompt: "What is love?"
});

console.log(text);
