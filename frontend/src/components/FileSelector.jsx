import React from 'react';
import { X } from 'lucide-react';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';

const FileSelector = ({ 
  showFileSelector, 
  setShowFileSelector, 
  selectedFile, 
  handleFileChange,
  fileType,
  setFileType,
  filePath, 
  setFilePath,
  fileSource,
  setFileSource,
  handleSubmit,
  setError
}) => {
  if (!showFileSelector) return null;

  return (
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
          <FileUpload 
            selectedFile={selectedFile} 
            fileType={fileType} 
            handleFileChange={handleFileChange} 
          />
        ) : (
          <UrlInput filePath={filePath} setFilePath={setFilePath} />
        )}
        
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
  );
};

export default FileSelector;