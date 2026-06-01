import React from "react";
import { Link } from "react-router-dom";
import { 
  CalendarRange, 
  BarChart3, 
  Coins, 
  Camera, 
  UserCheck, 
  PlusCircle, 
  PlaneTakeoff, 
  ArrowRight,
  ChevronRight,
  Compass
} from "lucide-react";
import Navbar from "./Navbar";
import travelHeroImg from "../assets/travel_hero.png";

export default function LandingPage() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-teal-50/40 via-white to-slate-50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-teal-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] right-[5%] w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="md:col-span-7 text-center md:text-left space-y-6">
              <div className="inline-flex items-center space-x-2 bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-teal-100/50 uppercase shadow-sm">
                <span>✨ Spark your wanderlust</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                Plan Group Trips <br className="hidden lg:block" />
                <span className="bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Without the Chaos
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Collaborate with friends, vote on plans, split expenses, and create unforgettable memories. Everything you need in one centralized place.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 pt-2">
                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 hover:from-teal-600 hover:to-blue-700 hover:shadow-xl hover:shadow-teal-100 transition-all duration-300 transform active:scale-95 group"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 hover:from-teal-600 hover:to-blue-700 hover:shadow-xl hover:shadow-teal-100 transition-all duration-300 transform active:scale-95 group"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <a
                  href="#features"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-base font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-300 transform active:scale-95"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="md:col-span-5 flex justify-center md:justify-end animate-float">
              <div className="relative w-full max-w-[450px] aspect-square rounded-3xl overflow-hidden bg-white shadow-2xl border border-slate-100 p-4">
                <img
                  src={travelHeroImg}
                  alt="Travel with friends illustration"
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-teal-600">Features</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything you need for perfect group travel
            </p>
            <p className="text-slate-600 leading-relaxed">
              Ditch the 100-message chat threads and messy spreadsheets. Sync your travel ideas effortlessly with custom tools.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CalendarRange className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Shared Itinerary Builder</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Create daily schedules and plan activities together. Let anyone add and edit items in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Group Polls</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Cast votes on hotels, travel dates, and activity spots. Find the best choices that satisfy the whole group.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Expense Splitting</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Log costs as you go. Automatically calculate fair splits and settle up balances easily at the end of the trip.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Shared Photo Gallery</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                A shared space to drop all your trip snapshots. Relive memories in high quality without losing details in chat compressed files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <h2 className="text-xs uppercase tracking-widest font-bold text-blue-600">Workflow</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Get going in three simple steps
            </p>
            <p className="text-slate-600 leading-relaxed">
              Simple, smooth, and designed to save your group valuable planning time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-100">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 pt-2">1. Sign in with Google</h3>
              <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                Connect instantly and securely using your Google Account. No password needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-100">
                <PlusCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 pt-2">2. Create or Join a Trip</h3>
              <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                Start a fresh trip itinerary or enter a shared trip code provided by your travel crew.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-100">
                <PlaneTakeoff className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 pt-2">3. Collaborate and Travel</h3>
              <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                Invite friends, finalize lodging, assign activities, split expenses, and head out!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-800 pb-8 mb-8">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-wider">TripSync</span>
            </div>
            <p className="text-sm text-slate-500 text-center md:text-right">
              Seamless travel planning, shared experiences.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} TripSync. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
