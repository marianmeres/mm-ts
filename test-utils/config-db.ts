import * as dotenv from 'dotenv';
dotenv.config();

export const configMysql = {
    host: process.env.MM_TS_TESTING__DB_MYSQL_HOST,
    user: process.env.MM_TS_TESTING__DB_MYSQL_USER,
    password: process.env.MM_TS_TESTING__DB_MYSQL_PASSWORD,
    database: process.env.MM_TS_TESTING__DB_MYSQL_DATABASE,
    port: process.env.MM_TS_TESTING__DB_MYSQL_PORT,
};

export const configPg = {
    host: process.env.MM_TS_TESTING__DB_PG_HOST,
    user: process.env.MM_TS_TESTING__DB_PG_USER,
    password: process.env.MM_TS_TESTING__DB_PG_PASSWORD,
    database: process.env.MM_TS_TESTING__DB_PG_DATABASE,
    port: process.env.MM_TS_TESTING__DB_PG_PORT,
};

export const configSqlite = {
    database: process.env.MM_TS_TESTING__DB_SQLITE_DATABASE,
};
