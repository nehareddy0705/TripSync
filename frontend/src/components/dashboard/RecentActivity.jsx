import React from "react";
import { MessageSquare, Calendar, DollarSign, UserPlus, FileText } from "lucide-react";
import Avatar from "../Avatar";

export default function RecentActivity({ activities = [] }) {
  // Map words to icons for visual representation
  const getActivityIcon = (text = "") => {
    const lower = text.toLowerCase();
    if (lower.includes("expense") || lower.includes("settled") || lower.includes("$")) {
      return { Icon: DollarSign, color: "text-emerald-500 bg-emerald-50 border-emerald-100" };
    }
    if (lower.includes("itinerary") || lower.includes("schedule") || lower.includes("added")) {
      return { Icon: Calendar, color: "text-blue-500 bg-blue-50 border-blue-100" };
    }
    if (lower.includes("joined") || lower.includes("member")) {
      return { Icon: UserPlus, color: "text-purple-500 bg-purple-50 border-purple-100" };
    }
    if (lower.includes("poll") || lower.includes("vote")) {
      return { Icon: MessageSquare, color: "text-amber-500 bg-amber-50 border-amber-100" };
    }
    return { Icon: FileText, color: "text-teal-500 bg-teal-50 border-teal-100" };
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center">
        <p className="text-sm text-slate-500">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h3>
        <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
          Live Feed
        </span>
      </div>

      {/* Timeline List */}
      <div className="relative flex-1 space-y-6">
        {/* Vertical Timeline Line */}
        <div className="absolute left-[22px] top-2 bottom-6 w-0.5 bg-slate-100 -z-10"></div>

        {activities.map((activity, index) => {
          const { Icon, color } = getActivityIcon(activity.text);

          return (
            <div key={activity.id || index} className="flex gap-4 items-start group animate-fade-in">
              {/* User Avatar & Sub-Icon */}
              <div className="relative shrink-0">
                <Avatar
                  name={activity.user}
                  imageUrl={activity.avatar}
                  size="w-11 h-11"
                  roundedClass="rounded-full ring-2 ring-slate-100"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border flex items-center justify-center shadow-sm ${color}`}>
                  <Icon className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Activity Details */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">{activity.user} </span>
                  {activity.text}
                  {activity.tripTitle && (
                    <span className="font-semibold text-slate-600 block sm:inline">
                      {" "}in <span className="text-teal-600 hover:underline cursor-pointer">{activity.tripTitle}</span>
                    </span>
                  )}
                </p>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  {activity.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
