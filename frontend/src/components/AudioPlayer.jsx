import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, AlertCircle } from 'lucide-react';

// Helper function to combine multiple base64 audio chunks into one Blob URL
const combineAudioChunks = (audioArray) => {
  if (!Array.isArray(audioArray) || audioArray.length === 0) {
    console.error('Invalid audio array provided to combineAudioChunks');
    return null;
  }
  
  try {
    // Convert each base64 chunk into a Uint8Array
    const byteArrays = audioArray.map((base64Str) => {
      try {
        const binaryStr = atob(base64Str);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        return bytes;
      } catch (err) {
        console.error('Error processing audio chunk:', err);
        return new Uint8Array(0);
      }
    });
    
    // Filter out empty arrays
    const validByteArrays = byteArrays.filter(arr => arr.length > 0);
    
    if (validByteArrays.length === 0) {
      console.error('No valid audio chunks found');
      return null;
    }
    
    // Compute combined length and merge all chunks
    const totalLength = validByteArrays.reduce((sum, arr) => sum + arr.length, 0);
    const combinedBytes = new Uint8Array(totalLength);
    let offset = 0;
    validByteArrays.forEach(arr => {
      combinedBytes.set(arr, offset);
      offset += arr.length;
    });
    
    // Create a Blob and return its URL
    const blob = new Blob([combinedBytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error combining audio chunks:', err);
    return null;
  }
};

const AudioPlayer = ({ audioBase64, language, autoplay = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Validate base64 string before creating audio
  const isValidBase64 = (str) => {
    if (!str || typeof str !== 'string') return false;
    try {
      window.atob(str);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Effect to handle audio decoding and loading
  useEffect(() => {
    // Reset previous state
    setError(null);
    
    if (!audioBase64) {
      setError('No audio data available');
      return;
    }

    // Determine the source URL: if audioBase64 is an array, combine chunks
    let src = '';
    
    try {
      if (Array.isArray(audioBase64)) {
        console.log(`Processing ${audioBase64.length} audio chunks`);
        if (audioBase64.length === 0) {
          setError('No audio data available');
          return;
        }
        
        // If we have just one item in the array, we can use it directly to avoid unnecessary processing
        if (audioBase64.length === 1 && isValidBase64(audioBase64[0])) {
          src = `data:audio/wav;base64,${audioBase64[0]}`;
        } else {
          src = combineAudioChunks(audioBase64);
          if (!src) {
            setError('Failed to process audio chunks');
            return;
          }
        }
      } else {
        if (!isValidBase64(audioBase64)) {
          setError('Invalid audio data format');
          return;
        }
        src = `data:audio/wav;base64,${audioBase64}`;
        console.warn('Expected array of audio chunks but received string - using legacy mode');
      }

      // Create audio element using the source URL
      const audio = new Audio(src);
      audioRef.current = audio;

      // Set up event listeners
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        if (autoplay) {
          audio.play().then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn('Autoplay was prevented:', err);
            setError('Autoplay failed - click play to listen');
          });
        }
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const handleError = (e) => {
        console.error('Audio error:', e);
        setError('Could not play audio - please try again');
        setIsPlaying(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        // Revoke the blob URL if one was created
        if (src.startsWith('blob:')) {
          URL.revokeObjectURL(src);
        }
      };
    } catch (err) {
      console.error('Audio initialization error:', err);
      setError('Audio initialization failed');
    }
  }, [audioBase64, autoplay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
        setError('Could not play audio');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current) return;
    const progressBar = progressRef.current;
    const clickPosition = e.nativeEvent.offsetX;
    const percentage = clickPosition / progressBar.offsetWidth;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="w-full md:w-2/3 lg:w-1/3 bg-red-100 rounded-lg p-2 mt-2 flex items-center space-x-2 z-10 relative">
        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
        <span className="text-red-800 text-sm">{error}</span>
      </div>
    );
  }

  if (!audioBase64) return null;

  return (
    <div className="w-full md:w-2/3 lg:w-1/3 bg-gray-100 rounded-lg p-2 mt-2 flex items-center space-x-2 z-10 relative shadow">
      {/* Play/Pause Button */}
      <button 
        onClick={togglePlay} 
        className="text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full p-1 flex-shrink-0"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Progress Bar */}
      <div 
        ref={progressRef}
        onClick={handleProgressClick}
        className="flex-grow bg-gray-300 h-2 rounded-full cursor-pointer"
      >
        <div 
          className="bg-green-500 h-2 rounded-full" 
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        />
      </div>

      {/* Time Display */}
      <div className="text-xs text-gray-600 w-16 flex-shrink-0">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
};

export default AudioPlayer;