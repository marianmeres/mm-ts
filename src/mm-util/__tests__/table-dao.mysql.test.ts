import * as dotenv from 'dotenv';
import { SqlUtil } from '../SqlUtil';
import { _sqlUtilTestsAll } from '../__tests-helpers__/_table-dao-tests-all';
import { configMysql } from '../../../test-utils/config-db';
import { SqlUtilHelper } from '../SqlUtilHelper';
import { testSuiteFactorySqlUtilDialectBased } from '../../../test-utils/misc';

dotenv.config();

// main
const db = () => SqlUtil.mysql(SqlUtilHelper.factoryMysqlDriverProxy(
    configMysql
));

// should not need to edit below
const shouldSkip = () =>
    !dotenv.config().parsed[
        `MM_TS_TESTING__DB_${db().dialect.toUpperCase()}_DATABASE`
    ];

// actual test suite
testSuiteFactorySqlUtilDialectBased(db(), _sqlUtilTestsAll, shouldSkip);
