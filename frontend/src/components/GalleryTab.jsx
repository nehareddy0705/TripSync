import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";

// Components
import UploadPhotoModal from "./UploadPhotoModal";
import PhotoCard from "./PhotoCard";
import ImagePreviewModal from "./ImagePreviewModal";

export default function GalleryTab({ tripId, tripCreatorId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activePhotoPreview, setActivePhotoPreview] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, [tripId]);

  const fetchPhotos = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setErrorMsg("");

    axios.get(`http://localhost:4000/photo/${tripId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      setPhotos(res.data.photos || []);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Fetch photos error:", err);
      setErrorMsg("Failed to load photo gallery. Please verify backend status.");
      setLoading(false);
    });
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleActionSuccess = (message) => {
    showToast(message);
    fetchPhotos(); // reload photo lists
  };

  return (
    <div className="space-y-6 text-left relative animate-fade-in">
      
      {/* Toast Alert */}
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

      {/* Header & Upload Button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Shared Photo Gallery</h3>
          <p className="text-slate-500 text-sm mt-0.5">
            Capture and preserve beautiful moments from this journey with your travel squad.
          </p>
        </div>

        {photos.length > 0 && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100/50 hover:shadow-lg hover:shadow-teal-100 transition-all duration-300 transform active:scale-95 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        )}
      </div>

      {/* Content Rendering */}
      {loading ? (
        // Grid Loading Skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          <div className="aspect-square border border-slate-200 bg-slate-50 rounded-3xl"></div>
          <div className="aspect-square border border-slate-200 bg-slate-50 rounded-3xl"></div>
          <div className="aspect-square border border-slate-200 bg-slate-50 rounded-3xl"></div>
          <div className="aspect-square border border-slate-200 bg-slate-50 rounded-3xl"></div>
        </div>
      ) : errorMsg ? (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-10 text-center space-y-4 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-550 shrink-0" />
          <p className="text-rose-700 text-sm font-semibold">{errorMsg}</p>
          <button 
            onClick={fetchPhotos}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : photos.length === 0 ? (
        // Empty State
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center shadow-inner">
            <span className="text-2xl select-none">📷</span>
          </div>
          <div className="space-y-2 max-w-sm">
            <h4 className="text-lg font-bold text-slate-800">No photos yet</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Start capturing memories from this trip. Share hotels, landmarks, road trips, or group photos!
            </p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-md shadow-teal-100 transition-all duration-300 transform active:scale-95 group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            <span>Upload First Photo</span>
          </button>
        </div>
      ) : (
        // Photos Grid Layout
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <PhotoCard
              key={photo._id}
              photo={photo}
              tripCreatorId={tripCreatorId}
              onClick={setActivePhotoPreview}
              onDeleteSuccess={handleActionSuccess}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadPhotoModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        tripId={tripId}
        onSuccess={handleActionSuccess}
      />

      {/* Fullscreen Preview Lightbox Modal */}
      <ImagePreviewModal
        isOpen={!!activePhotoPreview}
        onClose={() => setActivePhotoPreview(null)}
        photo={activePhotoPreview}
      />
      
    </div>
  );
}
