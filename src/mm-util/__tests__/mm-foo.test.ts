import { mmFoo } from '../mm-foo';

// jest lodash-es dummy debug...
test('foo', () => {
    expect(mmFoo(12)).toBeFalsy();
    expect(mmFoo(Number('asdfasd'))).toBeTruthy();
});
