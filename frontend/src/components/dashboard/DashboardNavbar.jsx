import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, LogOut, User, Settings, Shield } from "lucide-react";

export default function DashboardNavbar({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  // Safe fallback avatar
  const avatarUrl = user?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

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

            {/* User Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-300 focus:outline-none"
              >
                <img
                  src={avatarUrl}
                  alt={user?.name || "User profile"}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-teal-500/20"
                />
                <span className="text-slate-400 hover:text-slate-200 text-xs hidden sm:inline-block">
                  &#9662;
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  {/* Overlay to close on click outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  ></div>

                  <div className="absolute right-0 mt-2.5 w-52 bg-slate-900 border border-slate-850 rounded-2xl shadow-xl py-2 z-20 animate-fade-in divide-y divide-slate-800">
                    <div className="px-4 py-3 md:hidden">
                      <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          alert("Profile settings features coming soon!");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                      >
                        <User className="w-4 h-4 text-teal-400" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          alert("System settings features coming soon!");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-blue-400" />
                        <span>Settings</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center space-x-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
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
