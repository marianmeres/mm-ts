import * as dotenv from 'dotenv';
import { DbConfig } from './misc';
dotenv.config();

import * as _pg from 'pg';

const config: DbConfig = {
    host: process.env.MM_TS_TESTING__DB_PG_HOST,
    user: process.env.MM_TS_TESTING__DB_PG_USER,
    password: process.env.MM_TS_TESTING__DB_PG_PASSWORD,
    database: process.env.MM_TS_TESTING__DB_PG_DATABASE,
    port: process.env.MM_TS_TESTING__DB_PG_PORT,
};

const { Pool } = _pg;

export const pgPool = new Pool(config);

pgPool.on('error', (err, client) => console.error(`pgPool error: ${err.toString()}`));

const pg = {
    query: (text, params) => pgPool.query(text, params),
    end: () => pgPool.end(),
    config,
};

export default pg;