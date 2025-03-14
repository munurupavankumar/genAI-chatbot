import React, { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import FileDisplay from './FileDisplay';

const FileUpload = ({ selectedFile, fileType, handleFileChange }) => {
  const fileInputRef = useRef(null);
  
  return (
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
      <FileDisplay file={selectedFile} fileType={fileType} />
    </div>
  );
};

export default FileUpload;