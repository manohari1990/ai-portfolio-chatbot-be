import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import portfolioRouter from './modules/portfolio/route';
import ChatRouter from './modules/chat/route';

const app: Application = express();

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())

app.use('/api/portfolio', portfolioRouter)
app.use('/api/chat', ChatRouter)

app.use('/health', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Portfolio AI assistant is perfectly alright!"
    })
})

export default app;