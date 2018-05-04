import * as dotenv from 'dotenv';
import { _initDb } from '../../../test-utils/init';
import pg from '../../../test-utils/pg';
import { SqlUtil } from '../../mm-util/SqlUtil';
import { _sqlUtilTestsAll } from '../__tests-helpers__/_foo-tests-all';
dotenv.config();

const DRIVER = 'pg';

// NOTE: this is a bit of a hacking... since I'm trying to test the same tests for
// different 'drivers'...

let testsFactoryMap = Object.keys(_sqlUtilTestsAll);

const shouldSkip = () =>
    !dotenv.config().parsed[
        `MM_TS_TESTING__DB_${DRIVER.toUpperCase()}_DATABASE`
    ];

describe(DRIVER, () => {
    beforeEach(async () => (shouldSkip() ? void 0 : _initDb(SqlUtil.pg(pg))));

    for (let i = 0; i < testsFactoryMap.length; i++) {
        let key = testsFactoryMap[i];
        let testFactory = _sqlUtilTestsAll[key];

        let testFn = async () => {
            if (!shouldSkip()) {
                await testFactory(SqlUtil.pg(pg));
            }
        };

        if (shouldSkip()) {
            key = `skip.${key}`;
        }

        // skip
        if (/^skip\./i.test(key)) {
            test.skip(key, testFn);
        }
        // only
        else if (/^only\./i.test(key)) {
            test.only(key, testFn);
        }
        // normal
        else {
            test(key, testFn);
        }
    }
});
