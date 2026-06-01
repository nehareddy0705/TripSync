import React, { useState, useRef } from "react";
import { X, UploadCloud, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function UploadPhotoModal({ isOpen, onClose, tripId, onSuccess }) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const isCloudinaryConfigured = !!(cloudName && uploadPreset);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file (png, jpg, jpeg, etc.).");
      return;
    }
    setErrorMsg("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadProgress(0);
    setErrorMsg("");
  };

  const handleClose = () => {
    clearSelection();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!isCloudinaryConfigured) {
      setErrorMsg("Cloudinary is not configured. Add credentials to your .env file.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setUploadProgress(10); // start indicator

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", uploadPreset);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 90) / progressEvent.total // save 10% for DB save step
            );
            setUploadProgress(Math.max(10, percentCompleted));
          }
        }
      );

      const imageUrl = cloudinaryRes.data.secure_url;
      if (!imageUrl) {
        throw new Error("Failed to retrieve image URL from Cloudinary.");
      }

      // 2. Save metadata to Backend
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/photo",
        { tripId, imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUploadProgress(100);
      setLoading(false);
      onSuccess("Photo uploaded successfully!");
      handleClose();
    } catch (err) {
      console.error("Image upload flow failed:", err);
      const errMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Upload failed. Verify Cloudinary preset and network connectivity.";
      setErrorMsg(errMsg);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-[500px] shadow-2xl z-10 animate-fade-in text-left flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 pr-6 shrink-0">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Photo</h3>
          <p className="text-slate-500 text-sm">
            Share a memory with your group members.
          </p>
        </div>

        {/* Configuration alert banner */}
        {!isCloudinaryConfigured && (
          <div className="mt-4 shrink-0 flex items-start space-x-3 bg-amber-50 border border-amber-100 text-amber-800 text-xs p-4 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-extrabold">Cloudinary Credentials Missing</p>
              <p className="text-amber-700">
                To upload real photos, please define keys inside your <code className="bg-amber-100/60 px-1 py-0.5 rounded font-mono font-bold">frontend/.env</code> file:
              </p>
              <pre className="bg-amber-100/50 p-1.5 rounded font-mono text-[10px] mt-1 select-all font-bold block">
                VITE_CLOUDINARY_CLOUD_NAME=your_name{"\n"}
                VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
              </pre>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-5 flex-1 overflow-y-auto pr-1">
          {/* Upload Drop Zone / Preview */}
          {!previewUrl ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 min-h-[220px] ${
                dragActive 
                  ? "border-teal-500 bg-teal-50/20" 
                  : "border-slate-200 hover:border-teal-400 hover:bg-slate-50/30"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                <UploadCloud className="w-6 h-6 text-slate-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  Drag & drop your photo here
                </p>
                <p className="text-xs text-slate-400">
                  or click to browse from files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            // Local Preview container
            <div className="space-y-3">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 max-h-[260px] flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[250px] max-w-full object-contain"
                />
                
                {/* Clear preview button */}
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={loading}
                  className="absolute top-3 right-3 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-all"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-center text-xs text-slate-450 font-semibold px-1">
                <span className="truncate max-w-[70%]">{selectedFile?.name}</span>
                <span>{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1">
                <span>Uploading to Cloudinary...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-150">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-start space-x-2 bg-rose-550/5 border border-rose-500/10 text-rose-700 text-xs p-3.5 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-550 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-1/3 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile || !isCloudinaryConfigured}
              className="w-2/3 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 shadow-md shadow-teal-100 transform active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Memory</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
