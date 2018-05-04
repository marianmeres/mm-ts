import * as fs from 'fs';
import { SqlUtil } from '../src/mm-util/SqlUtil';
import { getSqlSchema } from './get-sql-schema';
import * as path from 'path';

const _assertExists = (file) => {
    if (!fs.existsSync(file)) { throw new Error(`'${file}' not found`); }
};

export async function _importData(DATA_DIR, db) {
    _assertExists(DATA_DIR);
    const sqlFile = path.join(DATA_DIR, `testing.sql`); // hard

    if (fs.existsSync(sqlFile)) {
        return db.query(fs.readFileSync(sqlFile).toString());
    }
}

export const _initDb = async (db: SqlUtil) => {
    const SCHEMA_DIR = path.resolve(process.cwd(), 'data', db.dialect, 'schema');
    _assertExists(SCHEMA_DIR);

    const sqlSchema = getSqlSchema(SCHEMA_DIR);

    try {
        // import schema
        await db.query(sqlSchema);

        const DATA_DIR = path.resolve(process.cwd(), 'data', db.dialect, 'data');
        await _importData(DATA_DIR, db);

    } catch (e) {
        console.error(e.toString());
    }
};
