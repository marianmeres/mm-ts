import { SqlUtil } from '../SqlUtil';



// import {
//     _importData, _importSchema, _initDb
// } from '../../../_scripts/_init-db-workers';
// import pg from '../pg';
//
// describe('SqlUtils', () => {
//
//     beforeEach(_initDb);
//
//     // afterEach(_dbClientEnd);
//
//     describe('utils', () => {
//
//         it('buildWhere works', () => {
//             const pgUtil = SqlUtil.pg(pg);
//
//             let cases = [
//                 [null,                     /^$/],
//                 ['kokos',                  /^kokos$/],
//                 [{'=': 'kokos'},           /^kokos$/],
//                 [{'foo': null},            /^"foo"\s*IS\s+NULL$/],
//                 [{'foo=': null},           /^"foo"\s*IS\s+NULL$/],
//                 [{'foo!': null},           /^"foo"\s*IS\s+NOT\s+NULL$/],
//                 [{'foo=': 'foo + 1'},      /^"foo"\s*=\s*'foo \+ 1'$/],
//                 [{'foo': 123},             /^"foo"\s*=\s*'123'$/],
//                 [{'foo': 'bar'},           /^"foo"\s*=\s*'bar'$/],
//                 [{'foo>': 'bar'},          /^"foo"\s*>\s*'bar'$/],
//                 [{'foo<=': 'bar'},         /^"foo"\s*<=\s*'bar'$/],
//                 [{'foo!': 'bar'},          /^"foo"\s*<>\s*'bar'$/],
//                 [{'foo~': 'bar'},          /^"foo"\s*ILIKE\s*'bar'$/],
//                 [{'foo!~': 'bar'},         /^"foo"\s*NOT ILIKE\s*'bar'$/],
//                 [{'foo': ['bar', 'baz']},  /^"foo"\s*IN\s*\('bar',\s*'baz'\)$/],
//                 [{'foo!': ['bar', 'baz']}, /^"foo"\s*NOT\s*IN\s*\('bar',\s*'baz'\)$/],
//                 [{foo: 'bar', baz: 'bat'}, /^"foo"\s*=\s*'bar'\s*AND\s*"baz"\s*=\s*'bat'$/],
//                 [{foo: 'bar', 'baz!': ['bat', 'hey']},
//                     /^"foo"\s*=\s*'bar'\s*AND\s*"baz"\s*NOT\s*IN\s*\('bat',\s*'hey'\)$/],
//             ];
//
//             expect.assertions(cases.length);
//             cases.forEach((_case) => {
//                 let [where, rgx] = _case;
//                 let sql = pgUtil.buildWhere(where);
//                 expect(sql).toMatch(rgx as any);
//             });
//
//         });
//
//         it('sign parsing works', () => {
//             const pgUtil = SqlUtil.pg(pg);
//             const s = pgUtil.getSignFromColNotation.bind(pgUtil); // shortcut
//             let cases = {
//                 'some':   '=',
//                 'some=':  '=',
//                 'some!':  '<>',
//                 'some>':  '>',
//                 'some>=': '>=',
//                 'some<':  '<',
//                 'some<=': '<=',
//                 'some~':  'ILIKE',
//                 'some!~': 'NOT ILIKE',
//             };
//
//             expect.assertions(Object.keys(cases).length * 2);
//
//             Object.keys(cases).forEach((k) => {
//                 expect(s(k).sign).toEqual(cases[k]);
//                 expect(s(k).column).toEqual('some');
//             });
//         });
//
//         it('building addons works', () => {
//             const pgUtil = SqlUtil.pg(pg);
//
//             expect(pgUtil.buildAddons({
//                 group_by: 'foo',
//             })).toEqual('GROUP BY "foo"');
//
//             expect(pgUtil.buildAddons({
//                 order_by: 'foo',
//             })).toEqual('ORDER BY foo');
//
//             expect(pgUtil.buildAddons({
//                 group_by: 'foo',
//                 order_by: 'foo',
//             })).toEqual('GROUP BY "foo" ORDER BY foo');
//
//             expect(pgUtil.buildAddons({
//                 order_by: 'foo',
//                 limit: 10,
//                 offset: 5,
//             })).toEqual('ORDER BY foo LIMIT 10 OFFSET 5');
//
//         });
//     });
//
//     describe('Db queries (foo, single pk)', () => {
//
//         it('`fetchRow` works', async () => {
//             const db = SqlUtil.pg(pg);
//             const row = await db.fetchRow('*', 'foo', {id: 1});
//             expect(row).toBeTruthy();
//             expect(row.id).toEqual(1);
//         });
//
//         it('`fetchOne` works', async () => {
//             const db = SqlUtil.pg(pg);
//             const id = await db.fetchOne('id', 'foo', null, {order_by: 'id desc'});
//             expect(id).toEqual(2);
//         });
//
//         it('`fetchOne` works (nonexisting record)', async () => {
//             const db = SqlUtil.pg(pg);
//             const id = await db.fetchOne('id', 'foo', {id: 400});
//             expect(id).toEqual(false);
//         });
//
//         it('`fetchAll` works', async () => {
//             const db = SqlUtil.pg(pg);
//             const rows = await db.fetchAll('*', 'foo');
//             expect(rows.length).toEqual(2);
//         });
//
//         it('`fetchCount` works', async () => {
//             const db = SqlUtil.pg(pg);
//
//             const count = await db.fetchCount('foo');
//             expect(count).toEqual(2);
//         });
//
//         it('`insert` works', async () => {
//             const db = SqlUtil.pg(pg);
//
//             let data = await db.insert('foo', {label: 'hovno'});
//             expect(data.label).toEqual('hovno');
//
//             const row = await db.fetchRow('*', 'foo', {id: 3});
//             expect(row.label).toEqual('hovno');
//             expect(row.id).toEqual(3);
//         });
//
//         it('`insert` works (undefined values are converted to nulls)', async () => {
//             const db = SqlUtil.pg(pg);
//
//             let data = await db.insert('foo', {label: void 0});
//             expect(data.label).toEqual(null);
//
//             const row = await db.fetchRow('*', 'foo', {id: 3});
//             expect(row.label).toEqual(null);
//             expect(row.id).toEqual(3);
//         });
//
//         it('`update` works', async () => {
//             const db = SqlUtil.pg(pg);
//
//             let data = await db.update('foo', {label: 'hovno'}, {id: 1});
//             expect(data.label).toEqual('hovno');
//
//             const row = await db.fetchRow('*', 'foo', {id: 1});
//             expect(row.label).toEqual('hovno');
//             expect(row.id).toEqual(1);
//         });
//
//         it('`update` works (undefined values are converted to nulls)', async () => {
//             const db = SqlUtil.pg(pg);
//
//             let data = await db.update('foo', {label: void 0}, {id: 1});
//             expect(data.label).toEqual(null);
//
//             const row = await db.fetchRow('*', 'foo', {id: 1});
//             expect(row.label).toEqual(null);
//             expect(row.id).toEqual(1);
//         });
//
//         it('`update` works (with `col=` sign notation)', async () => {
//             const db = SqlUtil.pg(pg);
//
//             // pri "=" sa nedotykame hodnoty
//             let data = await db.update('foo', {'label=': `LOWER(TRIM('  hoVNO  '))`}, {id: 1});
//             expect(data.label).toEqual('hovno');
//
//             const row = await db.fetchRow('*', 'foo', {id: 1});
//             expect(row.label).toEqual('hovno');
//             expect(row.id).toEqual(1);
//         });
//
//         it('`delete` works', async () => {
//             const db = SqlUtil.pg(pg);
//
//             await db.delete('foo', {id: 1});
//             let rows = await db.fetchAll('*', 'foo');
//
//             expect(rows.length).toEqual(1);
//             expect(rows[0].id).toEqual(2);
//         });
//
//     });
//
// });
//
//
