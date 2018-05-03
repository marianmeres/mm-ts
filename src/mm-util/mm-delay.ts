/**
 * @param ms
 */
export const mmDelay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
