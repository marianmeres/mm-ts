
import BaseCollection from '../BaseCollection';

const musketeersData = [
    {name: 'Athos',       job: 'Musketeer'},
    {name: 'Porthos',     job: 'Musketeer'},
    {name: 'Aramis',      job: 'Musketeer'},
    {name: 'd\'Artagnan', job: 'Guard'},
];

describe('base collection', () => {

    test('indexOf works', () => {
        let friends = new BaseCollection(musketeersData);
        let indexOfFirstMusketeer = friends.indexOf(friends.findWhere({job: 'Musketeer'}));
        let indexOfFirstGuard = friends.indexOf(friends.findWhere({job: 'Guard'}));

        expect(indexOfFirstMusketeer).toEqual(0);
        expect(indexOfFirstGuard).toEqual(3);
    });

    test('where works', () => {
        let friends = new BaseCollection(musketeersData);
        let musketeers = friends.where({job: 'Musketeer'});

        expect(musketeers.length).toEqual(3);
        musketeers.forEach((m) => expect(m.job).toEqual('Musketeer'));

        // 2 attribs
        let onlyAramis = friends.where({job: 'Musketeer', name: 'Aramis'});
        expect(onlyAramis.length).toEqual(1);
        onlyAramis.forEach((m) => expect(m.name).toEqual('Aramis'));

        // not found
        expect(friends.where({job: 'Some'}).length).toEqual(0);
    });

    test('findWhere works', () => {
        let friends = new BaseCollection(musketeersData);
        let firstMusketter = friends.findWhere({job: 'Musketeer'});

        expect(firstMusketter.name).toEqual('Athos');

        // not found
        expect(friends.findWhere({job: 'Some'})).toBeUndefined();
    });

});