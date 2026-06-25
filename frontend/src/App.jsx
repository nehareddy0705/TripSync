import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/login";
import Dashboard from "./components/Dashboard";
import CreateTripPlaceholder from "./components/CreateTripPlaceholder";
import TripDetails from "./components/TripDetails";
import TripChat from "./pages/TripChat/TripChat";
import { SocketProvider } from "./contexts/SocketContext";

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-trip" element={<CreateTripPlaceholder />} />
          <Route path="/trip/:tripId" element={<TripDetails />} />
          <Route path="/trip/:tripId/chat" element={<TripChat />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;