import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Resolve from this source file so workspace commands always load backend/.env.
const sourceDirectory = dirname(fileURLToPath(import.meta.url))
console.log(resolve(sourceDirectory, '../.env') ,"=================")
dotenv.config({ path: resolve(sourceDirectory, '../.env') })

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
}

if (!config.databaseUrl || !config.jwtSecret) {
  throw new Error('DATABASE_URL and JWT_SECRET must be set. Copy .env.example to .env and update it.')
}
