/**
 * @param str
 * @returns {string}
 */
export declare function mmUcfirst(str: string): string;
/**
 * http://stackoverflow.com/questions/5002111/javascript-how-to-strip-html-tags-from-string
 * @param str
 * @returns {string}
 */
export declare function mmStripHtml(str: string): string;
/**
 * http://phpjs.org/functions/nl2br/
 * @param str
 * @returns {string}
 */
export declare function mmNl2br(str: string): string;
/**
 * @param {number} len
 * @param {string} prefix
 * @returns {string}
 */
export declare function mmGetRandomAlphaNumStr(len: number, prefix?: string): string;
/**
 * inspiration: https://github.com/klughammer/node-randomstring
 * @param options
 * @returns {string}
 */
export declare function mmGetRandomStr(options?: {
    length?: number;
    charset?: string;
    readable?: boolean;
    unique?: boolean;
    prefix?: string;
}): string;
/**
 * credit: somewhere I don't remember...
 * @param amount
 * @param decimalsCount
 * @param decimalSeparator
 * @param thousandSeparator
 * @returns {string}
 */
export declare function mmFormatMoney(amount: any, decimalsCount: any, decimalSeparator: any, thousandSeparator: any): string;
/**
 * http://locutus.io/php/trim/
 * @param str
 * @param charlist
 * @returns {string}
 */
export declare function mmTrim(str: string, charlist?: string): string;
/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 * @param str
 * @returns {string}
 */
export declare function mmEscapeRegExp(str: string): string;
/**
 * creates quasi uuid
 * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * @returns {string}
 */
export declare function mmUid(length?: number): string;
/**
 * https://stackoverflow.com/questions/10045122/replace-many-values-in-a-string-based-on-search-replace-pairs
 * https://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings/15604206
 *
 * @param str
 * @param map
 * @param {boolean} ignoreCase
 * @returns {string | any | void}
 */
export declare function mmReplaceMap(str: any, map: any, ignoreCase?: boolean): any;
/**
 * https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
 * I guess more robust alternative: https://github.com/andrewrk/node-diacritics.git
 * @param str
 */
export declare function mmUnaccent(str: any): any;
export declare function mmHashCode(str: any): number;
