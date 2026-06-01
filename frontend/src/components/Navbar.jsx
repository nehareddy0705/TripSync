import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl text-white shadow-md shadow-teal-100 group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
              TripSync
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              How It Works
            </a>
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-teal-105/20 transform active:scale-95"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-teal-100 transform active:scale-95"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xl px-4 py-4 space-y-3 animate-fade-in">
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-slate-700 hover:text-teal-600 hover:bg-slate-50 font-medium rounded-xl transition-all"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-slate-700 hover:text-teal-600 hover:bg-slate-50 font-medium rounded-xl transition-all"
          >
            How It Works
          </a>
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100/50"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100/50"
            >
              Get Started
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
