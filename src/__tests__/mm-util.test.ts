import { mmSequence } from '../mm-util';
import _isArray = require('lodash/isArray');

describe('mmSequence', () => {

    it('works', () => {
        expect(mmSequence().reset().next()).toEqual(1);
        expect(mmSequence().next()).toEqual(2);
        expect(mmSequence().current()).toEqual(2);
        expect(mmSequence().next()).toEqual(3);
        expect(mmSequence().current()).toEqual(3);
        expect(mmSequence().next()).toEqual(4);
        //
        expect(mmSequence('foo').next()).toEqual('foo1');
        expect(mmSequence('foo').next()).toEqual('foo2');
        expect(mmSequence('foo').current()).toEqual('foo2');
        //
        expect(mmSequence().next()).toEqual(5);
        //
        expect(mmSequence('foo').next()).toEqual('foo3');
        expect(mmSequence('bar').next()).toEqual('bar1');
    });

    it('works2', () => {
        expect(mmSequence().reset().next()).toEqual(1);
        expect(mmSequence('foo').reset().next()).toEqual('foo1');
    });

    it('foo', () => {
        expect(1).toEqual(1);
        expect(_isArray([])).toEqual(true);
    });

});