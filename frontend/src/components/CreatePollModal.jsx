import React, { useState } from "react";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";
import axios from "axios";

export default function CreatePollModal({ isOpen, onClose, tripId, onSuccess }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]); // start with 2 empty options
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return; // keep minimum 2 options inputs on screen
    const newOptions = options.filter((_, idx) => idx !== index);
    setOptions(newOptions);
    // clear index-related errors
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: "" }));
    }
  };

  const handleOptionChange = (value, index) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!question.trim()) {
      newErrors.question = "Poll question is required.";
    }

    const filledOptions = options.map(opt => opt.trim()).filter(Boolean);
    if (filledOptions.length < 2) {
      newErrors.options = "Please provide at least 2 options.";
    }

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
    const filledOptions = options.map(opt => opt.trim()).filter(Boolean);

    const body = {
      tripId,
      question: question.trim(),
      options: filledOptions
    };

    axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/poll`, body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      setLoading(false);
      setQuestion("");
      setOptions(["", ""]);
      setErrors({});
      onSuccess("Poll created successfully!");
      onClose();
    })
    .catch((err) => {
      console.error("Create poll error:", err);
      const errMsg = err.response?.data?.message || "Failed to create poll. Please try again.";
      setErrors({ submit: errMsg });
      setLoading(false);
    });
  };

  const handleClose = () => {
    setQuestion("");
    setOptions(["", ""]);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-[500px] shadow-2xl z-10 animate-fade-in text-left max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 pr-6 shrink-0">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create a Poll</h3>
          <p className="text-slate-500 text-sm">
            Ask your travel squad their preferences and vote in real-time.
          </p>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-6 overflow-y-auto pr-1 flex-1 py-1">
          {/* Question */}
          <div className="space-y-1.5">
            <label htmlFor="poll-question" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
              Question / Decision *
            </label>
            <input
              id="poll-question"
              type="text"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (errors.question) setErrors((prev) => ({ ...prev, question: "" }));
              }}
              placeholder="e.g. Where should we go for dinner tonight?"
              disabled={loading}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all ${
                errors.question ? "border-rose-400" : "border-slate-200"
              }`}
            />
            {errors.question && <p className="text-xs text-rose-500 font-semibold">{errors.question}</p>}
          </div>

          {/* Options List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Options *
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                disabled={loading}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-655 hover:text-teal-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Option</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(e.target.value, index)}
                    placeholder={`Option ${index + 1}`}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      disabled={loading}
                      className="p-2.5 text-slate-400 hover:text-rose-550 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.options && <p className="text-xs text-rose-500 font-semibold">{errors.options}</p>}
          </div>

          {errors.submit && (
            <div className="flex items-start space-x-2 bg-rose-550/5 border border-rose-500/10 text-rose-700 text-xs p-3.5 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-550 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errors.submit}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={handleClose}
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
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Poll</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
