import React from 'react';
import FileTypeButton from './FileTypeButton';

const FileTypeSelector = ({ fileType, setFileType }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        File Type:
      </label>
      <div className="grid grid-cols-4 gap-2">
        {['pdf', 'image', 'article', 'text'].map((type) => (
          <FileTypeButton 
            key={type} 
            type={type} 
            selectedType={fileType} 
            onSelect={setFileType} 
          />
        ))}
      </div>
    </div>
  );
};

export default FileTypeSelector;