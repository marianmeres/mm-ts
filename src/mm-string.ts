
/**
 * @param str
 * @returns {string}
 */
export function mmUcfirst(str: string): string {
    str += '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}


/**
 * http://stackoverflow.com/questions/5002111/javascript-how-to-strip-html-tags-from-string
 * @param str
 * @returns {string}
 */
export function mmStripHtml(str: string): string {
    let div = document.createElement('div');
    div.innerHTML = str;
    return (div.textContent || div.innerText) + '';
}


/**
 * http://phpjs.org/functions/nl2br/
 * @param str
 * @returns {string}
 */
export function mmNl2br(str: string): string {
    return (`${str}`).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br/>$2');
}


/**
 * @param {number} len
 * @param {string} prefix
 * @returns {string}
 */
export function mmGetRandomAlphaNumStr(len: number, prefix: string = ''): string {
    let salt = '';
    while (salt.length < len) {
        salt += Math.random().toString(36).substr(2);
    }
    return (prefix || '') + salt.substr(0, len);
}

/**
 * inspiration: https://github.com/klughammer/node-randomstring
 * @param options
 * @returns {string}
 */
export function mmGetRandomStr(
    options?: {
        length?: number,
        charset?: string;
        readable?: boolean;
        unique?: boolean;
        prefix?: string;
    }
) {
    options = Object.assign({
        length: 8,
        charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        readable: false,
        unique: false,
        prefix: '',
    }, options || {});

    let { length, charset, readable, unique, prefix } = options;

    // sanity
    if (isNaN(length) || length < 1 || length > 1024) {
        throw new Error('Invalid length');
    }

    if (readable) {
        charset = charset.replace(/[01oil]/ig, ''); // flag `i` makes it safe for later `toUpperCase`
    }

    if (unique) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
        // this is correct and cool, but TS keeps saying: Type 'Set<string>' is not an array type
        // charset = [...new Set(charset)].join(''); // oh yeah!
        // so to keep it quiet:
        charset = [...new Set(charset.split(''))].join('');
    }

    let out = '';

    while (length--) {
        out += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return prefix + out;
}

/**
 * credit: somewhere I don't remember...
 * @param amount
 * @param decimalsCount
 * @param decimalSeparator
 * @param thousandSeparator
 * @returns {string}
 */
export function mmFormatMoney(amount, decimalsCount, decimalSeparator, thousandSeparator): string {

    let n = amount;
    let c = decimalsCount;
    let d = decimalSeparator;
    let t = thousandSeparator;

    c = isNaN(c = Math.abs(c)) ? 2 : c; // number of decimals
    d = d === void 0 ? '.' : d;       // decimal separator
    t = t === void 0 ? ' ' : t;       // thousands separator
    let s = n < 0 ? '-' : '';           // sign
    let i = parseInt(n = Math.abs(+n || 0).toFixed(c), 10) + '';
    let j = i.length;
    j = j > 3 ? j % 3 : 0;

    return (
        s
        + (j ? i.substr(0, j) + t : '')
        + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t)
        + (c ? d + Math.abs(n - (i as any)).toFixed(c).slice(2) : '')
    );
}

/**
 * http://locutus.io/php/trim/
 * @param str
 * @param charlist
 * @returns {string}
 */
export function mmTrim(str: string, charlist?: string): string {
    let whitespace = [
        ' ', '\n', '\r', '\t', '\f', '\x0b', '\xa0', '\u2000', '\u2001', '\u2002',
        '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009',
        '\u200a', '\u200b', '\u2028', '\u2029', '\u3000'
    ].join('');
    let l = 0;
    let i = 0;
    str += '';
    if (charlist) {
        whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1');
    }
    l = str.length;
    for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i);
            break;
        }
    }
    l = str.length;
    for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 * @param str
 * @returns {string}
 */
export function mmEscapeRegExp(str: string): string {
    return (str + '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * @returns {string}
 */
export function mmUid(length?: number) {
    let s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toLowerCase();

    if (!length) { // quasi uuid
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    // custom length
    let c = Math.ceil(length / 4);
    let out = '';
    for (let i = 0; i < c; i++) { out += s4(); }
    return out.substr(0, length);
}

/**
 * https://stackoverflow.com/questions/10045122/replace-many-values-in-a-string-based-on-search-replace-pairs
 * https://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings/15604206
 *
 * @param str
 * @param map
 * @param {boolean} ignoreCase
 * @returns {string | any | void}
 */
export function mmReplaceMap(str, map, ignoreCase = false) {
    let patterns = [];
    Object.keys(map).forEach((k) => patterns.push(mmEscapeRegExp(k)));
    let regExp = new RegExp(patterns.join('|'), 'g' + (ignoreCase ? 'i' : ''));
    return str.replace(regExp, (match) => {
        if (ignoreCase) {
            match = match.toLowerCase();
        }
        let replaced = map[match];
        if (replaced === null || replaced === void 0) {
            return '';
        }
        return replaced;
    });
}

/**
 * https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
 * I guess more robust alternative: https://github.com/andrewrk/node-diacritics.git
 * @param str
 */
export function mmUnaccent(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}