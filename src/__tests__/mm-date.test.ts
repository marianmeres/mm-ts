import { mmIsValidDate } from '../mm-date';

describe('mm-date', () => {

    it('sanity check', () => {
        expect(mmIsValidDate(new Date())).toBeTruthy();
    });


});