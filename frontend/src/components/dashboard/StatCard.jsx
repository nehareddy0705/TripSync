import React from "react";

export default function StatCard({ title, value, icon: Icon, color = "teal", description }) {
  // Map color schemes to styles
  const colorMap = {
    teal: {
      bg: "from-teal-500/5 to-teal-600/10",
      border: "hover:border-teal-500/30 border-slate-200",
      iconBg: "bg-teal-50 text-teal-600",
      text: "text-teal-600"
    },
    blue: {
      bg: "from-blue-500/5 to-blue-600/10",
      border: "hover:border-blue-500/30 border-slate-200",
      iconBg: "bg-blue-50 text-blue-600",
      text: "text-blue-600"
    },
    purple: {
      bg: "from-purple-500/5 to-purple-600/10",
      border: "hover:border-purple-500/30 border-slate-200",
      iconBg: "bg-purple-50 text-purple-600",
      text: "text-purple-600"
    },
    emerald: {
      bg: "from-emerald-500/5 to-emerald-600/10",
      border: "hover:border-emerald-500/30 border-slate-200",
      iconBg: "bg-emerald-50 text-emerald-600",
      text: "text-emerald-600"
    }
  };

  const scheme = colorMap[color] || colorMap.teal;

  return (
    <div className={`relative bg-gradient-to-br ${scheme.bg} bg-white rounded-3xl p-6 border ${scheme.border} hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1 transition-all duration-300 group`}>
      <div className="flex justify-between items-center">
        {/* Info */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          {description && (
            <p className="text-xs text-slate-400 font-medium">{description}</p>
          )}
        </div>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl ${scheme.iconBg} flex items-center justify-center shadow-inner group-hover:scale-110 transition-all duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative subtle gradient background circle */}
      <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-gradient-to-br from-transparent to-slate-200/50 rounded-br-3xl -z-10 group-hover:scale-125 transition-transform duration-300"></div>
    </div>
  );
}
