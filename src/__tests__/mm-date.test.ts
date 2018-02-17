import { mmIsValidDate } from '../mm-date';


test('sanity check', () => {
    expect(mmIsValidDate(new Date())).toBeTruthy();
});
