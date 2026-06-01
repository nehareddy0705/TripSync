import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Compass, Plane, Calendar, MapPin, Sparkles } from "lucide-react";
import axios from "axios";
import { logActivity } from "../utils/mockData";

export default function CreateTripPlaceholder() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    inviteCode: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auth check
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !userStr) {
      navigate("/login");
    } else {
      setCurrentUser(JSON.parse(userStr));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Trip title is required";
    if (!formData.destination.trim()) newErrors.destination = "Destination is required";
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after or equal to the start date";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    const body = {
      title: formData.title,
      destination: formData.destination,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined
    };

    if (formData.inviteCode.trim()) {
      body.inviteCode = formData.inviteCode.trim().toUpperCase();
    }

    axios.post("http://localhost:4000/trip", body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      setLoading(false);
      
      // Log frontend activity
      try {
        logActivity({
          user: "You",
          avatar: currentUser?.profileImage,
          text: `created a new trip '${res.data.trip.title}'`,
          tripTitle: res.data.trip.title,
          time: "Just now"
        });
      } catch (logErr) {
        console.error("Activity logging failed:", logErr);
      }

      navigate("/dashboard");
    })
    .catch((err) => {
      console.error("Create trip error:", err);
      const errMsg = err.response?.data?.message || "Failed to create trip. Please verify network or inputs.";
      setErrors({ submit: errMsg });
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2 text-slate-600 hover:text-teal-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg text-white">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">TripSync</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-12 px-4 sm:px-6 max-w-2xl mx-auto w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-100/40 space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center space-x-1 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create adventure</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Plan a New Trip</h1>
            <p className="text-slate-500 text-sm">
              Fill in your travel details to create a collaborative workspace for your group.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Trip Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Plane className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Getaway to Bali"
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all ${
                    errors.title ? "border-rose-400 ring-rose-500/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.title && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.title}</p>}
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <label htmlFor="destination" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Destination
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="destination"
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g. Bali, Indonesia"
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all ${
                    errors.destination ? "border-rose-400 ring-rose-500/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.destination && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.destination}</p>}
            </div>

            {/* Dates (Start / End) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all ${
                      errors.startDate ? "border-rose-400 ring-rose-500/10" : "border-slate-200"
                    }`}
                  />
                </div>
                {errors.startDate && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="endDate" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  End Date (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all ${
                      errors.endDate ? "border-rose-400 ring-rose-500/10" : "border-slate-200"
                    }`}
                  />
                </div>
                {errors.endDate && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.endDate}</p>}
              </div>
            </div>

            {/* Invite Code */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="inviteCode" className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Custom Invite Code
                </label>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Optional</span>
              </div>
              <input
                id="inviteCode"
                type="text"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                maxLength={8}
                placeholder="e.g. MYCODE26"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all uppercase"
              />
              <p className="text-slate-400 text-xs">If left blank, a random code will be generated for your friends to join.</p>
            </div>

            {errors.submit && (
              <p className="text-sm text-rose-500 font-semibold text-center">{errors.submit}</p>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <Link
                to="/dashboard"
                className="w-1/3 py-3.5 rounded-2xl font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-center text-sm flex items-center justify-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-100 transform active:scale-95 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Planning...</span>
                  </>
                ) : (
                  <span>Create Trip Workspace</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-100">
        <p>&copy; {new Date().getFullYear()} TripSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
