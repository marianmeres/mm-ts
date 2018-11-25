/**
 * Nothing fancy, just basic calculations.
 */
export declare class Paginator {
    protected _itemsTotal: number;
    protected _itemsPerPage: number;
    protected _currentPage: number;
    constructor(itemsTotal: number, itemsPerPage?: number, currentPage?: number);
    itemsTotal: any;
    itemsPerPage: any;
    currentPage: number;
    protected _assertNumber(val: any, fallback?: number): any;
    readonly pageCount: number;
    /**
     * Returns interval from (exclusive) - to (inclusive); Offset is considered
     * as postgres does: OFFSET says to skip that many rows before beginning to return rows.
     *
     * @param {number} page
     * @param {boolean} noInterval
     */
    getOffsetByPage(page?: number, noInterval?: boolean): number | number[];
    getPageByOffset(offset: number): number;
    readonly offset: number | number[];
    readonly limit: any;
    isOutOfBounds(page?: number): boolean;
    getNextPage(page?: number): number | false;
    readonly nextPage: number | false;
    getPreviousPage(page?: number): number | false;
    readonly previousPage: number | false;
    readonly lastPage: number;
    readonly firstPage: number;
    isLastPage(page?: number): boolean;
    isFirstPage(page?: number): boolean;
    dump(): {
        itemsTotal: any;
        itemsPerPage: any;
        currentPage: number;
        pageCount: number;
        offsetByPage: number | number[];
        isOutOfBound: boolean;
        nextPage: number | boolean;
        previousPage: number | boolean;
        isLastPage: boolean;
        isFirstPage: boolean;
    };
}
