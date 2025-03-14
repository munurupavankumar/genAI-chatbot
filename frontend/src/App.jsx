import React, { useState } from 'react';
import axios from 'axios';
import Header from './components/Header';
import MessageList from './components/MessageList';
import FileSelector from './components/FileSelector';
import MessageInput from './components/MessageInput';
import { detectFileType } from './utils/fileUtils';
import { API_BASE_URL } from './config/api';

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileType(detectFileType(file.name) || 'image'); // Default to 'image' for camera captures
      
      // If the file is from the camera, automatically submit it
      if (e.target.hasAttribute('capture')) {
        setTimeout(() => handleSubmit(), 100);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
      />
      
      <FileSelector 
        showFileSelector={showFileSelector}
        setShowFileSelector={setShowFileSelector}
        selectedFile={selectedFile}
        handleFileChange={handleFileChange}
        fileType={fileType}
        setFileType={setFileType}
        filePath={filePath}
        setFilePath={setFilePath}
        fileSource={fileSource}
        setFileSource={setFileSource}
        handleSubmit={handleSubmit}
        setError={setError}
      />
      
      <MessageInput 
        inputText={inputText}
        setInputText={setInputText}
        handleSubmit={handleSubmit}
        handleKeyDown={handleKeyDown}
        isLoading={isLoading}
        setShowFileSelector={setShowFileSelector}
        selectedFile={selectedFile}
        filePath={filePath}
        error={error}
        handleFileChange={handleFileChange}
      />
    </div>
  );
}

export default App;