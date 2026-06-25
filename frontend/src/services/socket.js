import { io } from "socket.io-client";

// Falls back to localhost:4000 if VITE_API_URL is not set
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket = null;

/**
 * Initialize Socket.IO connection with authentication token
 * @param {string} token JWT token for authentication
 * @returns {object} socket instance
 */
export const initiateSocketConnection = (token) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    // Production settings: fallback to polling, then upgrade to websocket
    // because Render/Vercel proxies can drop websockets
    transports: ["polling", "websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  return socket;
};

/**
 * Get active socket instance
 * @returns {object|null} active socket instance
 */
export const getSocketInstance = () => {
  return socket;
};

/**
 * Disconnect socket and clear instance
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
