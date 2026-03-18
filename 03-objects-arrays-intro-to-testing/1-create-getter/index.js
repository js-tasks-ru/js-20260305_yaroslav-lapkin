/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  if (path == null) {
    return;
  }
  const fields = path.split('.');
  return function (obj) {
    let result = obj;
    for (const field of fields) {
      if (result == null || !Object.hasOwn(result, field)) {
        return;
      }
      result = result[field];
    }
    return result;
  };
}
