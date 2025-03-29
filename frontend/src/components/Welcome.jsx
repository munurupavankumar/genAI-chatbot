import React from 'react';
import { Award } from 'lucide-react';

const FeatureItem = ({ text }) => (
  <div className="flex items-center mb-3">
    <Award size={20} className="text-amber-500 flex-shrink-0" strokeWidth={2.5} />
    <p className="ml-3 text-gray-700">{text}</p>
  </div>
);

const Welcome = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-5">
          <h2 className="text-3xl font-bold text-gray-800 mb-1">BKIP.AI</h2>
          <p className="text-lg text-gray-600 mb-1">Because Knowledge Is Power</p>
        </div>
        
        <div className="mt-4 max-w-sm mx-auto pl-18">
          <FeatureItem text="Supports 10+ languages" />
          <FeatureItem text="Images, PDFs, docs, text" />
          <FeatureItem text="Summarize news articles" />
          <FeatureItem text="Summarize medical documents" />
        </div>
      </div>
    </div>
  );
};

export default Welcome; 