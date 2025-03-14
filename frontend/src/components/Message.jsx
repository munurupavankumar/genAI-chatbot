import React from 'react';

const Message = ({ message }) => {
  return (
    <div 
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`rounded-lg p-3 max-w-xs md:max-w-md break-words relative ${
          message.sender === 'user' 
            ? 'bg-green-100 text-black'
            : message.error 
              ? 'bg-red-100 text-red-800' 
              : 'bg-white text-black'
        }`}
      >
        {message.text}
        <div className="text-xs text-gray-500 text-right mt-1">
          {message.timestamp}
        </div>
        {/* Triangle for chat bubble */}
        <div 
          className={`absolute top-0 w-0 h-0 border-8 ${
            message.sender === 'user'
              ? 'right-0 -mr-3 border-l-green-100 border-t-green-100 border-r-transparent border-b-transparent'
              : message.error
                ? 'left-0 -ml-3 border-r-red-100 border-t-red-100 border-l-transparent border-b-transparent'
                : 'left-0 -ml-3 border-r-white border-t-white border-l-transparent border-b-transparent'
          }`}
        />
      </div>
    </div>
  );
};

export default Message;