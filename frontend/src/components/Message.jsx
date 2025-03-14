import React from 'react';

const Message = ({ message }) => {
  // Function to format summary text with bullet points and bold sections
  const formatSummaryText = (text) => {
    if (message.sender !== 'bot' || message.error) return text;
    
    // Process the text to add formatting
    let formattedText = text;
    
    // Add bold to headers or key phrases
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert lines starting with "- " or "* " to bullet points
    formattedText = formattedText.replace(/^[*-] (.*)$/gm, '<li>$1</li>');
    
    // Wrap lists in <ul> tags
    if (formattedText.includes('<li>')) {
      formattedText = formattedText.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
    }
    
    // Convert paragraphs (double line breaks)
    formattedText = formattedText.replace(/\n\n/g, '</p><p>');
    
    // Wrap in paragraph tags if not already wrapped
    if (!formattedText.startsWith('<')) {
      formattedText = `<p>${formattedText}</p>`;
    }
    
    return formattedText;
  };
  
  const createMarkup = (text) => {
    return { __html: formatSummaryText(text) };
  };

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
        {message.sender === 'bot' && !message.error ? (
          <div 
            className="summary-content"
            dangerouslySetInnerHTML={createMarkup(message.text)}
          />
        ) : (
          message.text
        )}
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