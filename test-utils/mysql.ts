import * as dotenv from 'dotenv';
import { DbConfig, MysqlPoolDbConfig } from './misc';
dotenv.config();

import * as _mysql from 'mysql';

const config: MysqlPoolDbConfig = {
    host: process.env.MM_TS_TESTING__DB_MYSQL_HOST,
    user: process.env.MM_TS_TESTING__DB_MYSQL_USER,
    password: process.env.MM_TS_TESTING__DB_MYSQL_PASSWORD,
    database: process.env.MM_TS_TESTING__DB_MYSQL_DATABASE,
    port: process.env.MM_TS_TESTING__DB_MYSQL_PORT,
    // to make it behave like pg
    multipleStatements: true
};

export const mysqlPool =  _mysql.createPool(config);

const mysql = {
    /**
     * @param text
     * @param params
     * @returns {Promise<any>}
     */
    query: async (text, params) => {
        return new Promise((resolve, reject) => {
            mysqlPool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }

                conn.query(text, params || [], (error, results, fields) => {
                    conn.release();
                    // error will be an Error if one occurred during the query
                    if (error) {
                        return reject(error);
                    }
                    // results will contain the results of the query
                    return resolve(results);
                    // fields will contain information about the returned results fields (if any)
                });
            });
        });
    },

    /**
     * @returns {any}
     */
    end: () => mysqlPool.end(),
    //
    config,
    //
    mysql: _mysql,
};

export default mysql;

