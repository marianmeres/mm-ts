"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://www.typescriptlang.org/docs/handbook/mixins.html
exports.mmApplyMixins = (derivedCtor, baseCtors) => {
    baseCtors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
};
