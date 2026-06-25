import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { initiateSocketConnection, disconnectSocket } from "../services/socket";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeTripId, setActiveTripId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // Stores list of typing users: { [tripId]: [ { userId, username } ] }
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // Keep a reference to the active trip ID for socket listeners to avoid stale closure values
  const activeTripIdRef = useRef(activeTripId);
  useEffect(() => {
    activeTripIdRef.current = activeTripId;
  }, [activeTripId]);

  // Connect to Socket.IO
  const connect = useCallback((token) => {
    const s = initiateSocketConnection(token);
    s.connect();
    setSocket(s);
    setConnectionStatus("connected");
  }, []);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setConnectionStatus("disconnected");
    setOnlineUsers([]);
  }, []);

  // Fetch initial unread counts from REST API
  const fetchUnreadCounts = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/messages/unread`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setUnreadCounts(res.data.unreadCounts || {});
      }
    } catch (err) {
      console.error("Error fetching unread counts:", err);
    }
  }, []);

  // Bind Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setConnectionStatus("connected");
      // Re-join the active trip room if reconnecting
      if (activeTripIdRef.current) {
        socket.emit("join_trip", { tripId: activeTripIdRef.current });
      }
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receive_message", (message) => {
      // Append message if it belongs to the active trip chat room
      if (message.tripId === activeTripIdRef.current) {
        setMessages((prev) => {
          // 1. Avoid appending duplicates (if already replaced by REST callback)
          if (prev.some((m) => m._id === message._id)) return prev;

          // 2. Resolve race condition: Check if there's a pending optimistic message from the same sender
          // If so, replace the optimistic message placeholder with the real message object from the socket.
          // This ensures that when the REST response subsequently completes, it won't produce a duplicate.
          const optimisticIndex = prev.findIndex(
            (m) => m.isPending && m.sender?._id === message.sender?._id
          );
          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = message;
            return updated;
          }

          // 3. Otherwise, append the message
          return [...prev, message];
        });

        // Inform the room that we read this message
        socket.emit("message_read", { tripId: message.tripId });
      } else {
        // Increment unread count for that trip
        setUnreadCounts((prev) => ({
          ...prev,
          [message.tripId]: (prev[message.tripId] || 0) + 1,
        }));
      }
    });

    socket.on("new_message_notification", ({ tripId, message }) => {
      // If we are not currently looking at this trip's chat, increment unread badge
      if (tripId !== activeTripIdRef.current) {
        setUnreadCounts((prev) => ({
          ...prev,
          [tripId]: (prev[tripId] || 0) + 1,
        }));
      }
    });

    socket.on("message_read", ({ tripId, userId }) => {
      // If it's the active trip, update the read receipt indicators on messages
      if (tripId === activeTripIdRef.current) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.sender._id !== userId && !m.readBy.includes(userId)) {
              return { ...m, readBy: [...m.readBy, userId] };
            }
            return m;
          })
        );
      }
    });

    socket.on("message_edited", (editedMessage) => {
      if (editedMessage.tripId === activeTripIdRef.current) {
        setMessages((prev) =>
          prev.map((m) => (m._id === editedMessage._id ? editedMessage : m))
        );
      }
    });

    socket.on("message_deleted", ({ messageId, tripId }) => {
      if (tripId === activeTripIdRef.current) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    });

    socket.on("typing", ({ tripId, userId, username }) => {
      if (tripId === activeTripIdRef.current) {
        setTypingUsers((prev) => {
          const list = prev[tripId] || [];
          if (list.some((u) => u.userId === userId)) return prev;
          return {
            ...prev,
            [tripId]: [...list, { userId, username }],
          };
        });
      }
    });

    socket.on("stop_typing", ({ tripId, userId }) => {
      if (tripId === activeTripIdRef.current) {
        setTypingUsers((prev) => {
          const list = prev[tripId] || [];
          return {
            ...prev,
            [tripId]: list.filter((u) => u.userId !== userId),
          };
        });
      }
    });

    socket.on("error_msg", (msg) => {
      console.error("Socket error message:", msg);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("online_users");
      socket.off("receive_message");
      socket.off("new_message_notification");
      socket.off("message_read");
      socket.off("message_edited");
      socket.off("message_deleted");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("error_msg");
    };
  }, [socket]);

  // Connect automatically if a token exists in localStorage on startup
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      connect(token);
      fetchUnreadCounts();
    }
    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchUnreadCounts]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        unreadCounts,
        setUnreadCounts,
        activeTripId,
        setActiveTripId,
        messages,
        setMessages,
        typingUsers: typingUsers[activeTripId] || [],
        connectionStatus,
        connect,
        disconnect,
        fetchUnreadCounts,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
