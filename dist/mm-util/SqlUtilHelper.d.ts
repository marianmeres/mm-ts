import * as _mysql from 'mysql';
import * as sqlite3 from 'sqlite3';
import { DbConfig } from '../__test-utils__/misc';
export declare class SqlUtilHelper {
    /**
     * @param config
     */
    static factoryMysqlDriverProxy(config: DbConfig): {
        driver: string;
        query: (text: any, params: any) => Promise<{}>;
        client: () => Promise<{}>;
        clientRelease: (_client: any) => Promise<void>;
        config: DbConfig;
        poolEnd: () => Promise<void>;
        raw: typeof _mysql;
    };
    /**
     * @param config
     */
    static factoryPgDriverProxy(config: DbConfig): {
        driver: string;
        query: (text: any, params: any) => Promise<any>;
        client: () => Promise<any>;
        clientRelease: (_client: any) => Promise<void>;
        config: DbConfig;
        poolEnd: () => Promise<any>;
        raw: any;
    };
    /**
     * @param config
     */
    static factorySqliteDriverProxy(config: DbConfig): {
        driver: string;
        config: DbConfig;
        query: (text: any, params: any) => Promise<{}>;
        client: () => Promise<{}>;
        clientRelease: (_client: any) => Promise<void>;
        poolEnd: () => Promise<{}>;
        raw: typeof sqlite3;
    };
    /**
     * Simple helper to replace special placeholders with correct dialect
     * @param sql
     * @param dialect
     */
    static dialectize(sql: any, dialect: any): any;
    /**
     * map of special placeholders with their correct dialect form
     */
    static readonly SQL_REPLACE_MAP: {
        __SERIAL_PRIMARY_KEY__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __SMALLSERIAL_PRIMARY_KEY__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __BIGSERIAL_PRIMARY_KEY__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __UNSIGNED__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __SIGNED__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __TIMESTAMP__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __TIMESTAMP_DEFAULT_NOW__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __BOOL__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __TINYINT__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __MEDIUMTEXT__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __LONGTEXT__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __BLOB__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __LONGBLOB__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __ENGINE_INNODB__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __ENGINE_MYISAM__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __DROP_TABLE_CASCADE__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __DEFAULT_CHARSET_UTF8__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __CHARSET_UTF8_PER_COL__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __COLLATION_UTF8_BIN__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __COLLATION_UTF8_BIN_PER_COL__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __ZERO_TIMESTAMP__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __Q__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __XML__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
        __JSON__: {
            pg: string;
            sqlite: string;
            mysql: string;
        };
    };
}
