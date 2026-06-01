import React, { useEffect } from "react";
import { X, Calendar, User } from "lucide-react";

export default function ImagePreviewModal({ isOpen, onClose, photo }) {
  // Listen for ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent background scrolling when open
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !photo) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const uploaderName = photo.uploadedBy?.name || "Squad Member";
  const uploaderEmail = photo.uploadedBy?.email || "";
  const uploaderAvatar = photo.uploadedBy?.profilePic || photo.uploadedBy?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row items-stretch justify-stretch bg-slate-950/95 backdrop-blur-md animate-fade-in">
      
      {/* Main image content area (Clicking backdrop closes) */}
      <div 
        className="flex-1 flex items-center justify-center p-4 relative cursor-zoom-out"
        onClick={onClose}
      >
        <img
          src={photo.imageUrl}
          alt="Preview Large"
          className="max-h-[80vh] md:max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-300 scale-100 cursor-default"
          onClick={(e) => e.stopPropagation()} // don't close when image itself is clicked
        />
        
        {/* Floating top close button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm shadow-lg border border-white/10"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Metadata panel */}
      <div className="w-full md:w-[350px] bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col justify-between shrink-0 text-left text-white select-none overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memory Info</h4>
            <h3 className="text-xl font-extrabold tracking-tight">Shared Capture</h3>
          </div>

          <hr className="border-slate-800" />

          {/* Uploaded By */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Uploaded By</span>
            <div className="flex items-center space-x-3">
              <img
                src={uploaderAvatar}
                alt={uploaderName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-700"
              />
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-slate-200 truncate leading-none">{uploaderName}</p>
                <span className="text-xs text-slate-400 truncate block mt-1">{uploaderEmail}</span>
              </div>
            </div>
          </div>

          {/* Upload Date */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date Captured</span>
            <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{formatDate(photo.createdAt) || "Recent Capture"}</span>
            </p>
          </div>
        </div>

        {/* Action footer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col gap-2">
          <a
            href={photo.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center px-5 py-3 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-lg"
          >
            Open in New Tab
          </a>
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center px-5 py-3 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            Back to Gallery
          </button>
        </div>
      </div>
      
    </div>
  );
}
