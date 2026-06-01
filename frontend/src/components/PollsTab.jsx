import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, BarChart3, AlertCircle, CheckCircle2 } from "lucide-react";

// Components
import CreatePollModal from "./CreatePollModal";
import PollCard from "./PollCard";

export default function PollsTab({ tripId }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, [tripId]);

  const fetchPolls = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setErrorMsg("");

    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/poll/${tripId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      setPolls(res.data.polls || []);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Fetch polls error:", err);
      setErrorMsg("Failed to load polls. Please verify the backend status.");
      setLoading(false);
    });
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleActionSuccess = (message) => {
    showToast(message);
    fetchPolls(); // reload polls list
  };

  return (
    <div className="space-y-6 text-left relative animate-fade-in">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-5 py-3.5 rounded-2xl shadow-xl animate-fade-in border ${
          toast.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
            : "bg-rose-50 text-rose-800 border-rose-100"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Group Polls</h3>
          <p className="text-slate-500 text-sm mt-0.5">
            Cast votes to decide lodgings, food destinations, and plans.
          </p>
        </div>

        {polls.length > 0 && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100/50 hover:shadow-lg hover:shadow-teal-100 transition-all duration-300 transform active:scale-95 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Poll</span>
          </button>
        )}
      </div>

      {/* Content Rendering */}
      {loading ? (
        // Grid Loading Skeleton
        <div className="grid sm:grid-cols-2 gap-6 animate-pulse">
          <div className="border border-slate-200 rounded-3xl p-6 h-64 bg-slate-50"></div>
          <div className="border border-slate-200 rounded-3xl p-6 h-64 bg-slate-50"></div>
        </div>
      ) : errorMsg ? (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center space-y-4 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-550 shrink-0" />
          <p className="text-rose-700 text-sm font-semibold">{errorMsg}</p>
          <button 
            onClick={fetchPolls}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Retry
          </button>
        </div>
      ) : polls.length === 0 ? (
        // Empty State
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center shadow-inner">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h4 className="text-lg font-bold text-slate-800">No polls created yet</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Create a squad poll to make decisions together on dates, locations, or things to do!
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100 transition-all duration-300 transform active:scale-95 group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            <span>Create Poll</span>
          </button>
        </div>
      ) : (
        // Polls Grid
        <div className="grid sm:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <PollCard
              key={poll._id}
              poll={poll}
              onVoteSuccess={handleActionSuccess}
              onDeleteSuccess={handleActionSuccess}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        tripId={tripId}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
