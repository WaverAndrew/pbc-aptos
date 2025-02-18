"use server";

import { OpenAIEmbeddings } from "@langchain/openai"

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPEN_AI_KEY,
  model: "text-embedding-3-small",
});

export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await embeddings.embedQuery(text);
    return response;
  } catch (error) {
    console.error("error calling openai embeddings api", error);
    throw error;
  }
}