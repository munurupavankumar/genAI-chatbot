import React from 'react';

const LanguageSelector = ({ selectedLanguage, setSelectedLanguage }) => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'bn', name: 'Bengali' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
  ];

  return (
    <div className="flex items-center p-2">
      <label htmlFor="language-select" className="mr-2 text-sm font-medium text-gray-700">
        Response Language:
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;