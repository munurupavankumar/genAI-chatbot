// File: frontend/src/App.jsx
import React, { useState } from 'react';
import axios from 'axios'; // Make sure to install axios: npm install axios
import './App.css';

function App() {
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [fileType, setFileType] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputMethod, setInputMethod] = useState('text'); // 'text' or 'url'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSummary('');
    setIsLoading(true);

    // Construct request payload based on input method
    const requestData = {};
    
    if (inputMethod === 'text' && textInput.trim() !== '') {
      requestData.text = textInput;
    } else if (inputMethod === 'url' && urlInput.trim() !== '') {
      requestData.url = urlInput;
      if (fileType.trim() !== '') {
        requestData.file_type = fileType;
      }
    } else {
      setError(`Please provide ${inputMethod === 'text' ? 'text' : 'a URL'}.`);
      setIsLoading(false);
      return;
    }

    console.log('Sending request data:', requestData); // Debug log

    try {
      // Using axios instead of fetch
      const response = await axios.post('http://localhost:8000/summarize', requestData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response received:', response.data);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error details:', error);
      
      // More detailed error handling with axios
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Server response:', error.response.data);
        setError(`Server error: ${error.response.status} - ${error.response.data.detail || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setError('No response from server. Check if the backend is running.');
      } else {
        // Something happened in setting up the request
        setError(`Request error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputMethodChange = (method) => {
    setInputMethod(method);
    setError('');
  };

  return (
    <div className="container">
      <header>
        <h1>Summarization Service</h1>
        <p>Enter text directly or provide a URL to summarize content</p>
      </header>
      
      <div className="input-method-selector">
        <button 
          className={inputMethod === 'text' ? 'active' : ''} 
          onClick={() => handleInputMethodChange('text')}
          type="button"
        >
          Direct Text
        </button>
        <button 
          className={inputMethod === 'url' ? 'active' : ''} 
          onClick={() => handleInputMethodChange('url')}
          type="button"
        >
          URL
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {inputMethod === 'text' ? (
          <div className="form-group">
            <label htmlFor="text-input">Enter your text:</label>
            <textarea
              id="text-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste or type text to summarize..."
              rows={6}
              className="text-input"
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="url-input">URL:</label>
              <input
                id="url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/article"
                className="text-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="file-type">File Type (optional):</label>
              <select
                id="file-type"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="select-input"
              >
                <option value="">Auto-detect</option>
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
                <option value="article">Article/Webpage</option>
                <option value="text">Text</option>
              </select>
            </div>
          </>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="submit-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Summarizing...' : 'Summarize'}
        </button>
      </form>
      
      {isLoading && (
        <div className="loading">
          <p>Processing your request...</p>
        </div>
      )}
      
      {summary && (
        <div className="summary-container">
          <h2>Summary</h2>
          <div className="summary-content">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;