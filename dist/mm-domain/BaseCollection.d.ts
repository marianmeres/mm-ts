export default class BaseCollection {
    protected _items: any[];
    comparator: any;
    /**
     * @param {any[]} items
     */
    constructor(items?: any[]);
    /**
     * @param index
     * @returns {any}
     */
    at(index: any): any;
    /**
     * @param item
     * @returns {number}
     */
    indexOf(item: any): number;
    /**
     * Return an array of all the models in a collection that match the passed attributes.
     * Useful for simple cases of filter.
     * @returns {any[]}
     */
    where(attributes: {
        [index: string]: any;
    }): any[];
    /**
     * Just like where, but directly returns only the first model in the collection
     * that matches the passed attributes.
     */
    findWhere(attributes: {
        [index: string]: any;
    }): any;
}
