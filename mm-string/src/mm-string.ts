
/**
 * @param string
 * @returns {string}
 */
export function mm_ucfirst(string:string):string {
    string += '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}


/**
 * http://stackoverflow.com/questions/5002111/javascript-how-to-strip-html-tags-from-string
 * @param string
 * @returns {string}
 */
export function mm_stripHtml(string:string):string {
    let div = document.createElement("div");
    div.innerHTML = string;
    return (div.textContent || div.innerText) + "";
}


/**
 * http://phpjs.org/functions/nl2br/
 * @param str
 * @returns {string}
 */
export function mm_nl2br(str:string):string {
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br/>$2');
}


/**
 * @param len
 * @returns {string}
 */
export function mm_getRandomAlphaNumStr(len:number):string {
    let salt = "";
    while (salt.length < len) {
        salt += Math.random().toString(36).substr(2);
    }
    return salt.substr(0, len);
}

/**
 * credit: somewhere I don't remember, code not mine...
 * @param n   int/float
 * @param c   number of decimals
 * @param d   decimal separator
 * @param t   thousands separator
 * @returns {string}
 */
export function mm_formatMoney(n, c, d, t):string {
    c = isNaN(c = Math.abs(c)) ? 2 : c; // number of decimals
    d = d == undefined ? "." : d;       // decimal separator
    t = t == undefined ? " " : t;       // thousands separator
    let s = n < 0 ? "-" : "";           // sign
    let i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
    let j = i.length;
    j = j > 3 ? j % 3 : 0;

    return (
        s
        + (j ? i.substr(0, j) + t : "")
        + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t)
        + (c ? d + Math.abs(n - (i as any)).toFixed(c).slice(2) : "")
    );
}

/**
 * http://locutus.io/php/trim/
 * @param str
 * @param charlist
 * @returns {string}
 */
export function mm_trim(str:string, charlist?:string):string {
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
 * @param string
 * @returns {string}
 */
export function mm_escapeRegExp(string:string):string {
    return (string + '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}