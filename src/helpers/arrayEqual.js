/**
 * Very simple array comparison
 */
const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  // defining for loops with airbnb config is a pain maybe should disable some rules
  // eslint-disable-next-line
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

export default arraysEqual;
