// /**
//  * Selman Kahya, 2013
//  * See project's Github page for usage details.
//  * https://github.com/Selmanh
//  */

// /**
//  * takes nested mysql result array as a parameter,
//  * converts it to a nested object
//  *
//  * @param {Array} rows
//  * @param {Array} nestingOptions
//  * @return {Object}
//  */
// export function convertToNested(rows, nestingOptions) {
//   if (rows == null || nestingOptions == null) return rows;

//   const levels = nestingOptions;

//   // put similar objects in the same bucket (by table name)
//   const buckets = [];

//   for (let i = 0; i < levels.length; i++) {
//     const result = [];

//     const level = levels[i];
//     const key = level.key;
//     const tableName = level.tableName;

//     for (let j = 0; j < rows.length; j++) {
//       const object = rows[j][tableName];

//       // check if object has key property
//       if (object == null) {
//         console.log(
//           "Error: couldn't find " + tableName + ' property in mysql result set',
//         );
//         continue;
//       }

//       // if object isn't in result array, then push it
//       if (!isExist(result, key, object[key])) result.push(object);
//     }
//     buckets.push(result);
//   }

//   // we have similar objects in the same bucket
//   // now, move lower level objects into related upper level objects
//   for (let i = buckets.length - 1; i >= 1; i--) {
//     let relationKey = levels[i - 1].key;
//     const relationTable = levels[i].tableName;
//     const objects = buckets[i];

//     for (let j = 0; j < objects.length; j++) {
//       let value,
//         indexes = null;
//       const object = objects[j];

//       // if couldn't find foreign key value in upper level, look to upper levels
//       let targetBucket,
//         a = 1;
//       while (indexes == null && i - a >= 0) {
//         targetBucket = buckets[i - a];

//         // if lower level table doesn't have upper level table's primary column as foreign key
//         // then upper table has a foreign key to lower table
//         if (
//           levels[i].hasOwnProperty('hasForeignKeyToUpperTable') &&
//           !levels[i].hasForeignKeyToUpperTable
//         )
//           relationKey = levels[i].key;
//         else relationKey = levels[i - a].key;

//         value = object[relationKey];
//         indexes = getIndexes(targetBucket, relationKey, value);
//         a++;
//       }

//       // relation to upper object(s) not found - ignore this object
//       if (indexes == null || indexes.length == 0) continue;

//       for (let z = 0; z < indexes.length; z++) {
//         if (!targetBucket[indexes[z]][relationTable])
//           targetBucket[indexes[z]][relationTable] = [];

//         targetBucket[indexes[z]][relationTable].push(object);
//       }
//     }
//   }

//   // at the end, we have all the nested objects in the first bucket
//   return buckets[0];
// }

// /**
//  * returns indexes of the object that has given key property,
//  * and the value of that property equals to given value
//  *
//  * @param {Array} objects
//  * @param {String} key
//  * @param {String} value
//  * @return {Array}
//  */
// function getIndexes(objects, key, value) {
//   if (objects == null || key == null || value == null) return null;

//   const result = [];

//   for (let i = 0; i < objects.length; i++) {
//     if (objects[i][key] == value) {
//       result.push(i);
//     }
//   }

//   return result;
// }

// /**
//  * checks if one of the objects in an array has the given property,
//  * and the value of that property equals to given value
//  *
//  * @param {Array} array
//  * @param {String} key
//  * @param {String} value
//  * @return {Array}
//  */
// //
// function isExist(array, key, value) {
//   for (let i = 0; i < array.length; i++) {
//     if (array[i][key] == value) return true;
//   }

//   return false;
// }
