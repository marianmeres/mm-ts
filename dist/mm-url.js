"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This function parses ampersand-separated name=value argument pairs from
 * the query string of the URL. It stores the name=value pairs in
 * properties of an object and returns that object. Use it like this:
 *
 * var args = urlArgs(); // Parse args from URL
 * var q = args.q || ""; // Use argument, if defined, or a default value * var n = args.n ? parseInt(args.n) : 10;
 *
 * @param query
 * @param separator
 * @returns {{}}
 */
function mmParseQuery(query, separator = '&') {
    query = query || window.location.search.substring(1);
    let out = {};
    let pairs = query.split(separator);
    for (let i = 0; i < pairs.length; i++) {
        let pos = pairs[i].indexOf('=');
        if (pos === -1) {
            continue;
        }
        let name = pairs[i].substring(0, pos);
        out[name] = decodeURIComponent(pairs[i].substring(pos + 1));
    }
    return out;
}
exports.mmParseQuery = mmParseQuery;
/**
 * https://gist.github.com/jlong/2428561
 * @param url
 * @param key
 * @returns {{protocol: string, hostname: string, port: string, pathname: string, search: string, hash: string}}
 */
function mmParseUrl(url, key) {
    let out = {
        protocol: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: '',
    };
    let parser = document.createElement('a');
    parser.href = url || window.location.href;
    Object.keys(out).forEach((k) => (out[k] = parser[k] || ''));
    return key ? out[key] : out;
}
exports.mmParseUrl = mmParseUrl;
/**
 * @param url
 */
exports.mmParseUrlRegex = (url) => {
    // [1] = protocol://,
    // [2] = host:port,
    // [3] = host,
    // [4] = IPv6_host,
    // [5] = IPv4_host,
    // [6] = :port,
    // [7] = port,
    // [8] = uri,
    // [9] = rest (query / fragment)
    const parsed = new RegExp('(^https?://)?(((\\[[^\\]]+])|([^:/?#]+))(:(\\d+))?)?([^?#]*)(.*)?').exec(url);
    // console.log(parsed);
    const rest = (parsed[9] || '').split('#');
    const protocol = `${parsed[1] || ''}`.replace('//', '');
    // normalize to same output as mmParseUrl (client side)
    return {
        protocol,
        hostname: `${protocol ? parsed[3] : ''}`,
        port: parsed[7] || '',
        pathname: parsed[8] || '',
        search: rest[0] || '',
        hash: rest[1] ? `#${rest[1]}` : '',
    };
};
