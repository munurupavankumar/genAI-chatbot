import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioPlayer = ({ audioBase64, language, autoplay = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Effect to handle audio decoding and loading
  useEffect(() => {
    if (!audioBase64) return;

    // Create audio element
    const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
    audioRef.current = audio;

    // Set up event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      
      // Autoplay handling
      if (autoplay) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.warn('Autoplay was prevented:', error);
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

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // Cleanup function
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      
      // Pause and reset audio
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audioBase64, autoplay]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current) return;

    const progressBar = progressRef.current;
    const clickPosition = e.nativeEvent.offsetX;
    const percentage = clickPosition / progressBar.offsetWidth;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time in MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // No audio to play
  if (!audioBase64) return null;

  return (
    <div className="w-1/3 bg-gray-100 rounded-lg p-2 mt-2 flex items-center space-x-2">
      {/* Play/Pause Button */}
      <button 
        onClick={togglePlay} 
        className="text-blue-600 hover:text-blue-800 focus:outline-none"
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
          className="bg-blue-500 h-2 rounded-full" 
          style={{ 
            width: `${(currentTime / duration) * 100 || 0}%` 
          }}
        />
      </div>

      {/* Time Display */}
      <div className="text-xs text-gray-600 w-16">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
};

export default AudioPlayer;