import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import { db } from './prisma/db';
import portfolioRouter from './modules/portfolio/route';

const app: Application = express();

app.use(cors({
    origin:['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())

app.use('/api/portfolio', portfolioRouter)

app.use('/health',(req:Request, res: Response)=>{
    return res.status(200).json({
        success: true,
        message: "Portfolio AI assistant is perfectly alright!"
    })
})

export default app;