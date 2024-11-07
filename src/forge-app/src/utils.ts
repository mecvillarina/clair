export function findAllValuesByKey(obj, key) {
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

export function getSeconds(value: "30 minutes" | "1 hour" | "3 hours" | "6 hours" | "12 hours" | "1 day") {

  switch (value) {
    case "30 minutes": return 30 * 60;
    case "1 hour": return 60 * 60;
    case "3 hours": return 3 * 60 * 60;
    case "6 hours": return 6 * 60 * 60;
    case "12 hours": return 12 * 60 * 60;
    case "1 day": return 24 * 60 * 60;
  }
}