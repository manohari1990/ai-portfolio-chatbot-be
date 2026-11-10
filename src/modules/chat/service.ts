import { db } from "../../db";
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

  static async fetchAllChat(
    chatProps: {
      id?: string
    }
  ) {
    return await db.orm.public.ChatSession
      .where({ portfolio_id: chatProps.id })
      .include('chat_message', (message) =>
        message
          .orderBy((msg)=> msg.created_at.desc())
          .limit(5)
      )
      .orderBy((session)=> session.started_at.desc())
      .all()
  }

  static async deleteBySessionId(
    chatProps: {
      id?: string
    }
  ){
    console.log(chatProps.id,"====================chatProps")
    return await db.orm.public.ChatSession
      .where({session_id: chatProps.id})
      .delete()
  }
}