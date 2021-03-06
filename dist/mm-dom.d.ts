/**
 * Utilitka skusajuca matcher nad $el... ak matcher vrati false tak bude skusat
 * stastie **vyssie** u parenta az kym nenajde, alebo nehitne traverseLimit
 *
 * Note: v principe podobna ako $.closest() akurat v rozsirenou funcionalitov
 * matchovania a doplnenym traverse limitom
 *
 * @param {any} $el
 * @param matcher
 * @param {number} traverseLimit
 * @returns {any}
 */
export declare function mmUpWhileNotMatched($el: any, matcher: any, traverseLimit?: number): any;
/**
 * ported z https://github.com/edenspiekermann/a11y-dialog/blob/master/a11y-dialog.js
 *
 * @param $context
 */
export declare function mmGetFocusableEls($context: any): any;
