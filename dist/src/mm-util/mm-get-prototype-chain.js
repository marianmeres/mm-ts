"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isPlainObject_1 = require("lodash-es/isPlainObject");
/**
 * hm...
 * @param obj
 * @returns {any}
 */
exports.mmGetPrototypeChain = (obj) => {
    if (obj === null) {
        return null;
    }
    if (typeof obj !== 'object') {
        return null;
    }
    let proto = Object.getPrototypeOf(obj);
    let out = [];
    while (!isPlainObject_1.default(proto)) {
        out.push(proto);
        proto = Object.getPrototypeOf(proto);
    }
    return out.length ? out : null;
};
