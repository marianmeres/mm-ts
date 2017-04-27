import * as _ from "underscore";

/**
 * @param date
 * @returns {boolean}
 */
export function mm_isValidDate(date) {
    return (_.isDate(date) && !_.isNaN(date.valueOf()));
}

/**
 * @param year
 * @param month
 * @returns {number}
 */
export function mm_getDaysInMonth(year, month) {
    return (32 - new Date(year, month, 32).getDate());
}

/**
 * @param year
 * @param month
 * @returns {number}
 */
export function mm_getStartWeekday(year, month) {
    return new Date(year, month, 1).getDay();
}

/**
 * @param year
 * @returns {boolean}
 */
export function mm_isLeapYear(year) {
    return new Date(year, 1, 29).getMonth() === 1;
}

/**
 * @param d1
 * @param d2
 * @returns {Object|boolean}
 */
export function mm_isSameDay(d1:Date, d2:Date):boolean {
    return (
        mm_isValidDate(d1)
        && mm_isValidDate(d2)
        && d1.getFullYear() === d2.getFullYear()
        && d1.getMonth() === d2.getMonth()
        && d1.getDate()  === d2.getDate()
    );
}
