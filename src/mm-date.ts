import { isDate, isNaN } from 'lodash';

/**
 * @param date
 * @returns {boolean}
 */
export function mmIsValidDate(date) {
    return (isDate(date) && !isNaN(date.valueOf()));
}

/**
 * @param year
 * @param month
 * @returns {number}
 */
export function mmGetDaysInMonth(year, month) {
    return (32 - new Date(year, month, 32).getDate());
}

/**
 * @param year
 * @param month
 * @returns {number}
 */
export function mmGetStartWeekday(year, month) {
    return new Date(year, month, 1).getDay();
}

/**
 * @param year
 * @returns {boolean}
 */
export function mmIsLeapYear(year) {
    return new Date(year, 1, 29).getMonth() === 1;
}

/**
 * @param d1
 * @param d2
 * @returns {Object|boolean}
 */
export function mmIsSameDay(d1: Date, d2: Date): boolean {
    return (
        mmIsValidDate(d1)
        && mmIsValidDate(d2)
        && d1.getFullYear() === d2.getFullYear()
        && d1.getMonth() === d2.getMonth()
        && d1.getDate()  === d2.getDate()
    );
}

/**
 * @param d1
 * @param d2
 * @returns {Object|boolean}
 */
export function mmIsSameMonth(d1: Date, d2: Date): boolean {
    return (
        mmIsValidDate(d1)
        && mmIsValidDate(d2)
        && d1.getFullYear() === d2.getFullYear()
        && d1.getMonth() === d2.getMonth()
    );
}

/**
 * @param d
 * @returns {boolean}
 */
export function mmIsToday(d: Date): boolean {
    return mmIsSameDay(d, new Date());
}