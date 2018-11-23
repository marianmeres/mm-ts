import * as fs from 'fs';
import { SqlUtil } from '../src/mm-util/SqlUtil';
import { getSqlSchema } from './get-sql-schema';
import * as path from 'path';

const _assertExists = (file) => {
    if (!fs.existsSync(file)) {
        throw new Error(`'${file}' not found`);
    }
};

export async function _importData(DATA_DIR, db) {
    _assertExists(DATA_DIR);
    const sqlFile = path.join(DATA_DIR, `testing.sql`); // hard

    if (fs.existsSync(sqlFile)) {
        let sql = fs.readFileSync(sqlFile).toString();

        if (db.isSqlite()) {
            // lebo sqlite nepodporuje multiplestatements
            // NOTE: NAIVE + INSECURE
            sql = sql.split(';') as any;
            for (let _sql of sql) {
                if (_sql.trim() !== '') {
                    await db.query(_sql);
                }
            }
        }
        //
        else {
            return db.query(sql);
        }
    }
}

export const _initDb = async (db: SqlUtil, debug?, withData = true) => {
    const SCHEMA_DIR = path.resolve(
        process.cwd(),
        'data',
        db.dialect,
        'schema'
    );
    _assertExists(SCHEMA_DIR);

    const sqlSchema = getSqlSchema(SCHEMA_DIR);
    // console.log(sqlSchema);

    try {
        // import schema
        if (db.isSqlite()) {
            // lebo sqlite nepodporuje multiplestatements
            // toto je hack... ale mam za to, tento init je safe lebo data
            // su pod kontrolou
            // NOTE: NAIVE + INSECURE
            let sqls = sqlSchema.split(';');
            for (let sql of sqls) {
                if (sql.trim() !== '') {
                    // console.log(sql.replace(/\s\s*/g, ' '));
                    await db.query(sql, void 0, debug);
                }
            }
        }
        //
        else {
            await db.query(sqlSchema, void 0, debug);
        }

        if (withData) {
            const DATA_DIR = path.resolve(
                process.cwd(),
                'data',
                db.dialect,
                'data'
            );
            await _importData(DATA_DIR, db);
        }

    } catch (e) {
        console.error(e.toString());
    }
};
