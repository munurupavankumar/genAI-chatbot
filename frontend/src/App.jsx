// File: frontend/src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Paperclip, Send, Loader, File, FileText, Image, Globe, X } from 'lucide-react';

// API URL configuration
const API_BASE_URL = '/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [filePath, setFilePath] = useState('');
  const [fileType, setFileType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileSource, setFileSource] = useState('upload'); // 'upload' or 'url'
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    
    // Validate input
    if (!inputText.trim() && !selectedFile && !filePath.trim()) {
      setError('Please enter text or select a file');
      return;
    }
    
    // Add user message to chat
    let userMessage = inputText;
    if (selectedFile) {
      userMessage = `Summarize this file: ${selectedFile.name}`;
    } else if (filePath) {
      userMessage = `Summarize this URL: ${filePath}`;
    }
    
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setShowFileSelector(false);
    setIsLoading(true);

    try {
      let response;
      
      if (selectedFile) {
        // Option 1: Use the upload_and_summarize endpoint to do everything in one request
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (fileType) {
          formData.append('file_type', fileType);
        }
        
        response = await axios.post(`${API_BASE_URL}/upload_and_summarize`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      } else if (filePath) {
        // Handle URL
        response = await axios.post(`${API_BASE_URL}/summarize`, {
          url: filePath,
          file_type: fileType
        });
      } else {
        // Handle plain text
        response = await axios.post(`${API_BASE_URL}/summarize`, {
          text: inputText
        });
      }
      
      // Add bot response to chat
      const newBotMessage = {
        id: Date.now() + 1,
        text: response.data.summary,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Error details:', error);
      
      let errorMessage = 'An error occurred';
      
      if (error.response) {
        errorMessage = `Error: ${error.response.status} - ${error.response.data.detail || 'Unknown error'}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Check if the backend is running.';
      } else {
        errorMessage = `Request error: ${error.message}`;
      }
      
      // Add error message to chat
      const errorBotMessage = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        error: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      setFilePath('');
      setFileType('');
    }
  };

  const detectFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'txt':
        return 'text';
      default:
        return '';
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileType(detectFileType(file.name));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // File type icon mapping
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText size={20} className="text-red-500" />;
      case 'image':
        return <Image size={20} className="text-blue-500" />;
      case 'article':
        return <Globe size={20} className="text-green-500" />;
      default:
        return <File size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Summarization Chat</h1>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ded8]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              Send a message or upload a file to get a summary
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`rounded-lg p-3 max-w-xs md:max-w-md break-words relative ${
                  message.sender === 'user' 
                    ? 'bg-green-100 text-black'
                    : message.error 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-white text-black'
                }`}
              >
                {message.text}
                <div className="text-xs text-gray-500 text-right mt-1">
                  {message.timestamp}
                </div>
                {/* Triangle for chat bubble */}
                <div 
                  className={`absolute top-0 w-0 h-0 border-8 ${
                    message.sender === 'user'
                      ? 'right-0 -mr-3 border-l-green-100 border-t-green-100 border-r-transparent border-b-transparent'
                      : message.error
                        ? 'left-0 -ml-3 border-r-red-100 border-t-red-100 border-l-transparent border-b-transparent'
                        : 'left-0 -ml-3 border-r-white border-t-white border-l-transparent border-b-transparent'
                  }`}
                />
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Loader size={20} className="animate-spin text-green-600" />
                <span>Generating summary...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* File selector popup */}
      {showFileSelector && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select File</h3>
              <button 
                onClick={() => setShowFileSelector(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* File source toggle */}
            <div className="mb-4">
              <div className="flex border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFileSource('upload')}
                  className={`flex-1 p-2 text-center ${
                    fileSource === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setFileSource('url')}
                  className={`flex-1 p-2 text-center ${
                    fileSource === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  Enter URL
                </button>
              </div>
            </div>
            
            {fileSource === 'upload' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File:
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Paperclip size={24} className="text-gray-500 mb-2" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, Image, Text files
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
                {selectedFile && (
                  <div className="mt-2 flex items-center p-2 border rounded-md bg-blue-50">
                    {getFileIcon(fileType)}
                    <span className="ml-2 text-sm truncate">{selectedFile.name}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL:
                </label>
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Type:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['pdf', 'image', 'article', 'text'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFileType(type)}
                    className={`p-2 flex flex-col items-center rounded-md ${
                      fileType === type ? 'bg-blue-100 border border-blue-500' : 'border border-gray-200'
                    }`}
                  >
                    {getFileIcon(type)}
                    <span className="text-xs mt-1 capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (fileSource === 'upload' && !selectedFile) {
                    setError('Please select a file');
                    return;
                  }
                  if (fileSource === 'url' && !filePath.trim()) {
                    setError('Please enter a URL');
                    return;
                  }
                  handleSubmit();
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Input area */}
      <div className="bg-gray-200 p-3">
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowFileSelector(true)}
            className="p-2 bg-gray-300 rounded-full text-gray-700 hover:bg-gray-400"
          >
            <Paperclip size={20} />
          </button>
          
          <div className="flex-1 bg-white rounded-full relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
              className="w-full p-3 pr-12 rounded-full resize-none outline-none max-h-20"
              rows={1}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !selectedFile && !filePath.trim())}
            className="p-2 bg-green-600 rounded-full text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;