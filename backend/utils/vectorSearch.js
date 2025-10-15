export function cosineSimilarity(a, b) {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (magA * magB);
}

export function findTopKSimilar(queryEmbedding, chunks, k = 3) {
  const sims = chunks.map((c, i) => ({ chunk: c, index: i, similarity: cosineSimilarity(queryEmbedding, c.embedding) }));
  sims.sort((a, b) => b.similarity - a.similarity);
  return sims.slice(0, k);
}
