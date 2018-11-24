"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @param ms
 */
exports.mmDelay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
