import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Compass, 
  Map, 
  Users, 
  CalendarRange, 
  Sparkles,
  Plane,
  FolderOpen,
  ArrowRight
} from "lucide-react";

// Components
import DashboardNavbar from "./dashboard/DashboardNavbar";
import StatCard from "./dashboard/StatCard";
import ActionCard from "./dashboard/ActionCard";
import TripCard from "./dashboard/TripCard";
import RecentActivity from "./dashboard/RecentActivity";
import JoinTripModal from "./dashboard/JoinTripModal";

// Utilities
import axios from "axios";
import { getActivities, logActivity } from "../utils/mockData";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // States
  const [currentUser, setCurrentUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'upcoming', 'past'
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Load user and initialize data
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userStr) {
      // Direct back to login if unauthenticated
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userStr);
    setCurrentUser(parsedUser);
    
    // Fetch real data from MongoDB
    loadDashboardData(token);
  }, [navigate]);

  const loadDashboardData = (token) => {
    const activeToken = token || localStorage.getItem("token");
    setLoading(true);
    setErrorMsg("");

    axios.get("http://localhost:4000/trip", {
      headers: {
        Authorization: `Bearer ${activeToken}`
      }
    })
    .then((res) => {
      setTrips(res.data.trips || []);
      setActivities(getActivities());
      setLoading(false);
    })
    .catch((err) => {
      console.error("Fetch trips error:", err);
      setErrorMsg("Failed to load trips from the server. Is the backend running?");
      setLoading(false);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleJoinTripSuccess = async (inviteCode) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("http://localhost:4000/trip/join", {
        inviteCode
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Reload trips list
      loadDashboardData(token);

      // Log frontend activity
      try {
        logActivity({
          user: "You",
          avatar: currentUser?.profileImage,
          text: `joined the trip '${res.data.trip.title}' using the invite code`,
          tripTitle: res.data.trip.title,
          time: "Just now"
        });
      } catch (logErr) {
        console.error("Activity logging failed:", logErr);
      }
    } catch (err) {
      console.error("Join trip API error:", err);
      throw err; // Re-throw to display error inside the modal
    }
  };

  // Recalculate statistics
  const totalTripsCount = trips.length;
  
  const upcomingTripsCount = trips.filter(trip => {
    if (!trip.startDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(trip.startDate) >= today;
  }).length;

  const joinedTripsCount = trips.filter(trip => {
    const userMeId = currentUser?._id || "user_me";
    return trip.creator._id !== userMeId;
  }).length;

  // Filtered trips for list
  const filteredTrips = trips.filter(trip => {
    if (activeTab === "all") return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(trip.startDate);
    const end = trip.endDate ? new Date(trip.endDate) : new Date(trip.startDate);

    if (activeTab === "upcoming") {
      return start >= today || (start <= today && end >= today); // Future or currently active
    }
    if (activeTab === "past") {
      return end < today; // Completed
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <DashboardNavbar user={currentUser} onLogout={handleLogout} />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[80px] left-[5%] w-80 h-80 bg-teal-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-[40%] right-[5%] w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Welcome Section */}
        <section className="mb-10 text-left animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready for the next adventure?</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Welcome back, {currentUser?.name?.split(" ")[0] || "Traveler"}! 🗺️
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Collaborate with friends, log expenses, and build daily itineraries seamlessly.
              </p>
            </div>
            
            {/* Quick Status Pill */}
            <div className="shrink-0 flex items-center bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm text-xs font-medium space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600 font-bold uppercase tracking-wider">Sync Connection Active</span>
            </div>
          </div>
        </section>

        {/* Action Cards Panel */}
        <section className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="h-full">
            <ActionCard
              title="Plan a New Trip"
              description="Design a brand new travel schedule, pick destinations, and generate a code to invite friends."
              icon={PlusCircle}
              actionText="Plan a Trip"
              to="/create-trip"
              variant="primary"
            />
          </div>
          <div className="h-full">
            <ActionCard
              title="Join a Trip"
              description="Got an invite code from your friends? Enter it here to join their itinerary instantly."
              icon={Compass}
              actionText="Enter Invite Code"
              onClick={() => setIsJoinModalOpen(true)}
              variant="secondary"
            />
          </div>
        </section>

        {/* Statistics Widgets */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatCard
            title="Total Trips"
            value={totalTripsCount}
            icon={Map}
            color="teal"
            description="Created or joined"
          />
          <StatCard
            title="Upcoming Trips"
            value={upcomingTripsCount}
            icon={CalendarRange}
            color="blue"
            description="Adventures scheduled"
          />
          <StatCard
            title="Trips Joined"
            value={joinedTripsCount}
            icon={Users}
            color="purple"
            description="Group collaborations"
          />
        </section>

        {/* Main Content: Dashboard Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: My Trips (8 cols) */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* List Header & Tabs */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-4">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight text-left">
                My Trips
              </h3>
              
              {/* Tab Switches */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTab === "all"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All ({trips.length})
                </button>
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTab === "upcoming"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Upcoming ({upcomingTripsCount})
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTab === "past"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Past ({trips.length - upcomingTripsCount})
                </button>
              </div>
            </div>

            {/* List Body */}
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium">Fetching your adventures...</p>
              </div>
            ) : errorMsg ? (
              <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center shadow-sm space-y-4 flex flex-col items-center justify-center">
                <p className="text-rose-700 text-sm font-semibold">{errorMsg}</p>
                <button 
                  onClick={() => loadDashboardData()}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all transform active:scale-95"
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredTrips.length === 0 ? (
              // Beautiful Empty State
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm space-y-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                  <FolderOpen className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h4 className="text-lg font-bold text-slate-800">No Trips Found</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {activeTab === "all" 
                      ? "You don't have any trips planned yet. Click the button below to start creating one!"
                      : activeTab === "upcoming"
                      ? "No upcoming trips scheduled. Check past trips or plan a new trip!"
                      : "No past adventures logged. Pack your bags and go travel!"}
                  </p>
                </div>
                {activeTab === "all" && (
                  <button
                    onClick={() => navigate("/create-trip")}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100/50 transition-all duration-300 transform active:scale-95 group"
                  >
                    <span>Plan Your First Trip</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            ) : (
              // Trip Cards Grid
              <div className="grid sm:grid-cols-2 gap-6">
                {filteredTrips.map((trip) => (
                  <div key={trip._id || trip.id} className="h-full">
                    <TripCard
                      trip={trip}
                      currentUser={currentUser}
                      onClick={() => navigate(`/trip/${trip._id}`)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right Column: Recent Activity (4 cols) */}
          <section className="lg:col-span-4 h-full">
            <RecentActivity activities={activities} />
          </section>

        </div>
      </div>

      {/* Join Invite Code Modal */}
      <JoinTripModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinSuccess={handleJoinTripSuccess}
      />
    </div>
  );
}
