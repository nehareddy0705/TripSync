import React, { useState } from "react";
import { Trash2, Users, Calendar, Receipt } from "lucide-react";
import axios from "axios";
import Avatar from "./Avatar";

export default function ExpenseCard({ expense, onDeleteSuccess }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to delete the expense "${expense.title}"?`)) return;
    
    setDeleting(true);
    const token = localStorage.getItem("token");

    axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/expense/${expense._id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      setDeleting(false);
      onDeleteSuccess("Expense deleted successfully!");
    })
    .catch((err) => {
      console.error("Delete expense error:", err);
      setDeleting(false);
      alert("Failed to delete expense. Please try again.");
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

  const paidByName = expense.paidBy?.name || "Squad Member";

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4 text-left">
      <div className="flex items-center space-x-4 min-w-0">
        {/* Category Icon */}
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-655 shrink-0 shadow-sm">
          <Receipt className="w-5.5 h-5.5" />
        </div>

        <div className="min-w-0">
          <h4 className="font-bold text-slate-900 text-base leading-tight truncate">
            {expense.title}
          </h4>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-400 font-semibold">
            {/* Paid By Avatar + Name */}
            <div className="flex items-center space-x-1.5">
              <Avatar
                name={paidByName}
                imageUrl={expense.paidBy?.profilePic || expense.paidBy?.profileImage}
                size="w-4.5 h-4.5"
                textClass="text-[8px]"
                roundedClass="rounded-full"
              />
              <span>Paid by <strong className="text-slate-700 font-bold">{paidByName}</strong></span>
            </div>

            {/* Dot separator */}
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>

            {/* Split Participant Count */}
            <div className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Split with {expense.participants?.length || 0} {expense.participants?.length === 1 ? "person" : "people"}</span>
            </div>

            {/* Dot separator */}
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>

            {/* Date */}
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(expense.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Amount & Delete */}
      <div className="flex items-center space-x-4 shrink-0 text-right">
        <div>
          <span className="text-sm font-bold text-slate-400 block leading-none">Total</span>
          <span className="text-lg font-black text-slate-900 mt-1 block">
            ₹{expense.amount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2.5 text-slate-400 hover:text-rose-550 hover:bg-rose-50 rounded-xl transition-colors"
          title="Delete Expense"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
