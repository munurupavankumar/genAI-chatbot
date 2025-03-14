import React from 'react';

const UrlInput = ({ filePath, setFilePath }) => {
  return (
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
  );
};

export default UrlInput;