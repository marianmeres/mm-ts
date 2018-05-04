import { Paginator } from '../Paginator';

test('Paginator works', () => {
    const p = new Paginator(101, 10, 1);

    // sanity
    expect(p.itemsTotal).toEqual(101);
    expect(p.currentPage).toEqual(1);
    expect(p.itemsPerPage).toEqual(10);
    expect(p.limit).toEqual(10);
    expect(p.pageCount).toEqual(11);
    expect(p.offset).toEqual(0);

    // OFFSET says to skip that many rows before beginning to return rows.
    expect(p.getOffsetByPage(1)).toEqual(0);
    expect(p.getOffsetByPage(2)).toEqual(10);
    expect(p.getOffsetByPage(11)).toEqual(100);

    //
    expect(p.getPageByOffset(0)).toEqual(1);
    expect(p.getPageByOffset(9)).toEqual(1);
    expect(p.getPageByOffset(10)).toEqual(2);
    expect(p.getPageByOffset(11)).toEqual(2);
    expect(p.getPageByOffset(100)).toEqual(11);

    //
    expect(p.isOutOfBounds(0)).toEqual(false);
    expect(p.isOutOfBounds(1)).toEqual(false);
    expect(p.isOutOfBounds(11)).toEqual(false);
    expect(p.isOutOfBounds(12)).toEqual(true);

    // next page id
    expect(p.getNextPage()).toEqual(2);
    expect(p.getNextPage(10)).toEqual(11);
    expect(p.getNextPage(11)).toEqual(false);

    // previous page id
    expect(p.getPreviousPage()).toEqual(false);
    expect(p.getPreviousPage(11)).toEqual(10);
    expect(p.getPreviousPage(123)).toEqual(10);

    // last
    expect(p.isLastPage()).toEqual(false);
    expect(p.isLastPage(1)).toEqual(false);
    expect(p.isLastPage(5)).toEqual(false);
    expect(p.isLastPage(11)).toEqual(true);

    // first
    expect(p.isFirstPage()).toEqual(true);
    expect(p.isFirstPage(1)).toEqual(true);
    expect(p.isFirstPage(5)).toEqual(false);
    expect(p.isFirstPage(11)).toEqual(false);
    expect(p.isFirstPage(1102)).toEqual(false);

    //
    expect(p.dump()).toBeTruthy();
});
