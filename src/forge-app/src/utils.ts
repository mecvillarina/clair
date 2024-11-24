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

export function getSeconds(value: string) {
  switch (value) {
    case "7 days": return 7 * 24 * 60 * 60;
    case "14 days": return 14 * 24 * 60 * 60;
    case "30 days": return 30 * 24 * 60 * 60;
    default: return 24 * 60 * 60;
  }
}

export function calculateCosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

export function calculateRecencyScore(documentDate, lambda = 0.001) {
  const now = new Date();
  const documentTimestamp = new Date(documentDate).getTime();
  const timeDifference = (now.getTime() - documentTimestamp) / (1000 * 60 * 60 * 24); // Convert to days
  return Math.exp(-lambda * timeDifference);
}

export function calculate75thPercentile(scores) {
  // Sort the scores in ascending order
  scores.sort((a, b) => a - b);

  // Calculate the index for the 75th percentile
  const index = Math.ceil(0.75 * scores.length) - 1;

  // Return the score at the 75th percentile index
  return scores[index];
}
