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

  // Add effect to adjust textarea height when input changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Calculate max height as 1/3 of viewport height
      const maxHeight = window.innerHeight / 3;
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [inputText]);

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
      setError("Could not access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        // Create a File object from the blob
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        
        // Create a synthetic event object that exactly matches what handleFileChange expects
        const syntheticEvent = { 
          target: { 
            files: [file],
            hasAttribute: () => true // Simulate the capture attribute
          } 
        };
        
        // Close camera first to avoid state issues
        closeCamera();
        
        // Process the file
        handleFileChange(syntheticEvent);
        
        // IMPORTANT: Let App.jsx handle the submission
        // Removing the setTimeout and handleSubmit call here prevents double submissions
      }, 'image/jpeg', 0.95);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  return (
    <div className="bg-gray-200 p-3">
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-20 flex flex-col items-center justify-center">
          <div className="relative bg-black max-w-lg w-full">
            <button 
              onClick={closeCamera} 
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full z-30"
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
                className="bg-white text-black rounded-full p-4"
              >
                <Camera size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setShowFileSelector(true)}
          className="p-2 bg-gray-300 rounded-full text-gray-700 hover:bg-gray-400"
        >
          <Paperclip size={20} />
        </button>

        <button
          type="button"
          onClick={handleCameraCapture}
          className="p-2 bg-gray-300 rounded-full text-gray-700 hover:bg-gray-400"
        >
          <Camera size={20} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={cameraInputRef}
            onChange={handleFileChange}
          />
        </button>
        
        <div className="flex-1 bg-white rounded-full relative">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste the text you want to summarize"
            className="w-full p-3 pr-12 rounded-full resize-none outline-none min-h-[40px] overflow-y-auto"
            rows={1}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || (!inputText.trim() && !selectedFile && !filePath.trim())}
          className="p-2 bg-green-600 rounded-full text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;