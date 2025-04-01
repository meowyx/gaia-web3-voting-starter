import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { tools } from "../../../ai/tools";     

// No need to explicitly import .env - Next.js automatically loads it

export async function POST(request: Request) {
  const { messages } = await request.json();

  // Use GaiaNet node configuration
  const openai = createOpenAI({
    baseURL: "https://0xc780292a9a5c7cdaa5d682984395d48bd65859c3.gaia.domains/v1",
    apiKey: "" // API key can be empty for GaiaNet nodes
  });

  try {
    const result = streamText({
      model: openai("DeepSeek-R1-Distill-Llama-8B-Q5_K_M"),
      system: "You are a helpful assistant.",
      messages,
      maxSteps: 5,
      tools,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}