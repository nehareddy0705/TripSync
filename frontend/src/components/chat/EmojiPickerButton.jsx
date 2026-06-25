import React, { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { Smile } from "lucide-react";

export default function EmojiPickerButton({ onEmojiSelect }) {
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef(null);

  // Close picker when clicking outside the container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiData) => {
    onEmojiSelect(emojiData.emoji);
    // Don't close immediately so they can add multiple emojis if desired
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`p-2.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none ${
          showPicker ? "text-teal-650 bg-teal-50" : "text-slate-500"
        }`}
        title="Choose an emoji"
      >
        <Smile className="w-5 h-5" />
      </button>

      {showPicker && (
        <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 animate-fade-in bg-white">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme="light"
            skinTonesDisabled
            searchPlaceHolder="Search emoji..."
            width={300}
            height={380}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
}
