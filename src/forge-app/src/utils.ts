export function findAllValuesByKey(obj, key) 
{
    let values = [];
  
    function recursiveSearch(obj) {
      if (obj.hasOwnProperty(key)) {
        values.push(obj[key]);
      }
  
      for (let k in obj) {
        if (typeof obj[k] === "object" && obj[k] !== null) {
          recursiveSearch(obj[k]);
        }
      }
    }
  
    recursiveSearch(obj);
    return values;
}