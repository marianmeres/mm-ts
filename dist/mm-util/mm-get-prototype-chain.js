"use strict";
// import isPlainObject from 'lodash-es/isPlainObject';
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
/**
 * hm...q
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
    while (!lodash_1.isPlainObject(proto)) {
        out.push(proto);
        proto = Object.getPrototypeOf(proto);
    }
    return out.length ? out : null;
};
