import { db } from "../../prisma/db";
interface ChatServiceProps {
  portfolio_id: string,
  message: string,
  session_id?: string,
  role?: 'user' | 'system' | 'assistant',
  visitor_id?: string
}

export class ChatService {
  static async createMessage(chatProps: ChatServiceProps) {
    let session_id = chatProps?.session_id
    if (!session_id) {
      const initSession = ChatService.createSession(chatProps)
      console.log(initSession, "=============initSession")
      session_id = initSession.session_id
    }
    const newChat = await db.orm.public.ChatMessage.create({
      content: chatProps.message,
      role: chatProps?.role ?? 'user',
      session_id: session_id
    })
    return newChat;
  }

  static async createSession(chatProps: ChatServiceProps) {
    return await db.orm.public.ChatSession.create({
      portfolio_id: chatProps.portfolio_id,
      visitor_id: 'b82ac7fc-66d5-50db-a7a8-ec6a25555ce8' // chatProps.visitor
    })
  }
}