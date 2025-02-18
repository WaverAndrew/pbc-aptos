import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbeddings } from './embeddings';
import { config } from 'dotenv';
config({
    path: '.env.local',
  });

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

// Debug flag to disable vector retrieval
export const ENABLE_VECTOR_RETRIEVAL = false;

export async function retrieveRelevantContext(
  query: string,
  topK: number = 3
): Promise<string> {
  // Early return if vector retrieval is disabled
  if (!ENABLE_VECTOR_RETRIEVAL) {
    return '';
  }

  try {
    // Generate embeddings for the query
    const queryEmbedding = await getEmbeddings(query);

    // Search for similar vectors in Pinecone
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    // Extract and format the relevant context from the matches
    const relevantContexts = queryResponse.matches
      .filter((match) => match.score && match.score > 0.7) // Adjust threshold as needed
      .map((match) => {
        const metadata = match.metadata as { text: string; source?: string };
        return metadata.text;
      });

    // Join all relevant contexts with newlines
    return relevantContexts.join('\n\n');
  } catch (error) {
    console.error('Error retrieving context:', error);
    return ''; // Return empty string if retrieval fails
  }
}
