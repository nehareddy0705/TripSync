import { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext";

/**
 * Custom hook to consume the SocketContext
 * @returns {object} socket state values and event triggers
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
