import { mmReplaceMap } from '../mm-string';

describe('mmString', () => {

    it('mmReplaceMap works', () => {
        let map: any = {foo: 'bar', baz: 'bat', bar: 'foo', bat: 'baz'};
        let str = 'Hello foofoo bar baz bat!';
        expect(mmReplaceMap(str, map)).toEqual('Hello barbar foo bat baz!');
    });

    it('mmReplaceMap works2', () => {
        let map = {':userId': 123, ':some': null, '/foo': void 0};
        let str = '/api/some/:userId/foo/:some';
        // '/foo' -> empty string (not 'undefined')
        // ':some' -> empty string (not 'null')
        expect(mmReplaceMap(str, map)).toEqual('/api/some/123/');
    });
});