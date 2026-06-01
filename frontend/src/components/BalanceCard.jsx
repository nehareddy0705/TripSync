import React from "react";
import { ArrowRight, ArrowRightLeft } from "lucide-react";

export default function BalanceCard({ balance, members = [] }) {
  // Safe helper to extract user ID string
  const getUserId = (userObjOrId) => {
    if (typeof userObjOrId === "object" && userObjOrId !== null) {
      return userObjOrId._id || userObjOrId.id;
    }
    return userObjOrId;
  };

  const fromId = getUserId(balance.from);
  const toId = getUserId(balance.to);

  // Look up full member records from the trip members cache to get avatars
  const fromUser = members.find(m => m._id === fromId) || {
    name: "Group Member",
    profileImage: "",
    profilePic: ""
  };

  const toUser = members.find(m => m._id === toId) || balance.to || {
    name: "Group Member",
    profileImage: "",
    profilePic: ""
  };

  const fromName = fromUser.name || "Squad Member";
  const toName = toUser.name || "Squad Member";

  const fromAvatar = fromUser.profileImage || fromUser.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";
  const toAvatar = toUser.profileImage || toUser.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

  return (
    <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-4 flex items-center justify-between hover:bg-white hover:shadow-md transition-all duration-300 gap-4 text-left">
      {/* Visual Flow: Avatar 1 -> Arrow -> Avatar 2 */}
      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
        <div className="flex items-center space-x-1 shrink-0">
          <img
            src={fromAvatar}
            alt={fromName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-655 shadow-sm">
            <ArrowRight className="w-4 h-4" />
          </div>
          <img
            src={toAvatar}
            alt={toName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        </div>

        <div className="min-w-0 flex-1 text-xs pr-2">
          <p className="font-medium text-slate-500 leading-snug">
            <span className="text-slate-800 font-semibold">{fromName}</span> owes{" "}
            <span className="text-slate-800 font-semibold">{toName}</span>
          </p>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Settle up split</span>
        </div>
      </div>

      {/* Right: Settle amount */}
      <div className="shrink-0 text-right bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-xl shadow-inner">
        <span className="text-xs font-bold text-emerald-500 block leading-none">Owes</span>
        <span className="text-base font-black text-emerald-800 mt-1 block">
          ₹{balance.amount?.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
