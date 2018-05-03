import isPlainObject from 'lodash-es/isPlainObject';

/**
 * hm...
 * @param obj
 * @returns {any}
 */
export const mmGetPrototypeChain = (obj) => {
    if (obj === null) {
        return null;
    }

    if (typeof obj !== 'object') {
        return null;
    }

    let proto = Object.getPrototypeOf(obj);
    let out = [];

    while (!isPlainObject(proto)) {
        out.push(proto);
        proto = Object.getPrototypeOf(proto);
    }

    return out.length ? out : null;
};
