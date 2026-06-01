import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ActionCard({ title, description, icon: Icon, actionText, onClick, to, variant = "primary" }) {
  const isLink = !!to;

  const content = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Icon wrapper */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-md ${
          variant === "primary"
            ? "bg-white/20 text-white"
            : "bg-teal-50 text-teal-600 border border-teal-100"
        }`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Text */}
        <h3 className={`text-xl font-bold tracking-tight mb-2 ${
          variant === "primary" ? "text-white" : "text-slate-900"
        }`}>
          {title}
        </h3>
        <p className={`text-sm leading-relaxed mb-6 ${
          variant === "primary" ? "text-teal-100" : "text-slate-500"
        }`}>
          {description}
        </p>
      </div>

      {/* Button link */}
      <span className={`inline-flex items-center text-sm font-semibold tracking-wide gap-1.5 transition-transform duration-300 group-hover:translate-x-1 ${
        variant === "primary" ? "text-white hover:text-teal-200" : "text-teal-600 hover:text-teal-700"
      }`}>
        <span>{actionText}</span>
        <ArrowRight className="w-4 h-4" />
      </span>
    </div>
  );

  const cardClassName = `group relative block w-full rounded-3xl p-8 border text-left cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.98] h-full ${
    variant === "primary"
      ? "bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 border-teal-400/20 text-white hover:shadow-teal-100/50"
      : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:shadow-slate-100/50"
  }`;

  if (isLink) {
    return (
      <Link to={to} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cardClassName}>
      {content}
    </button>
  );
}
