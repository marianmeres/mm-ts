"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @param date
 * @returns {boolean}
 */
function mmIsValidDate(date) {
    return (date &&
        Object.prototype.toString.call(date) === '[object Date]' &&
        !isNaN(date));
}
exports.mmIsValidDate = mmIsValidDate;
/**
 * @param year
 * @param month
 * @returns {number}
 */
function mmGetDaysInMonth(year, month) {
    return 32 - new Date(year, month, 32).getDate();
}
exports.mmGetDaysInMonth = mmGetDaysInMonth;
/**
 * @param year
 * @param month
 * @returns {number}
 */
function mmGetStartWeekday(year, month) {
    return new Date(year, month, 1).getDay();
}
exports.mmGetStartWeekday = mmGetStartWeekday;
/**
 * @param year
 * @returns {boolean}
 */
function mmIsLeapYear(year) {
    return new Date(year, 1, 29).getMonth() === 1;
}
exports.mmIsLeapYear = mmIsLeapYear;
/**
 * @param d1
 * @param d2
 * @returns {Object|boolean}
 */
function mmIsSameDay(d1, d2) {
    return (mmIsValidDate(d1) &&
        mmIsValidDate(d2) &&
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate());
}
exports.mmIsSameDay = mmIsSameDay;
/**
 * @param d1
 * @param d2
 * @returns {Object|boolean}
 */
function mmIsSameMonth(d1, d2) {
    return (mmIsValidDate(d1) &&
        mmIsValidDate(d2) &&
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth());
}
exports.mmIsSameMonth = mmIsSameMonth;
/**
 * @param d
 * @returns {boolean}
 */
function mmIsToday(d) {
    return mmIsSameDay(d, new Date());
}
exports.mmIsToday = mmIsToday;
