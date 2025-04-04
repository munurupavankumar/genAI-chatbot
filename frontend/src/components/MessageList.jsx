import React, { useEffect, useRef } from "react";
import AudioPlayer from "./AudioPlayer";
import Message from "./Message";
import { Loader } from "lucide-react";

const MessageList = ({ messages, isLoading, className = "flex-1" }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`overflow-y-auto p-4 space-y-4 bg-[#e5ded8] ${className}`}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-center">
            Send a message or upload a file to get a summary
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className="relative z-10">
            <Message 
              message={{
                ...message,
                audioBase64: message.sender === "bot" && message.audio ? message.audio : null,
                language: message.language || "te"
              }}
            />
            {/* Render AudioPlayer directly if bot message has audio */}
            {message.sender === "bot" && message.audio && (
              <div className="mt-2">
                <AudioPlayer
                  audioBase64={message.audio}
                  language={message.language || "te"}
                />
              </div>
            )}
          </div>
        ))
      )}
      {isLoading && (
        <div className="flex justify-start relative z-10">
          <div className="bg-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Loader size={20} className="animate-spin text-green-600" />
              <span>Generating summary...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
};

export default MessageList;