import React from "react";
import { Edit2, Trash2, Clock, User } from "lucide-react";

export default function ActivityCard({ activity, onEdit, onDelete }) {
  const { title, description, date, createdBy } = activity;

  // Format Time (since date headers group by day)
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      return "";
    }
  };

  // Safe fallback avatar
  const avatarUrl = createdBy?.profilePic || createdBy?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

  return (
    <div className="group relative bg-white border border-slate-200 hover:border-slate-350 hover:shadow-lg transition-all duration-300 rounded-2xl p-5 text-left flex items-start justify-between gap-4">
      {/* Indicator Accent Line */}
      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-teal-400 to-blue-500 rounded-r-full"></div>

      <div className="flex-1 space-y-3 min-w-0 pl-1">
        {/* Header: Title and Time */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
          <h4 className="text-base font-extrabold text-slate-800 leading-tight truncate">
            {title}
          </h4>
          <span className="inline-flex items-center text-xs font-bold text-teal-650 bg-teal-50 px-2 py-0.5 rounded-lg shrink-0">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {formatTime(date)}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-slate-500 leading-relaxed break-words">
            {description}
          </p>
        )}

        {/* Creator Info */}
        <div className="pt-2 flex items-center space-x-2 border-t border-slate-50">
          <img
            src={avatarUrl}
            alt={createdBy?.name || "Member"}
            className="w-5.5 h-5.5 rounded-full object-cover ring-1 ring-slate-100 shrink-0"
          />
          <span className="text-[10px] font-semibold text-slate-400 truncate">
            Added by {createdBy?.name || "Group member"}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-1.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => onEdit(activity)}
          title="Edit activity"
          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all duration-200"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(activity._id)}
          title="Delete activity"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
