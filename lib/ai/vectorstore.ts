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
    console.log('Vector retrieval is disabled');
    return '';
  }

  try {
    console.log('Generating embeddings for query:', query);
    const queryEmbedding = await getEmbeddings(query);

    console.log('Querying Pinecone...');
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    console.log('Pinecone response:', queryResponse);

    const relevantContexts = queryResponse.matches
      .filter((match) => {
        const passes = match.score && match.score > 0.2;
        if (!passes) {
          console.log(`Match filtered out due to low score: ${match.score}`);
        }
        return passes;
      })
      .map((match) => {
        const metadata = match.metadata as { text: string; source?: string };
        console.log('Match metadata:', metadata);
        return {
          content: metadata.text,
          source: metadata.source || 'Unknown source'
        };
      });

    console.log('Filtered contexts:', relevantContexts);

    // Format contexts as JSON string
    const formattedContexts = JSON.stringify(
      { chunks: relevantContexts },
      null,
      2
    );

    return formattedContexts;
  } catch (error) {
    console.error('Error retrieving context:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return '';
  }
}

export async function retrieveRelevantQuestions(
  query: string,
  threshold: number = 0.2
): Promise<Array<{ text: string, source: string, timestamp: string, score: number }>> {
  console.log('🔍 Starting question RAG search for query:', query);
  console.log('Using threshold:', threshold);

  if (!ENABLE_VECTOR_RETRIEVAL) {
    console.log('❌ Vector retrieval is disabled');
    return [];
  }

  try {
    console.log('📊 Generating embeddings for question query...');
    const queryEmbedding = await getEmbeddings(query);
    console.log('✅ Embeddings generated successfully');

    console.log('🔎 Querying Pinecone questions namespace...');
    const questionsIndex = index.namespace('questions');
    const queryResponse = await questionsIndex.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true
    });

    console.log('📝 Raw Pinecone response:', JSON.stringify(queryResponse, null, 2));
    console.log('Found matches:', queryResponse.matches?.length || 0);

    const relevantQuestions = queryResponse.matches
      .filter((match) => {
        const passes = match.score && match.score > threshold;
        console.log(`Match score ${match.score} - ${passes ? 'accepted' : 'filtered out'} (threshold: ${threshold})`);
        return passes;
      })
      .map((match) => {
        const metadata = match.metadata as { text: string; source: string; timestamp: string };
        console.log('Processing match metadata:', metadata);
        return {
          text: metadata.text,
          source: metadata.source || 'Unknown source',
          timestamp: metadata.timestamp || 'Unknown time',
          score: match.score || 0
        };
      });

    console.log('🎯 Final filtered questions:', relevantQuestions);
    console.log(`Found ${relevantQuestions.length} relevant questions above threshold ${threshold}`);
    return relevantQuestions;
  } catch (error) {
    console.error('❌ Error retrieving questions:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return [];
  }
}
