import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Compass, ArrowLeft, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/auth/google",
        {
          credential: credentialResponse.credential,
        }
      );
      
      console.log("Auth Response:", res.data);
      
      // Save token & user in localStorage if provided
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      
      // Navigate to dashboard if it exists, or display success
      alert("Successfully logged in!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login server error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to connect to authentication server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Google Login Failed");
    setErrorMsg("Google authentication failed. Please try again.");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-800 to-teal-950">
      {/* Decorative Orbs */}
      <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-teal-500/25 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center space-x-2 text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700/30 backdrop-blur-md transition-all duration-300 transform active:scale-95 z-20 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-[450px] bg-slate-900/60 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-8 sm:p-10 shadow-2xl z-10 text-center flex flex-col items-center">
        {/* App Logo */}
        <div className="p-3 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl text-white shadow-xl shadow-teal-500/20 mb-6">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Welcome to TripSync
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-[280px] mx-auto">
          Continue with Google to start planning trips with your friends.
        </p>

        {/* Google Authentication Component wrapper */}
        <div className="w-full flex justify-center py-2 relative">
          {loading ? (
            <div className="flex flex-col items-center space-y-3 py-2 text-teal-400 font-medium text-sm">
              <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="transform hover:scale-[1.02] transition-transform duration-300 shadow-md rounded-lg overflow-hidden">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </div>
          )}
        </div>

        {/* Error message displays */}
        {errorMsg && (
          <div className="mt-6 flex items-start space-x-2 bg-rose-500/10 border border-rose-500/25 text-rose-200 text-xs text-left p-4 rounded-2xl w-full">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Footer info inside card */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 w-full text-xs text-slate-500">
          <p>By signing in, you agree to organize adventures.</p>
        </div>
      </div>
    </div>
  );
}