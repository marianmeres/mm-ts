import * as _mysql from 'mysql';
import * as _pg from 'pg';
import * as util from 'util';

export class SqlUtilHelper {
    /**
     * @param config
     */
    static factoryMysqlDriverProxy(config) {
        const mysqlPool = _mysql.createPool(
            Object.assign({}, config as any, {
                // force same behavior as pg
                multipleStatements: true,
            })
        );

        /**
         * @param text
         * @param params
         * @returns {Promise<any>}
         */
        const query = async (text, params) => {
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
        };

        /**
         * WARNING: EXPERIMENTAL!!!
         * @returns {Promise<any>}
         */
        const client = async () => {
            return new Promise((resolve, reject) => {
                mysqlPool.getConnection((err, conn) => {
                    if (err) {
                        return reject(err);
                    }

                    // uff... monkey patch so we have normalized api across drivers...
                    conn.query = util.promisify(conn.query) as any;

                    return resolve(conn);
                });
            });
        };

        /**
         * @param _client
         * @returns {Promise<void>}
         */
        const clientRelease = async (_client) => {
            _client.release();
            _client = null;
        };

        /**
         * @returns {Promise<void>}
         */
        const poolEnd = async () => mysqlPool.end();

        // prettier-ignore
        return {
            driver: 'mysql', query, client, clientRelease, config, poolEnd, raw: _mysql,
        };
    }

    /**
     * @param config
     */
    static factoryPgDriverProxy(config) {
        const { Pool } = _pg;
        const pgPool = new Pool(config);
        pgPool.on('error', (err, _client) =>
            console.error(`pgPool error: ${err.toString()}`)
        );

        /**
         * @param text
         * @param params
         * @returns {Promise<any>}
         */
        const query = async (text, params) => pgPool.query(text, params);

        /**
         * @returns {Promise<any>}
         */
        const client = async () => await pgPool.connect();

        /**
         * @param _client
         * @returns {Promise<void>}
         */
        const clientRelease = async (_client) => {
            _client.release(true);
            _client = null;
        };

        /**
         * @returns {Promise<any>}
         */
        const poolEnd = async () => pgPool.end();

        // prettier-ignore
        return {
            driver: 'pg', query, client, clientRelease, config, poolEnd, raw: _pg,
        };
    }
}
