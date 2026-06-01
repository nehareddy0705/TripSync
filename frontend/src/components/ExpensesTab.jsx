import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Wallet, AlertCircle, CheckCircle2, DollarSign, Users, PiggyBank, ArrowRightLeft } from "lucide-react";

// Components
import AddExpenseModal from "./AddExpenseModal";
import ExpenseCard from "./ExpenseCard";
import BalanceCard from "./BalanceCard";

export default function ExpensesTab({ tripId, members = [] }) {
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchExpensesAndBalances();
  }, [tripId]);

  const fetchExpensesAndBalances = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setErrorMsg("");

    try {
      const [expensesRes, balancesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/expense/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/expense/${tripId}/balances`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setExpenses(expensesRes.data.expenses || []);
      setBalances(balancesRes.data.balances || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch expenses/balances error:", err);
      setErrorMsg("Failed to load expense split data. Please check backend server.");
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleActionSuccess = (message) => {
    showToast(message);
    fetchExpensesAndBalances(); // reload lists and balances
  };

  // Aggregate duplicate from -> to balances (e.g. A owes B 1000, A owes B 500 becomes A owes B 1500)
  const getAggregatedBalances = () => {
    const map = {};
    balances.forEach((b) => {
      const fromId = typeof b.from === "object" && b.from !== null ? b.from._id : b.from;
      const toId = typeof b.to === "object" && b.to !== null ? b.to._id : b.to;
      
      if (!fromId || !toId) return;
      const key = `${fromId}-${toId}`;
      if (!map[key]) {
        map[key] = {
          from: fromId,
          to: b.to,
          amount: 0
        };
      }
      map[key].amount += b.amount;
    });

    // Filter out negligible balances (< 1 Rupee)
    return Object.values(map).filter(b => b.amount >= 1);
  };

  const aggregatedBalancesList = getAggregatedBalances();

  // Metrics calculations
  const totalExpensesAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalBalancesAmount = aggregatedBalancesList.reduce((sum, bal) => sum + (bal.amount || 0), 0);

  return (
    <div className="space-y-6 text-left relative animate-fade-in">
      {/* Toast alert */}
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

      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Expense Splitting</h3>
          <p className="text-slate-500 text-sm mt-0.5">
            Log group expenses, track payouts, and see who owes whom.
          </p>
        </div>

        {expenses.length > 0 && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100/50 hover:shadow-lg hover:shadow-teal-100 transition-all duration-300 transform active:scale-95 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        )}
      </div>

      {loading ? (
        // Loading skeleton
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            <div className="h-24 bg-slate-100 border border-slate-200 rounded-3xl"></div>
            <div className="h-24 bg-slate-100 border border-slate-200 rounded-3xl"></div>
            <div className="h-24 bg-slate-100 border border-slate-200 rounded-3xl"></div>
            <div className="h-24 bg-slate-100 border border-slate-200 rounded-3xl"></div>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-8 h-80 bg-slate-100 border border-slate-200 rounded-3xl"></div>
            <div className="lg:col-span-4 h-80 bg-slate-100 border border-slate-200 rounded-3xl"></div>
          </div>
        </div>
      ) : errorMsg ? (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center space-y-4 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-550 shrink-0" />
          <p className="text-rose-700 text-sm font-semibold">{errorMsg}</p>
          <button 
            onClick={fetchExpensesAndBalances}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : expenses.length === 0 ? (
        // Empty State
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center shadow-inner">
            <Wallet className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h4 className="text-lg font-bold text-slate-800">No expenses yet</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Keep track of shared trip costs like food, hotels, and transport. Add an expense to begin!
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100 transition-all duration-300 transform active:scale-95 group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            <span>Add Expense</span>
          </button>
        </div>
      ) : (
        // Active Dashboard content
        <div className="space-y-8">
          
          {/* Summary metrics header grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Metric 1: Total Logged */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Expenses</p>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                  ₹{totalExpensesAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </h4>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-655 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 2: Number of Expenses */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Logs Count</p>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{expenses.length} Entries</h4>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-555 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Ledger columns (logs and settle-up lists) */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Expenses log list */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center shrink-0">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Expense Ledger Log</h4>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  Sorted by newest
                </span>
              </div>

              <div className="space-y-3">
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense._id}
                    expense={expense}
                    onDeleteSuccess={handleActionSuccess}
                  />
                ))}
              </div>
            </div>

            {/* Right: Settles splitting */}
            <div className="lg:col-span-5 space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center shrink-0">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                  <span>Settle-Up Guide</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  Calculated splitting
                </span>
              </div>

              {aggregatedBalancesList.length === 0 ? (
                <div className="bg-slate-50 border border-slate-150 rounded-3xl p-8 text-center space-y-2">
                  <p className="text-slate-500 font-semibold text-sm">Everyone is settled up!</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No active balances found. All participant shares balance perfectly.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aggregatedBalancesList.map((bal, idx) => (
                    <BalanceCard
                      key={idx}
                      balance={bal}
                      members={members}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Add modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tripId={tripId}
        members={members}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}