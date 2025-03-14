import React from 'react';
import { FileText, Image, Globe, File } from 'lucide-react';

const FileDisplay = ({ file, fileType }) => {
  if (!file) return null;

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
    <div className="mt-2 flex items-center p-2 border rounded-md bg-blue-50">
      {getFileIcon(fileType)}
      <span className="ml-2 text-sm truncate">{file.name}</span>
    </div>
  );
};

export default FileDisplay;