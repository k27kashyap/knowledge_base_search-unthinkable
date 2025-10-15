import React, { useState } from 'react';
import { Upload, MessageCircle, File, X, Send, Loader2 } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUploadedDocs(prev => [...prev, ...data.filenames]);
        setFiles([]);
        setMessages(prev => [...prev, {
          type: 'system',
          text: `✅ Successfully uploaded ${data.filenames.length} document(s)`
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'system',
        text: `❌ Error uploading files: ${error.message}`
      }]);
    } finally {
      setUploading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || uploadedDocs.length === 0) return;

    const userQuestion = question;
    setQuestion('');
    setMessages(prev => [...prev, { type: 'user', text: userQuestion }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuestion }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          type: 'assistant',
          text: data.answer,
          sources: data.sources
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'system',
          text: `❌ Error: ${data.error}`
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'system',
        text: `❌ Error: ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Document Q&A Assistant</h1>
          <p className="text-gray-600">Upload documents and ask questions - powered by Groq AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-pink-100 rounded-lg p-6 border border-pink-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Documents
              </h2>

              <div className="mb-4">
                <label className="block w-full">
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-300 transition">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                    <p className="text-sm text-gray-700">Click to select files</p>
                    <p className="text-xs text-gray-500 mt-1">PDF or TXT files</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {files.length > 0 && (
                <div className="mb-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-100 rounded p-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="w-4 h-4 text-blue-300 flex-shrink-0" />
                        <span className="text-sm text-gray-800 truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-500 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className="w-full bg-green-200 hover:bg-green-300 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-800 font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </>
                )}
              </button>

              {uploadedDocs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-pink-200">
                  <p className="text-sm text-gray-700 mb-2">Uploaded Documents:</p>
                  <div className="space-y-1">
                    {uploadedDocs.map((doc, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                        <File className="w-3 h-3" />
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-blue-50 rounded-lg border border-blue-200 flex flex-col h-[600px]">
              <div className="p-4 border-b border-blue-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Ask Questions
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Upload documents and start asking questions!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.type === 'user'
                            ? 'bg-pink-200 text-gray-800'
                            : msg.type === 'assistant'
                            ? 'bg-green-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800 text-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs opacity-75">Sources: {msg.sources.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-green-100 rounded-lg p-3">
                      <Loader2 className="w-5 h-5 animate-spin text-green-300" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-blue-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={uploadedDocs.length === 0 ? "Upload documents first..." : "Ask a question about your documents..."}
                    disabled={uploadedDocs.length === 0 || loading}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={!question.trim() || uploadedDocs.length === 0 || loading}
                    className="bg-pink-200 hover:bg-pink-300 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-800 font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
