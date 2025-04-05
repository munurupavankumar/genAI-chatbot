import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import MessageList from './components/MessageList';
import FileSelector from './components/FileSelector';
import MessageInput from './components/MessageInput';
import Welcome from './components/Welcome';
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
  const [pendingSubmission, setPendingSubmission] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('te'); // Default to Telugu

  // Effect to handle file submissions, triggered when selectedFile changes
  useEffect(() => {
    if (selectedFile && pendingSubmission) {
      handleSubmit();
      setPendingSubmission(false);
    }
  }, [selectedFile, pendingSubmission]);

  // Format the summary text with markdown-like formatting
  const formatSummary = (text) => {
    // Add a header
    let formattedText = `**Summary:**\n\n`;
    
    // Split the text into paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    // Process each paragraph
    paragraphs.forEach((paragraph, index) => {
      // Check if this looks like a list of items
      if (paragraph.includes('. ') && !paragraph.includes('\n')) {
        // Convert to bullet points if it's a short paragraph with sentences
        const sentences = paragraph.split(/(?<=\. )/);
        if (sentences.length > 1 && sentences.every(s => s.length < 100)) {
          sentences.forEach(sentence => {
            if (sentence.trim()) {
              formattedText += `- ${sentence.trim()}\n`;
            }
          });
          formattedText += '\n';
        } else {
          formattedText += `${paragraph}\n\n`;
        }
      } 
      // Check if this looks like it could be a key point
      else if (paragraph.length < 100 && !paragraph.endsWith('.')) {
        formattedText += `**${paragraph}**\n\n`;
      }
      // Regular paragraph
      else {
        formattedText += `${paragraph}\n\n`;
      }
    });
    
    return formattedText.trim();
  };

  // Create file preview URL for images
  const createFilePreview = (file) => {
    if (!file) return null;
    
    // Check if file is an image
    const isImage = file.type.startsWith('image/');
    
    if (isImage) {
      return URL.createObjectURL(file);
    }
    
    return null; // For non-image files, no preview
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileType(detectFileType(file.name) || 'image'); // Default to 'image' for camera captures
      
      // If the file is from the camera, mark it for submission
      if (e.target.hasAttribute && e.target.hasAttribute('capture')) {
        setPendingSubmission(true);
      }
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Prevent duplicate submissions
    if (isLoading) return;
    
    setError('');
    
    // Validate input
    if (!inputText.trim() && !selectedFile && !filePath.trim()) {
      setError('Please enter text or select a file');
      return;
    }
    
    // Add user message to chat
    let userMessage = {
      id: Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    if (selectedFile) {
      // Include file information in the message
      userMessage = {
        ...userMessage,
        text: selectedFile.name,
        file: true,
        fileType: selectedFile.type,
        filePreviewUrl: createFilePreview(selectedFile)
      };
    } else if (filePath) {
      userMessage = {
        ...userMessage,
        text: filePath,
        file: true,
        fileType: fileType
      };
    } else {
      userMessage = {
        ...userMessage,
        text: inputText
      };
    }
    
    setMessages(prev => [...prev, userMessage]);
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
        // Add language parameter
        formData.append('language', selectedLanguage);
        
        response = await axios.post(`${API_BASE_URL}/upload_and_summarize`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      } else if (filePath) {
        // Handle URL
        response = await axios.post(`${API_BASE_URL}/summarize`, {
          url: filePath,
          file_type: fileType,
          language: selectedLanguage
        });
      } else {
        // Handle plain text
        response = await axios.post(`${API_BASE_URL}/summarize`, {
          text: inputText,
          language: selectedLanguage
        });
      }
      
      // Add bot response to chat with formatted summary
      const newBotMessage = {
        id: Date.now() + 1,
        text: formatSummary(response.data.summary),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        audio: response.data.audio
      };
      
      setMessages(prev => [...prev, newBotMessage]);
      
      // Clean up any object URLs to prevent memory leaks
      if (userMessage.filePreviewUrl) {
        URL.revokeObjectURL(userMessage.filePreviewUrl);
      }
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    // Clean up any object URLs on component unmount
    return () => {
      messages.forEach(message => {
        if (message.filePreviewUrl) {
          URL.revokeObjectURL(message.filePreviewUrl);
        }
      });
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header 
        selectedLanguage={selectedLanguage} 
        setSelectedLanguage={setSelectedLanguage} 
      />
      
      {/* Add wrapper with padding-bottom to create space for the fixed input */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {messages.length === 0 && <Welcome />}
        
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          className={messages.length > 0 ? 'flex-1 pb-32' : 'hidden'} 
        />
      </div>
      
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
        setError={setError}
      />
    </div>
  );
}

export default App;