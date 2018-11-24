"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Nothing fancy, just basic calculations.
 */
class Paginator {
    constructor(itemsTotal, itemsPerPage = 10, currentPage = 1) {
        this._itemsPerPage = 10;
        this._currentPage = 1;
        this.itemsTotal = itemsTotal;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = currentPage;
    }
    get itemsTotal() {
        return this._itemsTotal;
    }
    set itemsTotal(v) {
        this._itemsTotal = this._assertNumber(v, 0);
    }
    get itemsPerPage() {
        return this._itemsPerPage;
    }
    set itemsPerPage(v) {
        this._itemsPerPage = Math.max(1, this._assertNumber(v));
    }
    get currentPage() {
        return this._currentPage;
    }
    set currentPage(v) {
        this._currentPage = Math.max(1, this._assertNumber(v));
    }
    _assertNumber(val, fallback = 1) {
        val = parseInt(val, 10);
        return Number.isNaN(val) ? fallback : val;
    }
    get pageCount() {
        return Math.ceil(this.itemsTotal / this.itemsPerPage);
    }
    /**
     * Returns interval from (exclusive) - to (inclusive); Offset is considered
     * as postgres does: OFFSET says to skip that many rows before beginning to return rows.
     *
     * @param {number} page
     * @param {boolean} noInterval
     */
    getOffsetByPage(page = null, noInterval = true) {
        page = page === null ? this.currentPage : this._assertNumber(page, 1);
        let out = [
            Math.max(this.itemsPerPage * (page - 1), 0),
            Math.min(this.itemsTotal, this.itemsPerPage * page),
        ];
        return noInterval ? out[0] : out;
    }
    getPageByOffset(offset) {
        offset = this._assertNumber(offset, 0);
        // moze byt aj zaporny, vtedy odratavam s total items
        if (offset < 0) {
            offset = Math.max(0, this.itemsTotal + offset);
        }
        // OFFSET says to skip that many rows before beginning to return rows.
        offset++;
        return Math.max(Math.ceil(offset / this.itemsPerPage), 1);
    }
    get offset() {
        return this.getOffsetByPage(null);
    }
    get limit() {
        return this.itemsPerPage;
    }
    isOutOfBounds(page = null) {
        page = page === null ? this.currentPage : this._assertNumber(page, 0);
        // lebo page 0 neexistuje, tak max(..., 1)
        return this.pageCount > 0 && this.pageCount < page;
    }
    getNextPage(page = null) {
        page = page === null ? this.currentPage : this._assertNumber(page, 1);
        let n = page + 1;
        return this.pageCount >= n ? n : false;
    }
    get nextPage() {
        return this.getNextPage(null);
    }
    getPreviousPage(page = null) {
        page = page === null ? this.currentPage : this._assertNumber(page, 1);
        let p = Math.max(0, Math.min(page - 1, this.pageCount - 1));
        return p !== 0 ? p : false;
    }
    get previousPage() {
        return this.getPreviousPage(null);
    }
    get lastPage() {
        return this.pageCount;
    }
    get firstPage() {
        return 1;
    }
    isLastPage(page = null) {
        page = page === null ? this.currentPage : this._assertNumber(page, 1);
        return page === this.pageCount;
    }
    isFirstPage(page = null) {
        page = page === null ? this.currentPage : this._assertNumber(page, 1);
        return page === 1;
    }
    dump() {
        return {
            itemsTotal: this.itemsTotal,
            itemsPerPage: this.itemsPerPage,
            currentPage: this.currentPage,
            pageCount: this.pageCount,
            offsetByPage: this.getOffsetByPage(),
            isOutOfBound: this.isOutOfBounds(),
            nextPage: this.getNextPage(),
            previousPage: this.getPreviousPage(),
            isLastPage: this.isLastPage(),
            isFirstPage: this.isFirstPage(),
        };
    }
}
exports.Paginator = Paginator;
