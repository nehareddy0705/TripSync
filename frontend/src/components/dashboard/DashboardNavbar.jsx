import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, LogOut } from "lucide-react";
import Avatar from "../Avatar";

export default function DashboardNavbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              TripSync
            </span>
            <span className="hidden sm:inline-block bg-slate-800 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-700/50">
              Dashboard
            </span>
          </Link>

          {/* User Profile & Navigation */}
          <div className="flex items-center space-x-4">
            {/* User Info (hidden on small screen) */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200">{user?.name || "Guest User"}</span>
              <span className="text-xs text-slate-400">{user?.email || ""}</span>
            </div>

            {/* User Profile Avatar (dropdown feature removed) */}
            <div className="flex items-center p-0.5 rounded-lg border border-slate-800">
              <Avatar
                name={user?.name}
                imageUrl={user?.profileImage}
                size="w-8 h-8"
              />
            </div>

            {/* Quick Logout Button */}
            <button
              onClick={handleLogoutClick}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/25 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
