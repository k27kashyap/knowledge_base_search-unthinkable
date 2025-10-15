import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import Groq from 'groq-sdk';

import Document from './models/Document.js';
import { extractText, chunkText } from './utils/textExtractor.js';
import { getEmbedding, getEmbeddings } from './utils/embeddings.js';
import { findTopKSimilar } from './utils/vectorSearch.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    try { await fs.mkdir(uploadDir, { recursive: true }); cb(null, uploadDir); } 
    catch (err) { cb(err, null); }
  },
  filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});

const upload = multer({ storage });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.post('/api/upload', upload.array('documents'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, error: 'No files uploaded' });

    const uploadedFiles = [];
    for (const file of req.files) {
      const fileType = file.originalname.endsWith('.pdf') ? 'pdf' : 'txt';
      const text = await extractText(file.path, fileType);
      const chunks = chunkText(text);
      console.log(`Processing ${chunks.length} chunks for ${file.originalname}...`);
      const embeddings = await getEmbeddings(chunks, process.env.HUGGINGFACE_API_KEY);
      const chunksWithEmbeddings = chunks.map((chunk, i) => ({ text: chunk, embedding: embeddings[i], index: i }));

      const document = new Document({ filename: file.originalname, content: text, chunks: chunksWithEmbeddings });
      await document.save();
      uploadedFiles.push(file.originalname);
      await fs.unlink(file.path);
    }

    res.json({ success: true, filenames: uploadedFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'Query is required' });

    const queryEmbedding = await getEmbedding(query, process.env.HUGGINGFACE_API_KEY);
    const documents = await Document.find();
    let allChunks = [];
    documents.forEach(doc => allChunks.push(...doc.chunks.map(chunk => ({ ...chunk._doc, filename: doc.filename }))));

    const topK = findTopKSimilar(queryEmbedding, allChunks, 3);
    res.json({ success: true, results: topK.map(item => ({ text: item.chunk.text, filename: item.chunk.filename, similarity: item.similarity })) });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: err.message }); }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
