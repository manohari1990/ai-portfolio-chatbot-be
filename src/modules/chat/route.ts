import { Router } from "express";
import { DeleteChatBySessionController, FetchUserChatController, NewChatController } from './controller'
const ChatRouter = Router()

ChatRouter.post('/', NewChatController)
ChatRouter.get('/:id', FetchUserChatController)  // By portfolio id
ChatRouter.delete('/:id', DeleteChatBySessionController)

export default ChatRouter