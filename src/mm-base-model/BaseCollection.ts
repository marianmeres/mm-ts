import find from 'lodash-es/find';

export default class BaseCollection {
    protected _items: any[] = [];

    //
    comparator;

    /**
     * @param {any[]} items
     */
    constructor(items?: any[]) {
        if (items && !Array.isArray(items)) {
            throw new Error('Expecting array of items');
        }
        items && (this._items = items);
    }

    /**
     * @param index
     * @returns {any}
     */
    at(index) {
        return this._items[index];
    }

    /**
     * @param item
     * @returns {number}
     */
    indexOf(item) {
        return this._items.indexOf(item);
    }

    /**
     * Return an array of all the models in a collection that match the passed attributes.
     * Useful for simple cases of filter.
     * @returns {any[]}
     */
    where(attributes: { [index: string]: any }) {
        const attrKeys = Object.keys(attributes);
        const isWhereMatch = (item) =>
            attrKeys.length ===
            attrKeys.reduce(
                (acc, key) => (acc += item[key] === attributes[key] ? 1 : 0),
                0
            );

        return this._items.filter(isWhereMatch);
    }

    /**
     * Just like where, but directly returns only the first model in the collection
     * that matches the passed attributes.
     */
    findWhere(attributes: { [index: string]: any }) {
        const attrKeys = Object.keys(attributes);
        const isWhereMatch = (item) =>
            attrKeys.length ===
            attrKeys.reduce(
                (acc, key) => (acc += item[key] === attributes[key] ? 1 : 0),
                0
            );

        return find(this._items, isWhereMatch);
    }
}
