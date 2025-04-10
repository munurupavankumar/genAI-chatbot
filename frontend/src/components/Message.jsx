import React from 'react';
import { FileText, FileImage, FileAudio, FileVideo, File } from 'lucide-react';

const Message = ({ message }) => {
  // Enhanced function to format AI-generated text with proper markdown handling
  const formatSummaryText = (text) => {
    if (message.sender !== 'bot' || message.error) return text;
    
    // Create a working copy
    let formattedText = text;
    
    // First, temporarily protect code blocks from other formatting
    const codeBlocks = [];
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });
    
    // Handle markdown headers
    formattedText = formattedText.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    formattedText = formattedText.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    formattedText = formattedText.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    
    // Handle bold text - non-greedy to prevent overlapping matches
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Handle em dashes - convert triple, double hyphen or special em dash character
    formattedText = formattedText.replace(/---/g, '&mdash;');
    formattedText = formattedText.replace(/--/g, '&mdash;');
    formattedText = formattedText.replace(/—/g, '&mdash;');
    
    // Handle horizontal rules
    formattedText = formattedText.replace(/^(\*\*\*|---|\*\*\*\*\*|_____)$/gm, '<hr />');
    
    // Handle bullet points
    // First identify list blocks to wrap them properly
    const listItemPattern = /^[*-] (.*)$/gm;
    const listItems = [];
    let match;
    
    // Find all list items
    while ((match = listItemPattern.exec(formattedText)) !== null) {
      listItems.push({
        index: match.index,
        length: match[0].length,
        text: match[0],
        formattedText: `<li>${match[1]}</li>`
      });
    }
    
    // Replace list items from end to start to not disturb indices
    for (let i = listItems.length - 1; i >= 0; i--) {
      const item = listItems[i];
      formattedText = 
        formattedText.substring(0, item.index) + 
        item.formattedText + 
        formattedText.substring(item.index + item.length);
    }
    
    // Group list items
    if (listItems.length > 0) {
      // Insert opening and closing ul tags
      let inList = false;
      let result = '';
      let remaining = formattedText;
      
      while (remaining.length > 0) {
        const liIndex = remaining.indexOf('<li>');
        
        if (liIndex === -1) {
          // No more list items
          if (inList) {
            result += '</ul>' + remaining;
            inList = false;
          } else {
            result += remaining;
          }
          break;
        }
        
        // Check if this is a new list
        if (!inList) {
          result += remaining.substring(0, liIndex) + '<ul>';
          inList = true;
        } else {
          result += remaining.substring(0, liIndex);
        }
        
        // Find end of this list item
        const liEndIndex = remaining.indexOf('</li>', liIndex) + 5;
        result += remaining.substring(liIndex, liEndIndex);
        
        // Check if there are more list items immediately after
        remaining = remaining.substring(liEndIndex);
        const nextLiIndex = remaining.indexOf('<li>');
        
        // If no more list items or they're not immediate, close the list
        if (nextLiIndex === -1 || (nextLiIndex > 0 && remaining.substring(0, nextLiIndex).trim() !== '')) {
          result += '</ul>';
          inList = false;
        }
      }
      
      formattedText = result;
    }
    
    // Handle inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle links
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert paragraphs (double line breaks)
    formattedText = formattedText.replace(/\n\n/g, '</p><p>');
    
    // Handle single line breaks
    formattedText = formattedText.replace(/\n(?!<\/?(p|ul|li|h[1-6]|pre|hr)>)/g, '<br>');
    
    // Restore code blocks with proper formatting
    formattedText = formattedText.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
      const code = codeBlocks[parseInt(index, 10)].replace(/```(.*?)\n([\s\S]*?)```/g, (_, language, content) => {
        return `<pre><code class="language-${language || 'plaintext'}">${content}</code></pre>`;
      });
      return code;
    });
    
    // Wrap in paragraph tags if not already wrapped
    if (!formattedText.startsWith('<')) {
      formattedText = `<p>${formattedText}</p>`;
    }
    
    return formattedText;
  };
  
  const createMarkup = (text) => {
    return { __html: formatSummaryText(text) };
  };

  // Determine file icon based on file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    // Image extensions
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return <FileImage size={24} className="text-blue-500" />;
    }
    // PDF
    else if (extension === 'pdf') {
      return <FileText size={24} className="text-red-500" />;
    }
    // Audio
    else if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) {
      return <FileAudio size={24} className="text-purple-500" />;
    }
    // Video
    else if (['mp4', 'webm', 'avi', 'mov'].includes(extension)) {
      return <FileVideo size={24} className="text-green-500" />;
    }
    // Text/Document
    else if (['txt', 'doc', 'docx', 'rtf', 'odt'].includes(extension)) {
      return <FileText size={24} className="text-orange-500" />;
    }
    // Default file icon
    else {
      return <File size={24} className="text-gray-500" />;
    }
  };

  // Function to check if the message contains a file
  const isFileMessage = (text) => {
    // Simple check - adjust based on your actual file message format
    return message.file || (message.sender === 'user' && message.fileType);
  };

  // Function to render file preview based on file type
  const renderFilePreview = () => {
    // If we have an actual file object with preview URL
    if (message.filePreviewUrl) {
      return (
        <div className="file-preview">
          <div className="w-full max-w-[200px] rounded-lg overflow-hidden mb-2">
            <img 
              src={message.filePreviewUrl} 
              alt="File preview" 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="text-sm">{message.text}</div>
        </div>
      );
    }
    
    // If it's a file but we don't have a preview (non-image or URL not available)
    // Display icon with file name
    return (
      <div className="file-info flex items-center">
        <div className="mr-2">
          {getFileIcon(message.text)}
        </div>
        <div className="text-sm overflow-hidden text-ellipsis">
          {message.text}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
    >
      <div 
        className={`rounded-lg p-3 md:max-w-md lg:max-w-lg break-words relative shadow-sm ${
          message.sender === 'user' 
            ? 'bg-green-100 text-black'
            : message.error 
              ? 'bg-red-100 text-red-800' 
              : 'bg-white text-black'
        }`}
      >
        {message.sender === 'bot' && !message.error ? (
          <div 
            className="summary-content prose prose-sm max-w-none"
            dangerouslySetInnerHTML={createMarkup(message.text)}
          />
        ) : isFileMessage() ? (
          renderFilePreview()
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