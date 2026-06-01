import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import axios from "axios";

export default function EditActivityModal({ isOpen, onClose, activity, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Helper to format ISO date to YYYY-MM-DDTHH:MM for datetime-local input
  const formatForInput = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      // Adjust timezone offset to local time representation
      const tzoffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
      return localISOTime;
    } catch (e) {
      return "";
    }
  };

  // Prefill fields when activity changes or modal opens
  useEffect(() => {
    if (activity) {
      setTitle(activity.title || "");
      setDescription(activity.description || "");
      setDate(formatForInput(activity.date) || "");
    }
    setErrors({});
  }, [activity, isOpen]);

  if (!isOpen || !activity) return null;

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Activity title is required";
    if (!date) newErrors.date = "Date and time are required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    const body = {
      title: title.trim(),
      description: description.trim(),
      date: new Date(date).toISOString()
    };

    axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/itinerary/${activity._id}`, body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      setLoading(false);
      onSuccess("Activity updated successfully!");
      onClose();
    })
    .catch((err) => {
      console.error("Edit activity error:", err);
      const errMsg = err.response?.data?.message || "Failed to update activity. Please try again.";
      setErrors({ submit: errMsg });
      setLoading(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-[480px] shadow-2xl z-10 animate-fade-in text-left">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Activity</h3>
            <p className="text-slate-550 text-sm">
              Update scheduling details for this activity.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="edit-act-title" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Activity Title *
              </label>
              <input
                id="edit-act-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="e.g. Surfing lessons, Dinner reservation"
                disabled={loading}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all ${
                  errors.title ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.title && <p className="text-xs text-rose-500 font-semibold">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="edit-act-desc" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Description
              </label>
              <textarea
                id="edit-act-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Meet at the beach club. Rent boards at $15/hr."
                disabled={loading}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none"
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-1.5">
              <label htmlFor="edit-act-date" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Date & Time *
              </label>
              <input
                id="edit-act-date"
                type="datetime-local"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
                }}
                disabled={loading}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all ${
                  errors.date ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.date && <p className="text-xs text-rose-500 font-semibold">{errors.date}</p>}
            </div>

            {errors.submit && (
              <div className="flex items-start space-x-2 bg-rose-550/5 border border-rose-500/10 text-rose-700 text-xs p-3.5 rounded-xl">
                <AlertCircle className="w-4 h-4 text-rose-550 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errors.submit}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-1/3 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-teal-100 transform active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
