import * as dotenv from 'dotenv';
import { _initDb } from '../../../test-utils/init';
import { tests } from './__all__/tests';
import { SqlUtil } from '../SqlUtil';
import pg from '../../../test-utils/pg';
dotenv.config();

const DRIVER = 'pg';

// NOTE: this is a bit of a hacking... since I'm trying to test the same tests for
// different 'drivers'...

let SHOULD_SKIP = false;
let testsFactoryMap = Object.keys(tests);

beforeAll(() => {
    SHOULD_SKIP = !dotenv.config().parsed[
        `MM_TS_TESTING__DB_${DRIVER.toUpperCase()}_DATABASE`
    ];
});

describe(DRIVER, () => {

    beforeEach(async () => (
        SHOULD_SKIP ? void 0 : _initDb(SqlUtil.pg(pg))
    ));

    for (let i = 0; i < testsFactoryMap.length; i++) {
        let key = testsFactoryMap[i];
        let testFactory = tests[key];

        let testFn = async () => {
            if (!SHOULD_SKIP) {
                await testFactory(SqlUtil.pg(pg));
            }
        };

        if (/^skip\./i.test(key)) {
            test.skip(key, testFn);
        }
        else if (/^only\./i.test(key)) {
            test.only(key, testFn);
        }
        else {
            test(key, testFn);
        }

    }

});


