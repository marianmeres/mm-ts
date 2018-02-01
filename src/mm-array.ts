
/**
 * http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
 * @param array
 * @returns {*}
 */
export function mmShuffle(array) {
  let counter = array.length;
  let temp;
  let index;

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