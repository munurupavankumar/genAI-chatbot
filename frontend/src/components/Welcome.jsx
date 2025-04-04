import React from 'react';
import { Award } from 'lucide-react';

const FeatureItem = ({ text }) => (
  <div className="flex items-center mb-3 md:mb-4">
    <div className="bg-green-100 p-1.5 md:p-2 rounded-full">
      <Award size={18} className="text-green-600 flex-shrink-0" strokeWidth={2.5} />
    </div>
    <p className="ml-2 md:ml-3 text-gray-700 text-sm md:text-base">{text}</p>
  </div>
);

const Welcome = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-3 md:p-5 overflow-y-auto">
      <div className="w-full max-w-md mx-auto flex flex-col h-full justify-center">
        {/* Logo and Branding */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-green-600 mb-1">BKIP.AI</h2>
          <p className="text-base md:text-lg text-gray-500 italic">Because Knowledge Is Power</p>
          <div className="h-1 w-24 bg-green-500 rounded-full mx-auto mt-2 md:mt-3"></div>
        </div>
        
        {/* Features */}
        <div className="bg-white bg-opacity-70 p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <FeatureItem text="Detects 100+ languages" />
            <FeatureItem text="Supports 10+ Indian languages" />
            <FeatureItem text="Reads Images, PDFs, docs" />
            <FeatureItem text="Text to speech capabilities" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;