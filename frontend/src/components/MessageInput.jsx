import React, { useRef, useState, useEffect } from 'react';
import { Paperclip, Send, Camera, X } from 'lucide-react';

const MessageInput = ({ 
  inputText, 
  setInputText, 
  handleSubmit, 
  handleKeyDown, 
  isLoading, 
  setShowFileSelector, 
  selectedFile, 
  filePath,
  error,
  handleFileChange
}) => {
  const cameraInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // Handle textarea auto-resize while respecting max height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';  // Reset height first
      const scrollHeight = textareaRef.current.scrollHeight;
      // Limit max height to 5 lines (approximately)
      const maxHeight = 120;
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [inputText]);

  // Fix viewport on mobile when keyboard appears
  useEffect(() => {
    // Prevent iOS Safari from resizing viewport when keyboard appears
    const metaViewport = document.querySelector('meta[name=viewport]');
    const originalContent = metaViewport ? metaViewport.getAttribute('content') : '';
    
    if (isFocused) {
      // Update viewport to prevent resizing
      document.querySelector('meta[name=viewport]')?.setAttribute(
        'content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    } else if (originalContent) {
      // Restore original viewport settings
      document.querySelector('meta[name=viewport]')?.setAttribute('content', originalContent);
    }
  }, [isFocused]);

  // Handle camera activation
  const handleCameraCapture = async () => {
    try {
      setShowCamera(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setShowCamera(false);
    }
  };

  // Take photo function
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        
        const syntheticEvent = { 
          target: { 
            files: [file],
            hasAttribute: () => true
          } 
        };
        
        closeCamera();
        handleFileChange(syntheticEvent);
      }, 'image/jpeg', 0.95);
    }
  };

  // Close camera function
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Check if textarea is empty
  const isInputEmpty = !inputText.trim() && !selectedFile && !filePath.trim();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-50 border-t border-gray-200 shadow-md">
      {error && (
        <div className="bg-red-50 p-2 text-red-600 text-sm border-t border-red-200 flex items-center justify-center">
          <span className="mr-2">⚠️</span> {error}
        </div>
      )}
      
      {/* Camera modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
          <div className="relative bg-black w-full max-w-lg rounded-lg overflow-hidden">
            <button 
              onClick={closeCamera} 
              className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full z-50"
            >
              <X size={20} />
            </button>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full h-auto"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-center p-4 bg-black">
              <button 
                onClick={takePhoto}
                className="bg-white text-black rounded-full p-4 shadow-lg"
                aria-label="Take photo"
              >
                <Camera size={28} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected file indicator */}
      {(selectedFile || filePath) && (
        <div className="px-4 py-2 bg-green-50 flex items-center justify-between">
          <div className="flex items-center text-sm text-green-800">
            <Paperclip size={16} className="mr-2" />
            <span className="truncate max-w-xs">
              {selectedFile ? selectedFile.name : filePath.split('/').pop()}
            </span>
          </div>
          <button className="text-red-500" onClick={() => {
            // Clear the file (you'll need to add this functionality)
          }}>
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Input form */}
      <form 
        onSubmit={handleSubmit} 
        className="flex items-end p-2 gap-1 bg-gray-50"
      >
        {/* Left icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowFileSelector(true)}
            className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 bg-white rounded-full transition-colors"
            aria-label="Attach file"
          >
            <Paperclip size={22} />
          </button>
          
          <button
            type="button"
            onClick={handleCameraCapture}
            className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 bg-white rounded-full transition-colors"
            aria-label="Open camera"
          >
            <Camera size={22} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={cameraInputRef}
              onChange={handleFileChange}
            />
          </button>
        </div>
        
        {/* Text input area */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-300 flex items-end overflow-hidden">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Paste the text you want to summarize"
            className="flex-1 py-2 px-4 outline-none resize-none min-h-[40px] max-h-[120px] overflow-y-auto scrollbar-thin"
            rows={1}
          />
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          disabled={isLoading || isInputEmpty}
          className={`p-3 rounded-full flex items-center justify-center ${
            isInputEmpty ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white'
          } transition-colors`}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;