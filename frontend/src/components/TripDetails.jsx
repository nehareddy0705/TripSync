import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Copy, 
  Check, 
  Share2, 
  ArrowLeft, 
  MessageSquare, 
  DollarSign, 
  Image as ImageIcon,
  Clock, 
  ShieldAlert,
  Sparkles,
  Plane,
  ListTodo
} from "lucide-react";
import ItineraryTab from "./ItineraryTab";
import PollsTab from "./PollsTab";
import ExpensesTab from "./ExpensesTab";
import GalleryTab from "./GalleryTab";
import Avatar from "./Avatar";

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  // State
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'itinerary', 'polls', 'expenses', 'gallery'
  const [copied, setCopied] = useState(false);

  // Dynamic counts for overview screen
  const [itineraryCount, setItineraryCount] = useState(0);
  const [pollsCount, setPollsCount] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // Fetch Trip Details & Stats concurrently on Mount, Id Change or Tab Switch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/trip/${tripId}`, { headers }),
      axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/itinerary/${tripId}`, { headers }).catch(() => ({ data: { activities: [] } })),
      axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/poll/${tripId}`, { headers }).catch(() => ({ data: { polls: [] } })),
      axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/expense/${tripId}`, { headers }).catch(() => ({ data: { expenses: [] } }))
    ])
    .then(([tripRes, itineraryRes, pollsRes, expensesRes]) => {
      setTrip(tripRes.data.trip);
      setItineraryCount(itineraryRes.data.activities?.length || 0);
      setPollsCount(pollsRes.data.polls?.length || 0);
      
      const exps = expensesRes.data.expenses || [];
      const sum = exps.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      setTotalExpenses(sum);
      
      setLoading(false);
    })
    .catch((err) => {
      console.error("Fetch trip overview details error:", err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Failed to load trip details.";
      setError({ status, message: msg });
      setLoading(false);
    });
  }, [tripId, activeTab, navigate]);

  // Date Formatting Helper
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

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!trip?.inviteCode) return;
    navigator.clipboard.writeText(trip.inviteCode.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share invite code link (placeholder action)
  const handleShareCode = () => {
    if (!trip?.inviteCode) return;
    if (navigator.share) {
      navigator.share({
        title: `Join our TripSync workspace: ${trip.title}`,
        text: `Hey! Use my invite code: ${trip.inviteCode} to join our group trip planner workspace.`,
        url: window.location.origin
      }).catch((e) => console.log("Sharing cancelled"));
    } else {
      alert(`Invite Text:\nJoin our trip "${trip.title}" on TripSync!\nInvite Code: ${trip.inviteCode.toUpperCase()}`);
    }
  };

  // Render Loader Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-pulse text-left">
        {/* Back Link skeleton */}
        <div className="w-28 h-5 bg-slate-200 rounded-lg"></div>

        {/* Hero Card skeleton */}
        <div className="h-64 bg-slate-200 rounded-3xl w-full"></div>

        {/* Grid skeleton */}
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            <div className="h-16 bg-slate-200 rounded-2xl w-full"></div>
            <div className="h-96 bg-slate-200 rounded-3xl w-full"></div>
          </div>
          <div className="md:col-span-4 space-y-6">
            <div className="h-32 bg-slate-200 rounded-3xl w-full"></div>
            <div className="h-64 bg-slate-200 rounded-3xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render Error Card (404/403)
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900">
              {error.status === 403 ? "Access Denied" : "Workspace Not Found"}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {error.status === 403 
                ? "You do not have access to this trip details. Ensure you are signed in with the correct account or added as a member."
                : "The trip workspace you are trying to view does not exist or has been deleted."}
            </p>
          </div>
          <div className="flex gap-4 pt-2">
            <Link
              to="/dashboard"
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentUserStr = localStorage.getItem("user");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isHost = trip.creator?._id === currentUser?._id;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white pb-16">
      
      {/* Top Details Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Back navigation link */}
        <div className="text-left">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center space-x-2 text-slate-500 hover:text-teal-600 transition-colors font-medium text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* 1. Large Hero Header Section */}
        <section className="relative bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 text-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-teal-500/10 overflow-hidden text-left animate-fade-in">
          {/* Decorative shapes inside hero */}
          <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[10%] left-[20%] w-60 h-60 bg-teal-300/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collaborative Workspace</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                {trip.title} 🌴
              </h1>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-teal-50/90 text-sm font-medium">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 opacity-90" />
                  {trip.destination}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 opacity-90" />
                  {formatDateRange(trip.startDate, trip.endDate)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid & Action Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Stat 1: Members */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm  text-left flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Members</p>
              <h4 className="text-2xl font-black text-slate-900">{trip.members?.length || 1}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-650 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 2: Itinerary Activities */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm  text-left flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Itinerary items</p>
              <h4 className="text-2xl font-black text-slate-900">{itineraryCount}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-650 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 3: Active Polls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Polls</p>
              <h4 className="text-2xl font-black text-slate-900">{pollsCount}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-650 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 4: Shared Expenses */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm  text-left flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Logged Costs</p>
              <h4 className="text-2xl font-black text-slate-900">
                ₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-650 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* 5. Navigation Tab Switcher */}
        <section className="border-b border-slate-200">
          <div className="flex space-x-6 overflow-x-auto scrollbar-hide py-1">
            {[
              { id: "overview", label: "Overview", icon: Clock },
              { id: "itinerary", label: "Itinerary", icon: ListTodo },
              { id: "polls", label: "Polls", icon: MessageSquare },
              { id: "expenses", label: "Expenses", icon: DollarSign },
              { id: "gallery", label: "Gallery", icon: ImageIcon }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 pb-3 text-sm font-semibold transition-all duration-200 border-b-2 whitespace-nowrap focus:outline-none ${
                    activeTab === tab.id
                      ? "border-teal-500 text-teal-650"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Workspace Content Columns */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Area (8 Columns) */}
          <section className="lg:col-span-8">
            
            {activeTab === "overview" ? (
              // 6. Overview Tab Content
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* Trip Details Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Trip Information</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-6 text-sm">
                    {/* Destination */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Destination</span>
                      <p className="font-semibold text-slate-800 flex items-center">
                        <MapPin className="w-4 h-4 text-teal-500 mr-2 shrink-0" />
                        {trip.destination}
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Travel Dates</span>
                      <p className="font-semibold text-slate-800 flex items-center">
                        <Calendar className="w-4 h-4 text-blue-500 mr-2 shrink-0" />
                        {formatDateRange(trip.startDate, trip.endDate)}
                      </p>
                    </div>

                    {/* Host */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Organized By</span>
                      <div className="flex items-center space-x-2.5 pt-1">
                        <Avatar 
                          name={trip.creator?.name} 
                          imageUrl={trip.creator?.profileImage} 
                          size="w-7 h-7" 
                          textClass="text-[10px]"
                          roundedClass="rounded-full"
                        />
                        <div>
                          <p className="font-bold text-slate-800 leading-none">{trip.creator?.name}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{trip.creator?.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Code */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Invite Code</span>
                      <div className="pt-0.5">
                        <code className="text-sm font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded border border-slate-205">
                          {trip.inviteCode?.toUpperCase() || "PENDING"}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Members list */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Plan Crew</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-full">
                      {trip.members?.length || 1} Members
                    </span>
                  </div>

                  {/* Responsive Grid for Members list */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {trip.members?.map((member) => {
                      const isMemberHost = member._id === trip.creator?._id;
                      return (
                        <div 
                          key={member._id} 
                          className="flex items-center space-x-3 p-3 bg-slate-50/50 border border-slate-150 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200"
                        >
                          <Avatar 
                            name={member.name} 
                            imageUrl={member.profileImage} 
                            size="w-10 h-10" 
                            textClass="text-sm"
                            roundedClass="rounded-full"
                          />
                          <div className="min-w-0 text-left">
                            <div className="flex items-center space-x-1.5">
                              <p className="font-bold text-slate-800 text-sm truncate">{member.name}</p>
                              {isMemberHost && (
                                <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                  Host
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 truncate block leading-none mt-0.5">{member.email}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Local Recent Activity feed placeholder */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      Local logs
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    No collaborative edits logged yet. When itinerary blocks are created, expenses logged, or votes cast, updates will show up here.
                  </p>
                </div>
              </div>
            ) : activeTab === "itinerary" ? (
              <ItineraryTab tripId={tripId} />
            ) : activeTab === "polls" ? (
              <PollsTab tripId={tripId} />
            ) : activeTab === "expenses" ? (
              <ExpensesTab tripId={tripId} members={trip?.members || []} />
            ) : activeTab === "gallery" ? (
              <GalleryTab tripId={tripId} tripCreatorId={trip?.creator?._id} />
            ) : (
              // tabs Coming Soon placeholder
              <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm space-y-6 flex flex-col items-center justify-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 text-teal-500 flex items-center justify-center shadow-inner animate-pulse">
                  <Sparkles className="w-8 h-8 text-teal-655 animate-pulse" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h4 className="text-xl font-extrabold text-slate-900">{activeTab.toUpperCase()} Workspace</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    This section of TripSync is currently coming soon. In the next release, you'll be able to manage collaborative schedules, split expenses, and share photos.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("overview")}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all transform active:scale-95"
                >
                  Return to Overview
                </button>
              </div>
            )}

          </section>

          {/* Right Sidebar (4 Columns) */}
          <section className="lg:col-span-4 space-y-6 text-left">
            
            {/* 2. Invite Code Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Invite Code</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Share this code with your friends so they can join this trip workspace.
                </p>
              </div>

              <div className="flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl py-4 font-mono text-3xl font-extrabold tracking-widest text-slate-800 uppercase select-all select-none">
                {trip.inviteCode?.toUpperCase() || "PENDING"}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-2xl text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleShareCode}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all duration-300 gap-2 shadow-md shadow-teal-100"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Quick Actions / Tips */}
            <div className="bg-white text-slate-500 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Plane className="w-5 h-5 text-teal-400" />
                <span className="text-sm font-bold tracking-tight">Traveler Tips</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Invite members to plan lodging, split expenses dynamically, cast poll votes, and upload memories under shared photo grids!
              </p>
              <div className="pt-2 border-t border-slate-400 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Syncing status: Online
              </div>
            </div>

          </section>

        </div>

      </div>

    </div>
  );
}
