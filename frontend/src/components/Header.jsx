import React, { useState, useEffect, useRef } from 'react';

const Header = ({ selectedLanguage, setSelectedLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  ];

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 shadow-md sticky top-0 z-50 border-b border-green-800">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-wider">
            BKIP.AI
          </h1>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium text-white hidden md:inline">
              Response Language:
            </span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm rounded-lg hover:bg-white/20 focus:ring-2 focus:ring-white/50 px-3 py-2 min-w-[120px] transition-all"
              aria-label="Select language"
              aria-expanded={isOpen}
            >
              <span>{selectedLang.name}</span>
              <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
          
          {isOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-md z-10 max-h-60 overflow-y-auto border border-gray-200">
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
      </div>
    </header>
  );
};

export default Header;