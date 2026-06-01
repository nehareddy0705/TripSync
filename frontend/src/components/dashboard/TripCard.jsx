import React from "react";
import { Calendar, MapPin, Users, Compass } from "lucide-react";

export default function TripCard({ trip, currentUser, onClick }) {
  const { title, destination, startDate, endDate, inviteCode, creator, members = [] } = trip;
  
  // Format Dates
  const formatDateRange = (startStr, endStr) => {
    if (!startStr) return "Dates pending";
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : null;
    
    const options = { month: "short", day: "numeric" };
    const yearOptions = { year: "numeric" };
    
    const startFormatted = start.toLocaleDateString("en-US", options);
    
    if (end) {
      const endFormatted = end.toLocaleDateString("en-US", options);
      const yearFormatted = start.toLocaleDateString("en-US", yearOptions);
      return `${startFormatted} - ${endFormatted}, ${yearFormatted}`;
    }
    return `${startFormatted}, ${start.toLocaleDateString("en-US", yearOptions)}`;
  };

  // Determine Trip Status
  const getTripStatus = (startStr, endStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date(startStr);
    
    if (end < today) {
      return { label: "Past", style: "bg-slate-100 text-slate-600 border-slate-200" };
    } else if (start <= today && end >= today) {
      return { label: "Active", style: "bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse" };
    } else {
      return { label: "Upcoming", style: "bg-teal-50 text-teal-700 border-teal-100" };
    }
  };

  const status = getTripStatus(startDate, endDate);
  
  // Check if current user is creator
  const userMeId = currentUser?._id || "user_me";
  const isCreator = creator?._id === userMeId;

  // Invite code display fallback
  const inviteCodeDisplay = inviteCode || "N/A";

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white border border-slate-200 rounded-3xl p-6 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1.5 transition-all duration-350 cursor-pointer flex flex-col justify-between h-full"
    >
      {/* Card Header (Destination & Badges) */}
      <div>
        <div className="flex justify-between items-start gap-2 mb-4">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[140px]">{destination}</span>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.style}`}>
              {status.label}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isCreator 
                ? "bg-blue-50 text-blue-700 border-blue-100" 
                : "bg-purple-50 text-purple-700 border-purple-100"
            }`}>
              {isCreator ? "Host" : "Joined"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-teal-600 transition-colors duration-250 mb-2">
          {title}
        </h4>

        {/* Date */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formatDateRange(startDate, endDate)}</span>
        </div>
      </div>

      {/* Card Footer (Invite Code & Members Stack) */}
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
        {/* Code display */}
        <div className="text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invite Code</p>
          <code className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/50">
            {inviteCodeDisplay}
          </code>
        </div>

        {/* Avatar Stack */}
        <div className="flex items-center">
          <div className="flex -space-x-2.5 overflow-hidden">
            {members.slice(0, 3).map((member, idx) => (
              <img
                key={member._id || idx}
                className="inline-block h-7 w-7 rounded-full object-cover ring-2 ring-white"
                src={member.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                alt={member.name}
                title={member.name}
              />
            ))}
          </div>
          {members.length > 3 && (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 h-7 min-w-7 px-1.5 flex items-center justify-center rounded-full ml-1 scale-95 ring-2 ring-white">
              +{members.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
