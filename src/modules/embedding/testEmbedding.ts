
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GOOGLE_GENAI_API_KEY is missing. Check the backend .env file."
  );
}

const ai = new GoogleGenAI({ apiKey });

async function testEmbedding() {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents:
      "I am a React developer with experience building full-stack web applications.",
    config: {
      outputDimensionality: 1536,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding || embedding.length !== 1536) {
    throw new Error(
      `Expected 1536 dimensions, received ${embedding?.length ?? 0}`
    );
  }

  console.log("Embedding generated successfully!");
  console.log("Dimensions:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));
}

testEmbedding().catch((error) => {
  console.error("Embedding test failed:", error.message);
  process.exitCode = 1;
});
