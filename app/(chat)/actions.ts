'use server';

import { generateText, Message } from 'ai';
import { cookies } from 'next/headers';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/models';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel(DEFAULT_CHAT_MODEL),
    system: `
    - You will generate a short title based on the first message a user begins a conversation with
    - Ensure it is not more than 80 characters long
    - The title should be concise and descriptive
    - Do not use quotes or special characters
    `,
    messages: [{ role: 'user', content: message.content }],
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
