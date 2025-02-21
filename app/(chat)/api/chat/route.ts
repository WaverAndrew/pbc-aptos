import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit";
import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { retrieveRelevantContext } from '@/lib/ai/vectorstore';
import { initializeAgent } from '@/lib/ai/agentkit';
import { getVercelAITools } from '@/lib/ai/agentkit/get-vercel-ai-tools';
import { getMoveAgentTools } from '@/lib/ai/agentkit/get-move-agent-tools';
import type { User } from '@/app/(auth)/auth';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
      network,
    }: {
      id: string;
      messages: Array<Message>;
      selectedChatModel: string;
      network: string;
    } = await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      console.error('Authentication failed');
      return new Response('Unauthorized', { status: 401 });
    }

    const user = session.user as User;
    if (!user.privateKey) {
      console.error('No private key found in session');
      return new Response('Private key not found', { status: 400 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      console.error('No user message found');
      return new Response('No user message found', { status: 400 });
    }

    try {
      const chat = await getChatById({ id });

      if (!chat) {
        const title = await generateTitleFromUserMessage({ message: userMessage });
        await saveChat({ id, userId: session.user.id, title });
      }

      // Save the user message first
      await saveMessages({
        messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
      });
    } catch (error) {
      console.error('Database operation failed:', error);
      return new Response('Database operation failed', { status: 500 });
    }

    const relevantContext = await retrieveRelevantContext(userMessage.content);

    const enhancedSystemPrompt = systemPrompt({
      selectedChatModel,
      context: relevantContext
    });

    // Add logging for testing
    console.log('Final prompt with context:', {
      systemPrompt: enhancedSystemPrompt,
      relevantContext,
      userMessage: userMessage.content
    });

    // Initialize Aptos agent with the user's private key from session
    const { agent } = await initializeAgent({
      network: Network.MAINNET,
      privateKey: user.privateKey?.startsWith('0x')
        ? user.privateKey as `0x${string}`
        : `0x${user.privateKey}` as `0x${string}`
    });

    const tools = getMoveAgentTools(agent);

    return createDataStreamResponse({
      execute: async (dataStream) => {
        try {
          const result = streamText({
            model: myProvider.languageModel(selectedChatModel),
            system: enhancedSystemPrompt,
            messages,
            maxSteps: 5,
            experimental_activeTools: [
              'getTransaction',
              'getTokenPrice',
              'getTokenDetails',
              'getPoolDetails',
              'getUserPosition',
              'swapWithPanora',
              'getAccountResources',
              'getBalance',
              'burnNFT',
              'burnToken',
              'createToken',
              'createAriesProfile',
              'lendAriesToken',
              'withdrawEchelonToken'
            ],
            experimental_transform: smoothStream({ chunking: 'word' }),
            experimental_generateMessageId: generateUUID,
            tools: tools,
            onFinish: async ({ response, reasoning }) => {
              if (session.user?.id) {
                try {
                  const sanitizedResponseMessages = sanitizeResponseMessages({
                    messages: response.messages,
                    reasoning,
                  });

                  if (sanitizedResponseMessages.length > 0) {
                    await saveMessages({
                      messages: sanitizedResponseMessages.map((message) => ({
                        id: message.id,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                      })),
                    });
                  }
                } catch (error) {
                  console.error('Failed to save chat response:', error);
                }
              }
            },
            experimental_telemetry: {
              isEnabled: true,
              functionId: 'stream-text',
            },
          });

          result.mergeIntoDataStream(dataStream, {
            sendReasoning: true,
          });
        } catch (error) {
          console.error('Stream processing error:', error);
          throw error;
        }
      },
      onError: (error) => {
        console.error('Data stream error:', error);
        return 'An error occurred while processing your request. Please try again.';
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
