import { mmGetRandomStr, mmReplaceMap } from '../mm-string';


test('mmReplaceMap works', () => {
    let map: any = {foo: 'bar', baz: 'bat', bar: 'foo', bat: 'baz'};
    let str = 'Hello foofoo bar baz bat!';
    expect(mmReplaceMap(str, map)).toEqual('Hello barbar foo bat baz!');
});

test('mmReplaceMap works2', () => {
    let map = {':userId': 123, ':some': null, '/foo': void 0};
    let str = '/api/some/:userId/foo/:some';
    // '/foo' -> empty string (not 'undefined')
    // ':some' -> empty string (not 'null')
    expect(mmReplaceMap(str, map)).toEqual('/api/some/123/');
});

test('mmReplaceMap works3 (ignore case)', () => {
    // note: keys in map must be lowercased
    let map = {':userid': 123, ':some': null, '/foo': void 0};
    let str = '/api/some/:USERID/foo/:SoMe';
    expect(mmReplaceMap(str, map, true)).toEqual('/api/some/123/');
});

test('`mmGetRandomStr` works',  () => {
    let s = '';

    s = mmGetRandomStr();
    expect(s.length).toEqual(8);

    s = mmGetRandomStr({ length: 10 });
    expect(s.length).toEqual(10);

    s = mmGetRandomStr({ charset: 'a', length: 5 });
    expect(s).toEqual('aaaaa');

    s = mmGetRandomStr({ charset: 'a', length: 5 });
    expect(s).toEqual('aaaaa');

    s = mmGetRandomStr({ charset: 'a', length: 5, unique: true });
    expect(s).toEqual('aaaaa'); // this is OK because unique is ment for input


    s = mmGetRandomStr({ length: 128, readable: true });
    // console.log(s);
    expect(s.length).toEqual(128);
    expect(s.match(/01oil/i)).toBeFalsy();

    try {
        mmGetRandomStr({ length: -5 });
        expect(true).toBeFalsy(); // must not be reached
    } catch (e) { /**/ }
});
