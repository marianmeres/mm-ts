import { SqlUtil } from '../../SqlUtil';

test('foo', () => void 0);

export const tests = {

    'buildWhere works': async (db: SqlUtil) => {

        let cases = [
            [null,                     /^$/],
            ['kokos',                  /^kokos$/],
            [{'=': 'kokos'},           /^kokos$/],
            [{'foo': null},            /^"foo"\s*IS\s+NULL$/],
            [{'foo=': null},           /^"foo"\s*IS\s+NULL$/],
            [{'foo!': null},           /^"foo"\s*IS\s+NOT\s+NULL$/],
            [{'foo=': 'foo + 1'},      /^"foo"\s*=\s*'foo \+ 1'$/],
            [{'foo': 123},             /^"foo"\s*=\s*'123'$/],
            [{'foo': 'bar'},           /^"foo"\s*=\s*'bar'$/],
            [{'foo>': 'bar'},          /^"foo"\s*>\s*'bar'$/],
            [{'foo<=': 'bar'},         /^"foo"\s*<=\s*'bar'$/],
            [{'foo!': 'bar'},          /^"foo"\s*<>\s*'bar'$/],
            [{'foo~': 'bar'},          /^"foo"\s*ILIKE\s*'bar'$/],
            [{'foo!~': 'bar'},         /^"foo"\s*NOT ILIKE\s*'bar'$/],
            [{'foo': ['bar', 'baz']},  /^"foo"\s*IN\s*\('bar',\s*'baz'\)$/],
            [{'foo!': ['bar', 'baz']}, /^"foo"\s*NOT\s*IN\s*\('bar',\s*'baz'\)$/],
            [{foo: 'bar', baz: 'bat'}, /^"foo"\s*=\s*'bar'\s*AND\s*"baz"\s*=\s*'bat'$/],
            [{foo: 'bar', 'baz!': ['bat', 'hey']},
                /^"foo"\s*=\s*'bar'\s*AND\s*"baz"\s*NOT\s*IN\s*\('bat',\s*'hey'\)$/],
        ];

        expect.assertions(cases.length);
        cases.forEach((_case) => {
            let [where, rgx] = _case;
            let sql = db.buildWhere(where);
            expect(sql).toMatch(rgx as any);
        });
    },

    'sign parsing works': async (db: SqlUtil) => {
        const s = db.getSignFromColNotation.bind(db); // shortcut
        let cases = {
            'some':   '=',
            'some=':  '=',
            'some!':  '<>',
            'some>':  '>',
            'some>=': '>=',
            'some<':  '<',
            'some<=': '<=',
            'some~':  'ILIKE',
            'some!~': 'NOT ILIKE',
        };

        expect.assertions(Object.keys(cases).length * 2);

        Object.keys(cases).forEach((k) => {
            expect(s(k).sign).toEqual(cases[k]);
            expect(s(k).column).toEqual('some');
        });
    },

    'building addons works': async (db: SqlUtil) => {

        expect(db.buildAddons({
            group_by: 'foo',
        })).toEqual('GROUP BY "foo"');

        expect(db.buildAddons({
            order_by: 'foo',
        })).toEqual('ORDER BY foo');

        expect(db.buildAddons({
            group_by: 'foo',
            order_by: 'foo',
        })).toEqual('GROUP BY "foo" ORDER BY foo');

        expect(db.buildAddons({
            order_by: 'foo',
            limit: 10,
            offset: 5,
        })).toEqual('ORDER BY foo LIMIT 10 OFFSET 5');
    },


    '`fetchRow` works': async (db: SqlUtil) => {
        const row = await db.fetchRow('*', 'foo', {id: 1});

        expect(row).toBeTruthy();
        expect(row.id).toEqual(1);
    },

    '`fetchOne` works': async (db: SqlUtil) => {
        const id = await db.fetchOne('id', 'foo', null, {order_by: 'id desc'});
        expect(id).toEqual(2);
    },

    '`fetchOne` works (nonexisting record)': async (db: SqlUtil) => {
        const id = await db.fetchOne('id', 'foo', {id: 400});
        expect(id).toEqual(false);
    },

    '`fetchAll` works': async (db: SqlUtil) => {
        const rows = await db.fetchAll('*', 'foo');
        expect(rows.length).toEqual(2);
    },

    '`fetchCount` works': async (db: SqlUtil) => {
        const count = await db.fetchCount('foo');
        expect(count).toEqual(2);
    },

    '`insert` works': async (db: SqlUtil) => {
        let data = await db.insert('foo', {label: 'hovno'});
        expect(data.label).toEqual('hovno');

        const row = await db.fetchRow('*', 'foo', {id: 3});
        expect(row.label).toEqual('hovno');
        expect(row.id).toEqual(3);
    },

    '`insert` works (undefined values are converted to nulls)': async (db: SqlUtil) => {
        let data = await db.insert('foo', {label: void 0});
        expect(data.label).toEqual(null);

        const row = await db.fetchRow('*', 'foo', {id: 3});
        expect(row.label).toEqual(null);
        expect(row.id).toEqual(3);
    },

    // 'foo': async (db: SqlUtil) => {},
};