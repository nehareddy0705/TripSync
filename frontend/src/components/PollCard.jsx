import React, { useState } from "react";
import { Trash2, User, Clock, CheckCircle2, BarChart2 } from "lucide-react";
import axios from "axios";

export default function PollCard({ poll, onVoteSuccess, onDeleteSuccess }) {
  const currentUserStr = localStorage.getItem("user");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  const [selectedOption, setSelectedOption] = useState(null);
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isChangingVote, setIsChangingVote] = useState(false);

  // Check if current user has voted on this poll
  const userVotedOptionIndex = poll.options.findIndex((opt) =>
    opt.votes?.some((voteId) => {
      const idStr = typeof voteId === "object" ? voteId._id : voteId;
      return idStr === currentUser?._id;
    })
  );
  
  const hasVoted = userVotedOptionIndex !== -1;

  // Calculate total votes cast
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);

  const isCreator = 
    poll.createdBy?._id === currentUser?._id || 
    poll.createdBy === currentUser?._id;

  const handleVote = (optionIndex) => {
    setVoting(true);
    const token = localStorage.getItem("token");

    axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/poll/${poll._id}/vote`, { optionIndex }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      setVoting(false);
      setIsChangingVote(false);
      onVoteSuccess("Vote cast successfully!");
    })
    .catch((err) => {
      console.error("Cast vote error:", err);
      setVoting(false);
      alert("Failed to submit vote. Please try again.");
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this poll?")) return;
    setDeleting(true);
    const token = localStorage.getItem("token");

    axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/poll/${poll._id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      setDeleting(false);
      onDeleteSuccess("Poll deleted successfully!");
    })
    .catch((err) => {
      console.error("Delete poll error:", err);
      setDeleting(false);
      alert("Failed to delete poll.");
    });
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col text-left space-y-4">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center space-x-3">
          <img
            src={poll.createdBy?.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
            alt={poll.createdBy?.name || "Member"}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div>
            <span className="text-xs font-bold text-slate-400 block leading-none">Created by</span>
            <span className="font-extrabold text-slate-800 text-sm mt-1 block">{poll.createdBy?.name || "Squad Member"}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full gap-1">
            <Clock className="w-3 h-3 text-slate-450" />
            <span>{formatDate(poll.createdAt)}</span>
          </div>
          {isCreator && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-slate-400 hover:text-rose-550 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Poll"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Poll Question */}
      <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
        {poll.question}
      </h3>

      {/* Options List */}
      <div className="space-y-3.5 pt-1">
        {(!hasVoted || isChangingVote) ? (
          // Voting UI
          <div className="space-y-2.5">
            {poll.options.map((option, index) => {
              const isSelected = selectedOption === index;
              return (
                <div
                  key={option._id || index}
                  onClick={() => setSelectedOption(index)}
                  className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-teal-500 bg-teal-50/20 shadow-sm"
                      : "border-slate-150 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-teal-555 bg-teal-555 text-white"
                        : "border-slate-300"
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 truncate">{option.text}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(index);
                    }}
                    disabled={voting}
                    className="px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-teal-655 border border-teal-200 hover:bg-teal-500 hover:text-white transition-all transform active:scale-95"
                  >
                    Vote
                  </button>
                </div>
              );
            })}

            {hasVoted && (
              <button
                type="button"
                onClick={() => setIsChangingVote(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pt-2 block"
              >
                Cancel Change
              </button>
            )}
          </div>
        ) : (
          // Results UI (Progress bars)
          <div className="space-y-3.5">
            {poll.options.map((option, index) => {
              const votesCount = option.votes?.length || 0;
              const percent = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
              const isUserChoice = index === userVotedOptionIndex;

              return (
                <div key={option._id || index} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 font-semibold truncate flex items-center gap-1.5 max-w-[70%]">
                      {option.text}
                      {isUserChoice && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-650 px-1.5 py-0.5 rounded-full text-[9px]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Your Vote</span>
                        </span>
                      )}
                    </span>
                    <span className="text-slate-500 shrink-0">
                      {votesCount} {votesCount === 1 ? "vote" : "votes"} ({percent}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative border border-slate-150">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUserChoice
                          ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                          : "bg-gradient-to-r from-blue-400 to-teal-400"
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            {/* Change vote option */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs shrink-0">
              <span className="font-bold text-slate-400 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{totalVotes} total {totalVotes === 1 ? "vote" : "votes"}</span>
              </span>
              <button
                onClick={() => setIsChangingVote(true)}
                className="font-bold text-teal-655 hover:text-teal-700 transition-colors hover:underline"
              >
                Change Vote
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
