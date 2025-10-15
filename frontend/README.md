🧠 Knowledge-Base Search Engine

A lightweight LLM-powered RAG system that lets users upload documents, store them, and ask natural-language questions to get synthesized answers.

🚀 Features

Upload and process PDF/TXT documents

Automatic text extraction and embedding

Semantic question answering

MongoDB storage for documents and embeddings

Simple React frontend for interaction

⚙️ Tech Stack

Frontend: React, TailwindCSS
Backend: Node.js, Express, MongoDB
AI Layer: Hugging Face Embeddings + LLM

🧩 Setup
Backend
cd backend
npm install


Create a .env file:

MONGO_URI=your_mongo_uri
HUGGINGFACE_API_KEY=your_hf_key
PORT=5000


Run:

node server.js

Frontend
cd frontend
npm install
npm start

💡 Usage

Upload a document (PDF or TXT)

Ask questions in natural language

Get concise, context-aware answers instantly

📦 API
Method	Endpoint	Description
POST	/api/upload	Upload a document
POST	/api/ask	Ask a question
GET	/api/documents	View uploaded files
👩‍💻 Author

Khushi Kashyap
Full-Stack Developer & AI Integrator