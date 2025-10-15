import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  content: { type: String, required: true },
  chunks: [{ text: String, embedding: [Number], index: Number }],
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Document', documentSchema);
