import * as dotenv from 'dotenv';
import { SqlUtil } from '../../mm-util/SqlUtil';
import { _sqlUtilTestsAll } from '../__tests-helpers__/_foo-tests-all';
import { configMysql } from '../../__test-utils__/config-db';
import { SqlUtilHelper } from '../../mm-util/SqlUtilHelper';
import { testSuiteFactorySqlUtilDialectBased } from '../../__test-utils__/misc';
dotenv.config();

// main
const db = () =>
    SqlUtil.mysql(SqlUtilHelper.factoryMysqlDriverProxy(configMysql));

// should not need to edit below
const shouldSkip = () =>
    !dotenv.config().parsed[
        `MM_TS_TESTING__DB_${db().dialect.toUpperCase()}_DATABASE`
    ];

// actual test suite
testSuiteFactorySqlUtilDialectBased(db(), _sqlUtilTestsAll, shouldSkip);
