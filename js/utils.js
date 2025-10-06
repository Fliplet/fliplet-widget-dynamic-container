/**
 * Get nested property value from object using dot notation or array path
 * Replacement for _.get()
 * @param {Object} object - Source object
 * @param {string|Array|symbol} path - Property path (string with dots, array of keys, or symbol)
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} Value at path or defaultValue
 */
function get (object, path, defaultValue) {
  // Handle null or undefined object
  if (object === null || object === undefined) {
    return defaultValue;
  }

  // Handle empty array path - return default value if provided, otherwise undefined
  if (Array.isArray(path) && path.length === 0) {
    return defaultValue !== undefined ? defaultValue : undefined;
  }

  // Convert path to array if it's a string
  let pathArray;

  if (typeof path === 'string') {
    // Check if the key exists as a direct property first (key over path behavior)
    if (object.hasOwnProperty(path)) {
      return object[path];
    }

    // Handle bracket notation like 'a[]' or 'a[1]'
    if (path.includes('[') && path.includes(']')) {
      // Split on brackets and handle empty brackets specially
      const parts = path.split(/\[|\]/);

      pathArray = [];

      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          // Even indices are the parts before brackets
          if (parts[i] !== '') {
            const dotParts = parts[i].split('.');

            for (let j = 0; j < dotParts.length; j++) {
              if (dotParts[j] !== '') {
                pathArray.push(dotParts[j]);
              }
            }
          }
        } else if (parts[i] === '') {
          // Odd indices are the bracket contents - empty bracket means empty string key
          pathArray.push('');
        } else {
          pathArray.push(parts[i]);
        }
      }
    } else if (path === '') {
      // Empty string should create a property with empty string key
      pathArray = [''];
    } else {
      pathArray = path.split('.').filter(part => part !== '');
    }
  } else if (Array.isArray(path)) {
    pathArray = path;
  } else {
    // Handle other types
    pathArray = [path];
  }

  // If path array is empty, return undefined (like lodash baseGet)
  if (pathArray.length === 0) {
    return defaultValue !== undefined ? defaultValue : undefined;
  }

  // Navigate through the object using the path
  let result = object;

  for (let i = 0; i < pathArray.length; i++) {
    const key = pathArray[i];

    // If result is null or undefined, return default value
    if (result === null || result === undefined) {
      return defaultValue;
    }

    // Get the value at the current key
    result = result[key];
  }

  // Return the result or default value if undefined
  return result !== undefined ? result : defaultValue;
}

/**
 * Performs a deep comparison between object and source to determine if object contains equivalent property values
 * Replacement for _.isMatch()
 * @param {Object} object - Object to inspect
 * @param {Object} source - Object of property values to match
 * @returns {boolean} Returns true if object is a match, else false
 */
function isMatch (object, source) {
  // Handle null/undefined source - always return true
  if (source === null || source === undefined) {
    return true;
  }

  // Handle null/undefined object - only return true if source is empty
  if (object === null || object === undefined) {
    return Array.isArray(source) ? source.length === 0 : Object.keys(source).length === 0;
  }

  // Special case: if both are arrays, use array comparison directly
  if (Array.isArray(object) && Array.isArray(source)) {
    // For arrays, check if source array is a subsequence of object array
    let objectIndex = 0;

    for (let j = 0; j < source.length; j++) {
      let found = false;

      // Look for the current source element starting from the current object index
      for (let k = objectIndex; k < object.length; k++) {
        // For primitive values, use direct comparison
        if (typeof source[j] !== 'object' || source[j] === null) {
          if (source[j] === object[k]) {
            found = true;
            objectIndex = k + 1; // Move past this element
            break;
          }
        } else if (isMatch(object[k], source[j])) {
          // For objects, use recursive comparison
          found = true;
          objectIndex = k + 1; // Move past this element
          break;
        }
      }

      if (!found) {
        return false;
      }
    }

    return true;
  }

  // Get all keys from source
  const sourceKeys = Object.keys(source);

  // If source is empty, return true
  if (sourceKeys.length === 0) {
    return true;
  }

  // Check each property in source
  for (let i = 0; i < sourceKeys.length; i++) {
    const key = sourceKeys[i];
    const sourceValue = source[key];
    const objectValue = object[key];

    // Deep comparison for objects and arrays
    if (sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      if (objectValue === null || typeof objectValue !== 'object' || Array.isArray(objectValue)) {
        return false;
      }

      if (!isMatch(objectValue, sourceValue)) {
        return false;
      }
    } else if (Array.isArray(sourceValue)) {
      if (!Array.isArray(objectValue)) {
        return false;
      }

      // For arrays, check if source array is a subsequence of object array
      // This means elements must appear in the same order, but not necessarily consecutively
      let objectIndex = 0;

      for (let j = 0; j < sourceValue.length; j++) {
        let found = false;

        // Look for the current source element starting from the current object index
        for (let k = objectIndex; k < objectValue.length; k++) {
          // For primitive values, use direct comparison
          if (typeof sourceValue[j] !== 'object' || sourceValue[j] === null) {
            if (sourceValue[j] === objectValue[k]) {
              found = true;
              objectIndex = k + 1; // Move past this element
              break;
            }
          } else if (isMatch(objectValue[k], sourceValue[j])) {
            // For objects, use recursive comparison
            found = true;
            objectIndex = k + 1; // Move past this element
            break;
          }
        }

        if (!found) {
          return false;
        }
      }
    } else {
      // Handle special cases for primitive values
      if (sourceValue === 0 && objectValue === -0) {
        continue;
      }

      if (sourceValue === -0 && objectValue === 0) {
        continue;
      }

      // For undefined, the object must have the property with undefined value
      if (sourceValue === undefined) {
        if (!(key in object) || objectValue !== undefined) {
          return false;
        }

        continue;
      }

      if (sourceValue !== objectValue) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Iterates over elements of collection, returning an array of all elements predicate returns truthy for
 * Replacement for _.filter()
 * @param {Array|Object} collection - Collection to iterate over
 * @param {Function|Object|string} predicate - Function invoked per iteration, object for property matching, or string for property access
 * @returns {Array} Returns the new filtered array
 */
function filter (collection, predicate) {
  // Handle null/undefined collection
  if (collection === null || collection === undefined) {
    return [];
  }

  // Handle non-array, non-object input
  if (!Array.isArray(collection) && (typeof collection !== 'object' || collection === null)) {
    return [];
  }

  // Convert shorthand predicates to function
  let predicateFn = predicate;

  if (typeof predicate === 'string') {
    // Property shorthand: 'a' -> function(value) { return get(value, 'a'); }
    predicateFn = (value) => get(value, predicate);
  } else if (typeof predicate === 'object' && predicate !== null && !Array.isArray(predicate)) {
    // Matches shorthand: {a: 1} -> function(value) { return isMatch(value, {a: 1}); }
    predicateFn = (value) => isMatch(value, predicate);
  }

  const result = [];

  if (Array.isArray(collection)) {
    // Handle arrays
    for (let i = 0; i < collection.length; i++) {
      const value = collection[i];

      if (predicateFn(value, i, collection)) {
        result.push(value);
      }
    }
  } else {
    // Handle objects
    const keys = Object.keys(collection);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = collection[key];

      if (predicateFn(value, key, collection)) {
        result.push(value);
      }
    }
  }

  return result;
}

window.FlipletDynamicContainerUtils = {
    get,
    isMatch,
    filter
}