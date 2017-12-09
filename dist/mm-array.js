"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
 * @param array
 * @returns {*}
 */
function mmShuffle(array) {
    let counter = array.length, temp, index;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index (between 0 and last)
        index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}
exports.mmShuffle = mmShuffle;
