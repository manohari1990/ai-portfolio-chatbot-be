// import 'dotenv/config';
// import postgres from '@prisma/orm-postgres/runtime';
// import type { Contract } from './contract.d';
// import contractJson from './contract.json' with { type: 'json' };
// import { config } from '../config.js'

// export const db = postgres<Contract>({
//   contractJson,
//   url: config.databaseUrl,
// });


import { Pool } from 'pg'
import { config } from './config.js'

export const db = new Pool({ connectionString: config.databaseUrl })
