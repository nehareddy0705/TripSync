import React, { useState, useEffect } from "react";
import { X, DollarSign, Users, AlertCircle } from "lucide-react";
import axios from "axios";

export default function AddExpenseModal({ isOpen, onClose, tripId, members = [], onSuccess }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [participants, setParticipants] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize defaults when modal opens
  useEffect(() => {
    if (isOpen && members.length > 0) {
      // Default payer is the current logged-in user if they are in members, otherwise the first member
      const currentUserStr = localStorage.getItem("user");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      
      const defaultPayer = members.find(m => m._id === currentUser?._id) || members[0];
      setPaidBy(defaultPayer?._id || "");
      
      // Default participants: everyone checked
      setParticipants(members.map(m => m._id));
    }
    setTitle("");
    setAmount("");
    setErrors({});
  }, [isOpen, members]);

  if (!isOpen) return null;

  const handleToggleParticipant = (memberId) => {
    if (participants.includes(memberId)) {
      setParticipants(participants.filter(id => id !== memberId));
    } else {
      setParticipants([...participants, memberId]);
    }
    if (errors.participants) {
      setErrors(prev => ({ ...prev, participants: "" }));
    }
  };

  const handleSelectAll = () => {
    if (participants.length === members.length) {
      setParticipants([]); // deselect all
    } else {
      setParticipants(members.map(m => m._id)); // select all
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = "Expense title is required.";
    }
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0.";
    }
    if (!paidBy) {
      newErrors.paidBy = "Please select who paid.";
    }
    if (participants.length === 0) {
      newErrors.participants = "At least one participant must be selected.";
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

    const body = {
      tripId,
      title: title.trim(),
      amount: parseFloat(amount),
      paidBy,
      participants
    };

    axios.post("http://localhost:4000/expense", body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      setLoading(false);
      onSuccess("Expense added successfully!");
      onClose();
    })
    .catch((err) => {
      console.error("Add expense error:", err);
      const errMsg = err.response?.data?.message || "Failed to add expense. Please try again.";
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
      <div className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-[500px] shadow-2xl z-10 animate-fade-in text-left max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 pr-6 shrink-0">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add Expense</h3>
          <p className="text-slate-500 text-sm">
            Log a shared cost and split it among your group members.
          </p>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-6 overflow-y-auto pr-1 flex-1 py-1">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="expense-title" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
              Expense Title *
            </label>
            <input
              id="expense-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
              }}
              placeholder="e.g. Airbnb lodging, Dinner, Rental car"
              disabled={loading}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all ${
                errors.title ? "border-rose-400" : "border-slate-200"
              }`}
            />
            {errors.title && <p className="text-xs text-rose-500 font-semibold">{errors.title}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label htmlFor="expense-amount" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
              Amount (in ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors(prev => ({ ...prev, amount: "" }));
                }}
                placeholder="0.00"
                disabled={loading}
                className={`w-full pl-8 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all ${
                  errors.amount ? "border-rose-400" : "border-slate-200"
                }`}
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-500 font-semibold">{errors.amount}</p>}
          </div>

          {/* Paid By */}
          <div className="space-y-1.5">
            <label htmlFor="expense-paidby" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
              Paid By *
            </label>
            <select
              id="expense-paidby"
              value={paidBy}
              onChange={(e) => {
                setPaidBy(e.target.value);
                if (errors.paidBy) setErrors(prev => ({ ...prev, paidBy: "" }));
              }}
              disabled={loading}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all ${
                errors.paidBy ? "border-rose-400" : "border-slate-250"
              }`}
            >
              <option value="" disabled>Select Payer</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
            {errors.paidBy && <p className="text-xs text-rose-500 font-semibold">{errors.paidBy}</p>}
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Split Participants *
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={loading}
                className="text-xs font-bold text-teal-655 hover:text-teal-700 transition-colors"
              >
                {participants.length === members.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="border border-slate-150 rounded-2xl bg-slate-50/50 p-4 max-h-[25vh] overflow-y-auto space-y-2.5">
              {members.map((member) => {
                const isChecked = participants.includes(member._id);
                return (
                  <div
                    key={member._id}
                    onClick={() => handleToggleParticipant(member._id)}
                    className="flex items-center space-x-3 cursor-pointer p-1.5 hover:bg-slate-100/50 rounded-lg transition-colors select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="w-4.5 h-4.5 rounded border-slate-350 text-teal-500 focus:ring-teal-500"
                    />
                    <img
                      src={member.profileImage || member.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                      alt={member.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 leading-none">{member.name}</p>
                      <span className="text-[10px] text-slate-400 leading-none">{member.email}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.participants && <p className="text-xs text-rose-500 font-semibold">{errors.participants}</p>}
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
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Expense</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
