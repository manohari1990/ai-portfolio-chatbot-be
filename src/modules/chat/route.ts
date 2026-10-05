import { Router } from "express";
import { DeleteChatController, FetchChatController, NewChatController } from './controller'
const ChatRouter = Router()

ChatRouter.post('/', NewChatController)
ChatRouter.get('/:id', FetchChatController)  // By portfolio id
ChatRouter.delete('/:id', DeleteChatController)

export default ChatRouter