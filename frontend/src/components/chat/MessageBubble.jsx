import React, { useState } from "react";
import { Edit2, Trash2, Check, CheckCheck, Clock, X, Save } from "lucide-react";
import Avatar from "../Avatar";

export default function MessageBubble({ message, currentUser, onEdit, onDelete }) {
  const isOwnMessage = message.sender?._id === currentUser?._id;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const [errorMsg, setErrorMsg] = useState("");

  // Determine read receipt status
  const getReadStatus = () => {
    if (message.isPending) return "pending"; // Optimistic UI
    
    // Check if any other user besides the sender has read the message
    const readByOthers = (message.readBy || []).filter(
      (userId) => userId.toString() !== message.sender?._id?.toString()
    );

    if (readByOthers.length > 0) return "read";
    return "delivered";
  };

  const status = getReadStatus();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editText.trim()) {
      setErrorMsg("Message cannot be empty.");
      return;
    }
    try {
      await onEdit(message._id, editText);
      setIsEditing(false);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg("Failed to edit message.");
    }
  };

  // Format Date to local readable string
  const formatMessageTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div
      className={`flex items-end space-x-2.5 mb-4 group ${
        isOwnMessage ? "justify-end pl-12" : "justify-start pr-12"
      }`}
    >
      {/* Sender Avatar for others */}
      {!isOwnMessage && (
        <Avatar
          name={message.sender?.name}
          imageUrl={message.sender?.profileImage}
          size="w-9 h-9"
          textClass="text-xs font-bold"
          roundedClass="rounded-full shadow-sm shrink-0"
        />
      )}

      {/* Bubble Container */}
      <div className="flex flex-col max-w-full">
        {/* Username for others */}
        {!isOwnMessage && (
          <span className="text-[11px] font-bold text-slate-400 mb-1 ml-1 text-left">
            {message.sender?.name || "Traveler"}
          </span>
        )}

        <div className="relative flex items-center space-x-2">
          {/* Action buttons on hover (Only for own messages) */}
          {isOwnMessage && !isEditing && !message.isPending && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center bg-white border border-slate-200 shadow-sm rounded-lg py-0.5 px-1 space-x-1 transition-opacity duration-200 shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-slate-400 hover:text-teal-600 transition-colors rounded hover:bg-slate-50"
                title="Edit message"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this message?")) {
                    onDelete(message._id);
                  }
                }}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded hover:bg-slate-50"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Actual Chat Bubble */}
          <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words max-w-full ${
              isOwnMessage
                ? "bg-gradient-to-tr from-teal-600 to-teal-500 text-white rounded-br-none"
                : "bg-white border border-slate-150 text-slate-800 rounded-bl-none text-left"
            }`}
          >
            {/* Message Image */}
            {message.image && (
              <div className="mb-2 max-w-sm rounded-xl overflow-hidden border border-slate-100/50 bg-slate-50/5 flex justify-center shadow-inner">
                <img
                  src={message.image}
                  alt="Shared media"
                  className="max-h-[220px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => window.open(message.image, "_blank")}
                />
              </div>
            )}

            {/* Message text / Inline Edit Form */}
            {isEditing ? (
              <form onSubmit={handleUpdate} className="flex flex-col space-y-2 min-w-[200px]">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full text-slate-850 p-2 border border-teal-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs bg-slate-50 resize-none font-medium text-black"
                  rows={2}
                />
                {errorMsg && <p className="text-[10px] text-rose-500">{errorMsg}</p>}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(message.text || "");
                      setErrorMsg("");
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 text-black"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Save className="w-3 h-3" /> Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-1">
                {message.text && (
                  <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                )}
                {message.isEdited && (
                  <span
                    className={`block text-[9px] italic ${
                      isOwnMessage ? "text-teal-200/80" : "text-slate-400"
                    }`}
                  >
                    (edited)
                  </span>
                )}
              </div>
            )}

            {/* Bubble Metadata (Time + Ticks) */}
            <div
              className={`flex items-center justify-end space-x-1.5 mt-1.5 text-[10px] ${
                isOwnMessage ? "text-teal-100/90" : "text-slate-400"
              }`}
            >
              <span>{formatMessageTime(message.createdAt)}</span>

              {/* Status Ticks (Only for own messages) */}
              {isOwnMessage && (
                <span className="shrink-0 flex items-center">
                  {status === "pending" && <Clock className="w-3 h-3 animate-spin text-teal-200" />}
                  {status === "delivered" && <CheckCheck className="w-3.5 h-3.5 text-teal-200/70" />}
                  {status === "read" && <CheckCheck className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300" />}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
