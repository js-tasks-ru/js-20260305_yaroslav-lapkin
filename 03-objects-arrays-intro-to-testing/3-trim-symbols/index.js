/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let res = '';
  let count = 0;
  if (size === undefined || string.length <= size) {
    return string;
  }

  for (let i = 0; i < string.length; i++) {
    if (string[i] === string[i - 1]) {
      count++;
    } else {
      count = 1;
    }
    
    if (count <= size) {
      res += string[i];
    }
  }
  return res;
}