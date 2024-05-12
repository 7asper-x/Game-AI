import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw Error("OPENAI_API_KEY is not defined");
}

const openai = new OpenAI({ apiKey });

export default openai;

export async function getEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  const embedding = response.data[0].embedding;

  if (!embedding) throw Error("Error generating text embedding.");

  return embedding;
}
