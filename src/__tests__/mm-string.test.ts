import { mmReplaceMap } from '../mm-string';

describe('mmString', () => {

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
});