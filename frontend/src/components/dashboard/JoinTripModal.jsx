import React, { useState } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";

export default function JoinTripModal({ isOpen, onClose, onJoinSuccess }) {
  const [inviteCode, setInviteCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      setErrorMsg("Please enter an invite code.");
      return;
    }

    if (code.length < 4) {
      setErrorMsg("Invite code must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      if (onJoinSuccess) {
        await onJoinSuccess(code);
      }
      setSuccess(true);
    } catch (err) {
      console.error("Join trip modal error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to join trip. Please verify code.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInviteCode("");
    setErrorMsg("");
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Modal Dialog */}
      <div className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-[440px] shadow-2xl z-10 text-center animate-fade-in transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          // Success State
          <div className="py-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">Adventure Joined!</h3>
              <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                You've successfully joined the trip. It has been added to your dashboard!
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all duration-300 shadow-md shadow-teal-100 transform active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          // Input Form State
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">Join a Trip</h3>
              <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                Enter the unique invite code shared by your friends to sync up itineraries.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 text-left">
                <label 
                  htmlFor="inviteCode" 
                  className="text-xs font-bold text-slate-400 uppercase tracking-wide"
                >
                  Invite Code
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  placeholder="e.g. BALI26"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  disabled={loading}
                  maxLength={12}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-center text-lg tracking-widest font-bold placeholder:font-sans placeholder:text-sm placeholder:tracking-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all uppercase duration-200"
                />
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div className="flex items-start space-x-2 bg-rose-500/5 border border-rose-500/10 text-rose-700 text-xs text-left p-3.5 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="sm:w-1/3 py-3 rounded-2xl text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:w-2/3 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-95 shadow-md shadow-teal-100"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <span>Join Trip</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
