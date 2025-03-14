import React from 'react';
import { FileText, Image, Globe, File } from 'lucide-react';

const FileTypeButton = ({ type, selectedType, onSelect }) => {
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
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={`p-2 flex flex-col items-center rounded-md ${
        selectedType === type ? 'bg-blue-100 border border-blue-500' : 'border border-gray-200'
      }`}
    >
      {getFileIcon(type)}
      <span className="text-xs mt-1 capitalize">{type}</span>
    </button>
  );
};

export default FileTypeButton;
