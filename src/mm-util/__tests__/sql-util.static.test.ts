import * as dotenv from 'dotenv';
import { SqlUtil } from '../SqlUtil';
import { SqlUtilHelper } from '../SqlUtilHelper';
dotenv.config();

test('sql replace map works', () => {
    let generic = `
        drop table __QI__user__QI__ __DROP_TABLE_CASCADE__;
        create table __QI__user__QI__ (
            id  __SERIAL_PRIMARY_KEY__,
            name varchar(255)
        );
    `;
    let sql;

    // pg
    sql = SqlUtilHelper.dialectize(generic, SqlUtil.DIALECT_PG);
    // console.log(sql);
    expect(/__DROP_TABLE_CASCADE__/.test(sql)).toBeFalsy();
    expect(/SERIAL PRIMARY KEY/.test(sql)).toBeTruthy();
    expect(/CASCADE/.test(sql)).toBeTruthy();
    expect(/"user"/.test(sql)).toBeTruthy();

    // sqlite
    sql = SqlUtilHelper.dialectize(generic, SqlUtil.DIALECT_SQLITE);
    // console.log(sql);
    expect(/__DROP_TABLE_CASCADE__/.test(sql)).toBeFalsy();
    expect(/SERIAL PRIMARY KEY/.test(sql)).toBeFalsy();
    expect(/AUTOINCREMENT/.test(sql)).toBeTruthy();
    expect(/"user"/.test(sql)).toBeTruthy();

    // mysql
    sql = SqlUtilHelper.dialectize(generic, SqlUtil.DIALECT_MYSQL);
    // console.log(sql);
    expect(/`user`/.test(sql)).toBeTruthy();
});
