import React, { useState } from "react";
import { Trash2, ZoomIn, Clock } from "lucide-react";
import axios from "axios";

export default function PhotoCard({ photo, tripCreatorId, onClick, onDeleteSuccess }) {
  const currentUserStr = localStorage.getItem("user");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  const [deleting, setDeleting] = useState(false);

  const isUploader = photo.uploadedBy?._id === currentUser?._id || photo.uploadedBy === currentUser?._id;
  const isTripHost = tripCreatorId === currentUser?._id;
  const canDelete = isUploader || isTripHost;

  const handleDelete = (e) => {
    e.stopPropagation(); // prevent opening preview modal
    if (!window.confirm("Delete this photo? This memory will be permanently removed from the shared gallery.")) return;

    setDeleting(true);
    const token = localStorage.getItem("token");

    axios.delete(`http://localhost:4000/photo/${photo._id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      setDeleting(false);
      onDeleteSuccess("Photo deleted successfully!");
    })
    .catch((err) => {
      console.error("Delete photo error:", err);
      setDeleting(false);
      alert("Failed to delete photo. Please try again.");
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const uploaderName = photo.uploadedBy?.name || "Squad Member";
  const uploaderAvatar = photo.uploadedBy?.profilePic || photo.uploadedBy?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

  return (
    <div
      onClick={() => onClick(photo)}
      className="group relative rounded-3xl overflow-hidden aspect-square border border-slate-200 bg-slate-100 hover:shadow-lg transition-all duration-300 cursor-zoom-in"
    >
      {/* Zoomable Image */}
      <img
        src={photo.imageUrl}
        alt="Trip memory"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
        loading="lazy"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4.5 text-left">
        
        {/* Top bar (Zoom action and optional Delete button) */}
        <div className="flex justify-between items-start">
          <div className="bg-white/10 text-white p-2 rounded-xl backdrop-blur-sm border border-white/10 shadow-md">
            <ZoomIn className="w-4 h-4" />
          </div>

          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl backdrop-blur-sm shadow-md transition-all active:scale-90"
              title="Delete Photo"
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Bottom bar (Uploader details and upload date) */}
        <div className="space-y-2 select-none">
          <div className="flex items-center space-x-2">
            <img
              src={uploaderAvatar}
              alt={uploaderName}
              className="w-7 h-7 rounded-full object-cover border border-white/30 shadow"
            />
            <span className="text-xs font-bold text-slate-100 truncate shadow-sm">
              {uploaderName}
            </span>
          </div>

          <span className="text-[10px] font-bold text-slate-350 flex items-center gap-1 leading-none">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formatDate(photo.createdAt)}</span>
          </span>
        </div>

      </div>
    </div>
  );
}
