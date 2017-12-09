declare const $:JQueryStatic;

const _isFunction = (obj) => {
    return !!(obj && obj.constructor && obj.call && obj.apply);
};

/**
 * Utilitka skusajuca matcher nad $el... ak matcher vrati false tak bude skusat
 * stastie **vyssie** u parenta az kym nenajde, alebo nehitne traverseLimit
 *
 * Note: v principe podobna ako $.closest() akurat v rozsirenou funcionalitov
 * matchovania a doplnenym traverse limitom
 *
 * @param $el
 * @param matcher
 * @param traverseLimit
 * @returns {any}
 */
export function mmUpWhileNotMatched($el:JQuery, matcher, traverseLimit = 5) {
    if (!_isFunction(matcher)) return false; // no-op

    let matched = matcher($el);
    let counter = 0;

    // dolezite: traverseLimit chceme urcite dat **nejake** pozitivne cele cislo,
    // lebo inak tu mame riziko endless loop...

    // 1. set default ak nie je digit (toto odchyti undefined ako aj ine hodnoty a typy)
    //    note: tu sa nespolieham na typescript
    if (!/^\d+$/.test(traverseLimit as any)) { // interne precastuje na string
        traverseLimit = 5;
    }

    // 2. explicit cast na int (aby nizsie porovnanie zbehlo korektne)
    //    Note: NaN tu nemusime testovat, lebo vyssi regex uz validoval...
    traverseLimit = parseInt(traverseLimit as any);

    // explicit false check, not just falsey... keby sme sa pytali iba na falsey
    // tak by neslo rozlisit medzi regulernou falsey a not found
    while (matched === false) {
        $el = $el.parent();
        if (!$el || (traverseLimit && ++counter == traverseLimit)) {
            break;
        }
        matched = matcher($el);
    }

    return matched;
}

/**
 * ported z https://github.com/edenspiekermann/a11y-dialog/blob/master/a11y-dialog.js
 * @param $context
 * @returns {JQuery}
 */
export function mmGetFocusableEls($context:JQuery) {
    let focusableElements = [
        'a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])',
        'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object',
        'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'
    ];

    return $(focusableElements.join(','), $context).filter(function(index) {
        let child = $(this).get(0);
        return !!(child.offsetWidth || child.offsetHeight || child.getClientRects().length);
    });
}
