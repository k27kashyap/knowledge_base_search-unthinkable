import axios from 'axios';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2';

export async function getEmbedding(text, apiKey) {
  try {
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      { inputs: text },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Some models return embeddings inside an array: handle that
    if (Array.isArray(response.data) && Array.isArray(response.data[0])) {
      return response.data[0];
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 503) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return getEmbedding(text, apiKey);
    }
    throw new Error(`Embedding error: ${error.message}`);
  }
}

export async function getEmbeddings(texts, apiKey) {
  const embeddings = [];
  for (const text of texts) {
    embeddings.push(await getEmbedding(text, apiKey));
  }
  return embeddings;
}


// import axios from 'axios';

// const API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

// export async function getEmbedding(text, apiKey) {
//   try {
//     const res = await axios.post(API_URL, { inputs: text }, { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } });
//     return res.data;
//   } catch (err) {
//     if (err.response?.status === 503) { await new Promise(r => setTimeout(r, 2000)); return getEmbedding(text, apiKey); }
//     throw new Error(err.message);
//   }
// }

// export async function getEmbeddings(texts, apiKey) {
//   const out = [];
//   for (const t of texts) out.push(await getEmbedding(t, apiKey));
//   return out;
// }
