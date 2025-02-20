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
export const ENABLE_VECTOR_RETRIEVAL = true;

export async function retrieveRelevantContext(
  query: string,
  topK: number = 10
): Promise<string> {
  if (!ENABLE_VECTOR_RETRIEVAL) {
    return '';
  }

  try {
    const queryEmbedding = await getEmbeddings(query);
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    const relevantContexts = queryResponse.matches
      .filter((match) => match.score && match.score > 0.2)
      .map((match) => {
        const metadata = match.metadata as { text: string; source?: string };
        return {
          content: metadata.text,
          source: metadata.source || 'Unknown source'
        };
      });

    return JSON.stringify({ chunks: relevantContexts }, null, 2);
  } catch (error) {
    console.error('Error retrieving context:', error);
    return '';
  }
}

export async function retrieveRelevantQuestions(
  query: string,
  threshold: number = 0.2
): Promise<Array<{ text: string, source: string, timestamp: string, score: number }>> {
  if (!ENABLE_VECTOR_RETRIEVAL) {
    return [];
  }

  try {
    const queryEmbedding = await getEmbeddings(query);
    const questionsIndex = index.namespace('questions');
    const queryResponse = await questionsIndex.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true
    });

    return queryResponse.matches
      .filter((match) => match.score && match.score > threshold)
      .map((match) => {
        const metadata = match.metadata as { text: string; source: string; timestamp: string };
        return {
          text: metadata.text,
          source: metadata.source || 'Unknown source',
          timestamp: metadata.timestamp || 'Unknown time',
          score: match.score || 0
        };
      });
  } catch (error) {
    console.error('Error retrieving questions:', error);
    return [];
  }
}
