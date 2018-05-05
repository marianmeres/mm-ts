import * as dotenv from 'dotenv';
import { SqlUtil } from '../SqlUtil';
import { _sqlUtilTestsAll } from '../__tests-helpers__/_table-dao-tests-all';
import { SqlUtilHelper } from '../SqlUtilHelper';
import { testSuiteFactorySqlUtilDialectBased } from '../../../test-utils/misc';
import { configPg } from '../../../test-utils/config-db';

dotenv.config();
// main
const db = () => SqlUtil.pg(SqlUtilHelper.factoryPgDriverProxy(
    configPg
));

// should not need to edit below
const shouldSkip = () =>
    !dotenv.config().parsed[
        `MM_TS_TESTING__DB_${db().dialect.toUpperCase()}_DATABASE`
    ];

// actual test suite
testSuiteFactorySqlUtilDialectBased(db(), _sqlUtilTestsAll, shouldSkip);
