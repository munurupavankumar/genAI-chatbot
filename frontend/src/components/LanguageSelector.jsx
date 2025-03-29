import React, { useState } from 'react';

const LanguageSelector = ({ selectedLanguage, setSelectedLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  
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

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <div className="relative p-2">
      <div className="flex items-center">
        <span className="mr-2 text-sm font-medium text-gray-700">
          Response Language:
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 px-3 py-2 min-w-[120px]"
        >
          <span>{selectedLang.name}</span>
          <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute right-2 mt-1 w-48 bg-white shadow-lg rounded-md z-10 max-h-60 overflow-y-auto border border-gray-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${
                selectedLanguage === lang.code ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-700'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;