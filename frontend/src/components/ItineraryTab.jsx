import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  MapPin, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  PlaneTakeoff
} from "lucide-react";

// Components
import ActivityCard from "./ActivityCard";
import AddActivityModal from "./AddActivityModal";
import EditActivityModal from "./EditActivityModal";

export default function ItineraryTab({ tripId }) {
  // States
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Modal Controllers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null); // holds the activity object to edit
  const [activityToDelete, setActivityToDelete] = useState(null); // holds the activity ID to delete
  const [deleting, setDeleting] = useState(false);

  // Fetch Activities
  useEffect(() => {
    fetchItinerary();
  }, [tripId]);

  const fetchItinerary = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setErrorMsg("");

    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/itinerary/${tripId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      setActivities(res.data.activities || []);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Fetch itinerary error:", err);
      setErrorMsg("Failed to load itinerary activities. Please check your backend.");
      setLoading(false);
    });
  };

  // Toast Trigger Helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleSuccess = (message) => {
    showToast(message);
    fetchItinerary();
  };

  // Deletion logic
  const handleDeleteConfirm = () => {
    if (!activityToDelete) return;
    setDeleting(true);
    const token = localStorage.getItem("token");

    axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/itinerary/${activityToDelete}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      setDeleting(false);
      setActivityToDelete(null);
      showToast("Activity deleted successfully!");
      fetchItinerary(); // reload
    })
    .catch((err) => {
      console.error("Delete activity error:", err);
      setDeleting(false);
      setActivityToDelete(null);
      showToast("Failed to delete activity.", "error");
    });
  };

  // Group activities chronologically by local date string
  const groupActivitiesByDate = (activityList) => {
    const groups = {};
    activityList.forEach((act) => {
      if (!act.date) return;
      try {
        const dateObj = new Date(act.date);
        
        // Format, e.g., "Monday, June 15, 2026"
        const dateHeader = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        });

        if (!groups[dateHeader]) {
          groups[dateHeader] = [];
        }
        groups[dateHeader].push(act);
      } catch (e) {
        console.error("Date formatting error:", e);
      }
    });
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(activities);
  const orderedDates = Object.keys(groupedActivities);

  return (
    <div className="space-y-6 text-left relative animate-fade-in">
      
      {/* Dynamic Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-5 py-3.5 rounded-2xl shadow-xl animate-fade-in border ${
          toast.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
            : "bg-rose-50 text-rose-800 border-rose-100"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Title & Add Activity bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Shared Itinerary</h3>
          <p className="text-slate-500 text-sm mt-0.5">
            Coordinate times, plans, and reservations with your crew.
          </p>
        </div>
        
        {activities.length > 0 && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100/50 hover:shadow-lg hover:shadow-teal-100 transition-all duration-300 transform active:scale-95 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        )}
      </div>

      {/* Render Loader Skeletons */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded-lg w-40"></div>
          <div className="space-y-3">
            <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
            <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
          </div>
        </div>
      ) : errorMsg ? (
        // Error card
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center space-y-4 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-550 shrink-0" />
          <p className="text-rose-700 text-sm font-semibold">{errorMsg}</p>
          <button 
            onClick={fetchItinerary}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : activities.length === 0 ? (
        // 3. Premium Empty State
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center shadow-inner animate-bounce">
            <PlaneTakeoff className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h4 className="text-lg font-bold text-slate-800">No Activities Planned</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your travel itinerary is currently empty! Add beach visits, dining reservations, or road trip stops to start planning.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100 transition-all duration-300 transform active:scale-95 group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            <span>Add First Activity</span>
          </button>
        </div>
      ) : (
        // 8. Group Activities Calendar View
        <div className="space-y-8 relative pl-1">
          {/* Vertical calendar connecting timeline line */}
          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-slate-150 -z-10"></div>

          {orderedDates.map((dateHeader) => (
            <div key={dateHeader} className="space-y-4">
              
              {/* Date Heading Indicator */}
              <div className="flex items-center space-x-3 bg-slate-50 py-1 pr-4 rounded-full w-fit">
                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                  <CalendarDays className="w-3.5 h-3.5 text-teal-500" />
                </div>
                <h4 className="text-xs font-black text-slate-550 uppercase tracking-widest leading-none pt-0.5">
                  {dateHeader}
                </h4>
              </div>

              {/* Activities of this day */}
              <div className="space-y-3 pl-8">
                {groupedActivities[dateHeader].map((activity) => (
                  <ActivityCard
                    key={activity._id}
                    activity={activity}
                    onEdit={setActivityToEdit}
                    onDelete={setActivityToDelete}
                  />
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tripId={tripId}
        onSuccess={handleSuccess}
      />

      {/* Edit Modal */}
      <EditActivityModal
        isOpen={!!activityToEdit}
        onClose={() => setActivityToEdit(null)}
        activity={activityToEdit}
        onSuccess={handleSuccess}
      />

      {/* 6. Custom Delete Confirmation Modal */}
      {activityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setActivityToDelete(null)}
          ></div>
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl z-10 text-center space-y-6 animate-fade-in">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-550 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">Delete Activity?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Are you sure you want to delete this activity? This plan will be permanently removed from the shared group itinerary.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActivityToDelete(null)}
                disabled={deleting}
                className="w-1/3 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="w-2/3 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md shadow-rose-100 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Activity</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
