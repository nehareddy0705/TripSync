import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import "./index.css";

// Global axios response interceptor to handle expired/invalid tokens (e.g. 401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  console.error("VITE_GOOGLE_CLIENT_ID is not defined in the environment variables!");
  ReactDOM.createRoot(document.getElementById("root")).render(
    <div style={{
      padding: "2rem",
      fontFamily: "sans-serif",
      background: "#fff5f5",
      color: "#c53030",
      border: "1px solid #feb2b2",
      borderRadius: "0.5rem",
      margin: "2rem auto",
      maxWidth: "600px"
    }}>
      <h1 style={{ margin: "0 0 1rem 0", fontSize: "1.5rem" }}>Environment Configuration Error</h1>
      <p style={{ margin: "0 0 1rem 0", lineHeight: "1.5" }}>
        The environment variable <strong>VITE_GOOGLE_CLIENT_ID</strong> is missing or undefined.
      </p>
      <p style={{ margin: "0", fontSize: "0.9rem", color: "#742a2a" }}>
        <strong>Steps to fix:</strong><br />
        1. Make sure you have a <code>.env</code> file in your <code>frontend</code> folder containing <code>VITE_GOOGLE_CLIENT_ID=...</code>.<br />
        2. <strong>Restart the Vite development server</strong> in your terminal (press <code>Ctrl + C</code> and run <code>npm run dev</code> again) so Vite can load the new environment variables.
      </p>
    </div>
  );
} else {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  );
}
