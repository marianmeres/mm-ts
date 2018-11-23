import * as dotenv from 'dotenv';
import { _sqlUtilTestsAll } from '../__tests-helpers__/_sql-util-tests-all';
import { SqlUtil } from '../SqlUtil';
import { configSqlite } from '../../../test-utils/config-db';
import { SqlUtilHelper } from '../SqlUtilHelper';
import { testSuiteFactorySqlUtilDialectBased } from '../../../test-utils/misc';
import { _initDb } from '../../../test-utils/init';
import * as sqlite3 from 'sqlite3';

dotenv.config();

// main
const db = () =>
    SqlUtil.sqlite(
        SqlUtilHelper.factorySqliteDriverProxy({
            ...configSqlite,
            // logger: console.log,
        })
    );

// test('sqlite sanity', async (done) => {
//     let _db = db();
//     let res;
//
//     await _initDb(_db, false, true);
//
//     //
//     res = await _db.query('select * from foo');
//     console.log(res);
//
//     // res = await _db.query('select 1', void 0, true);
//     // console.log(res);
//     //
//     await mmDelay(500);
//     done();
// });

// should not need to edit below
const shouldSkip = () =>
    !dotenv.config().parsed[
        `MM_TS_TESTING__DB_${db().dialect.toUpperCase()}_DATABASE`
    ];

// actual test suite
testSuiteFactorySqlUtilDialectBased(db(), _sqlUtilTestsAll, shouldSkip);
