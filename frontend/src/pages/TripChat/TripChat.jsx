import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  X, 
  Users, 
  MessageSquare, 
  AlertCircle,
  Clock,
  Sparkles,
  Plane,
  RefreshCw,
  MoreVertical
} from "lucide-react";
import { useSocket } from "../../hooks/useSocket";
import MessageBubble from "../../components/chat/MessageBubble";
import EmojiPickerButton from "../../components/chat/EmojiPickerButton";
import Avatar from "../../components/Avatar";

export default function TripChat() {
  const { tripId: activeIdFromUrl } = useParams();
  const navigate = useNavigate();
  const { 
    socket, 
    onlineUsers, 
    unreadCounts, 
    setUnreadCounts,
    activeTripId, 
    setActiveTripId,
    messages, 
    setMessages, 
    typingUsers, 
    connectionStatus 
  } = useSocket();

  // Component States
  const [currentUser, setCurrentUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showMembers, setShowMembers] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Typing Indicator Tracker
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  // Scroll Container Refs
  const scrollContainerRef = useRef(null);
  const oldestMessageTimeRef = useRef(null);

  // Parse User details from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !userStr) {
      navigate("/login");
      return;
    }
    setCurrentUser(JSON.parse(userStr));
    loadTrips(token);
  }, [navigate]);

  // Load user's trips
  const loadTrips = async (token) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/trip`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setTrips(res.data.trips || []);
      }
    } catch (err) {
      console.error("Failed to load user's trips:", err);
    }
  };

  // Fetch initial messages for active trip and configure rooms
  useEffect(() => {
    if (!activeIdFromUrl) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // 1. Leave previous socket room and set active room ID
    if (activeTripId && socket) {
      socket.emit("leave_trip", { tripId: activeTripId });
    }
    setActiveTripId(activeIdFromUrl);
    setLoadingMessages(true);
    setHasMore(true);
    setMessages([]);
    setErrorMsg("");

    // 2. Load Active Trip metadata & messages
    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/trip/${activeIdFromUrl}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/messages/${activeIdFromUrl}?limit=30`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    .then(([tripRes, msgRes]) => {
      setActiveTrip(tripRes.data.trip);
      setMessages(msgRes.data.messages || []);
      if (msgRes.data.messages?.length < 30) {
        setHasMore(false);
      }
      setLoadingMessages(false);

      // Keep track of oldest message timestamp for infinite scroll
      if (msgRes.data.messages?.length > 0) {
        oldestMessageTimeRef.current = msgRes.data.messages[0].createdAt;
      } else {
        oldestMessageTimeRef.current = null;
      }

      // 3. Mark messages as read on backend and reset local unread badge
      axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/messages/read/${activeIdFromUrl}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.log("Failed to mark messages as read:", err));

      setUnreadCounts(prev => ({
        ...prev,
        [activeIdFromUrl]: 0
      }));

      // 4. Emit join_trip event on socket
      if (socket) {
        socket.emit("join_trip", { tripId: activeIdFromUrl });
      }
    })
    .catch((err) => {
      console.error("Error setting up active trip:", err);
      setErrorMsg(err.response?.data?.message || "Failed to load chat workspace.");
      setLoadingMessages(false);
    });

    // Cleanup: emit leave_trip when activeIdFromUrl changes or unmounts
    return () => {
      if (socket) {
        socket.emit("leave_trip", { tripId: activeIdFromUrl });
      }
    };
  }, [activeIdFromUrl, socket, setActiveTripId, setUnreadCounts]);

  // Load older messages (infinite scroll upwards)
  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasMore || !oldestMessageTimeRef.current) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingOlder(true);
    const prevScrollHeight = scrollContainerRef.current?.scrollHeight || 0;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/messages/${activeIdFromUrl}?limit=30&before=${oldestMessageTimeRef.current}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const olderMessages = res.data.messages || [];

      if (olderMessages.length < 30) {
        setHasMore(false);
      }

      if (olderMessages.length > 0) {
        // Prepend older messages to messages array
        setMessages(prev => [...olderMessages, ...prev]);
        oldestMessageTimeRef.current = olderMessages[0].createdAt;

        // Restore scroll position so scroll doesn't jump
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 
              scrollContainerRef.current.scrollHeight - prevScrollHeight;
          }
        }, 0);
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setLoadingOlder(false);
    }
  }, [activeIdFromUrl, loadingOlder, hasMore, setMessages]);

  // Handle Scroll Container scrolling
  const handleScroll = (e) => {
    // When user scrolls to top, trigger load of older messages
    if (e.currentTarget.scrollTop === 0) {
      loadOlderMessages();
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = (force = false) => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // Auto-scroll only if user is already near bottom (within 250px) or if force is true (e.g. they sent a message)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;
    if (force || isNearBottom) {
      scrollContainerRef.current.scrollTop = scrollHeight;
    }
  };

  // Auto-scroll when new messages arrive or loading completes
  useEffect(() => {
    scrollToBottom(true);
  }, [messages, loadingMessages]);

  // Send typing event to Socket
  const handleKeyDown = () => {
    if (!socket || !activeIdFromUrl) return;

    // Send typing event if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { tripId: activeIdFromUrl });
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("stop_typing", { tripId: activeIdFromUrl });
    }, 2000);
  };

  // Select file handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Clean image attachment states
  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  // Handle Edit Message Callback
  const handleEditMessage = async (messageId, newText) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/messages/${messageId}`,
        { text: newText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Edit message REST call error:", err);
      throw err;
    }
  };

  // Handle Delete Message Callback
  const handleDeleteMessage = async (messageId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Delete message REST call error:", err);
    }
  };

  // Submit Message Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;

    const tempId = `opt_${Date.now()}`;
    let uploadedImageUrl = "";
    
    // 1. Render message immediately inside view (Optimistic UI)
    const optimisticMessage = {
      _id: tempId,
      tripId: activeIdFromUrl,
      sender: {
        _id: currentUser._id,
        name: currentUser.name,
        profileImage: currentUser.profileImage,
        email: currentUser.email
      },
      text: text,
      image: imagePreview, // Use local blob preview url temporarily
      readBy: [currentUser._id],
      isPending: true,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom(true);
    
    const messageText = text;
    const fileToUpload = imageFile;

    // Reset inputs immediately for responsive UX
    setText("");
    clearImage();

    // Reset typing indicator immediately
    if (isTypingRef.current && socket) {
      isTypingRef.current = false;
      socket.emit("stop_typing", { tripId: activeIdFromUrl });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      // 2. Upload image to Cloudinary if selected
      if (fileToUpload) {
        setIsUploading(true);
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        if (!cloudName || !uploadPreset) {
          throw new Error("Cloudinary credentials missing in environment variables.");
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("upload_preset", uploadPreset);

        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
        );
        uploadedImageUrl = uploadRes.data.secure_url;
        setIsUploading(false);
      }

      // 3. Post to API which saves in MongoDB and broadcasts to room
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/messages`,
        {
          tripId: activeIdFromUrl,
          text: messageText,
          image: uploadedImageUrl
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // 4. Replace Optimistic Message with Real Message from Server
      setMessages(prev => 
        prev.map(m => m._id === tempId ? res.data.message : m)
      );

    } catch (err) {
      console.error("Message send flow failed:", err);
      setIsUploading(false);
      
      // 5. Remove optimistic message on failure and notify
      setMessages(prev => prev.filter(m => m._id !== tempId));
      alert(err.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden font-sans text-slate-100 antialiased">
      {/* 1. Left Sidebar (Trip Navigator) */}
      <aside className="w-[80px] sm:w-[280px] shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col z-20">
        
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center border-b border-slate-800 shrink-0 gap-3">
          <Link 
            to="/dashboard" 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Go to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="hidden sm:inline font-bold tracking-tight bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent text-lg">
            TripSync Chat
          </span>
        </div>

        {/* Trips List Container */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2.5">
          {trips.length === 0 ? (
            <div className="hidden sm:flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 opacity-40 animate-pulse" />
              <p className="text-xs">No active trips found.</p>
            </div>
          ) : (
            trips.map((trip) => {
              const tripId = trip._id || trip.id;
              const isActive = tripId === activeIdFromUrl;
              const unread = unreadCounts[tripId] || 0;

              return (
                <div
                  key={tripId}
                  onClick={() => navigate(`/trip/${tripId}/chat`)}
                  className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-700/20" 
                      : "hover:bg-slate-800/60 text-slate-350 hover:text-white"
                  }`}
                  title={trip.title}
                >
                  <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-extrabold text-sm shrink-0 border ${
                    isActive ? "border-teal-400 text-teal-350" : "border-slate-700 text-slate-300"
                  }`}>
                    {trip.title.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Trip Details in Sidebar (hidden on mobile) */}
                  <div className="hidden sm:block min-w-0 flex-1 text-left">
                    <p className={`font-bold text-sm truncate leading-snug ${isActive ? "text-white" : "text-slate-200"}`}>
                      {trip.title}
                    </p>
                    <p className={`text-[10px] truncate leading-none mt-1 ${isActive ? "text-teal-100" : "text-slate-400"}`}>
                      {trip.destination}
                    </p>
                  </div>

                  {/* Unread badge counts */}
                  {unread > 0 && (
                    <span className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 bg-rose-500 text-white font-black text-[10px] h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full shadow shrink-0 animate-pulse">
                      {unread}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. Main Chat Panel */}
      <main className="flex-1 flex flex-col bg-slate-900 relative">
        
        {/* Top Header */}
        <header className="h-16 px-6 border-b border-slate-800 bg-slate-950/60 backdrop-blur flex items-center justify-between shrink-0 z-10 shadow-sm">
          {loadingMessages ? (
            <div className="w-40 h-4 bg-slate-800 rounded-md animate-pulse"></div>
          ) : activeTrip ? (
            <div className="flex items-center space-x-3 text-left">
              <div>
                <h3 className="font-extrabold text-slate-100 text-base leading-snug tracking-tight">
                  {activeTrip.title}
                </h3>
                <p className="text-xs text-teal-400 flex items-center font-semibold mt-0.5">
                  <Plane className="w-3.5 h-3.5 mr-1" />
                  {activeTrip.destination}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400">Loading workspace...</div>
          )}

          {/* Header Action Row */}
          <div className="flex items-center space-x-2">
            {/* Connection State indicator */}
            {connectionStatus === "disconnected" && (
              <div className="flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-450 px-3 py-1 rounded-full text-[10px] font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Reconnecting...</span>
              </div>
            )}

            <button
              onClick={() => setShowMembers(!showMembers)}
              className={`p-2.5 rounded-xl hover:bg-slate-800 transition-colors focus:outline-none ${
                showMembers ? "text-teal-400 bg-slate-800/40" : "text-slate-400"
              }`}
              title="Show Group Members"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Message Log Body */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-slate-950"
        >
          {loadingOlder && (
            <div className="flex justify-center items-center py-2 text-xs text-slate-400 space-x-2 shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
              <span>Loading past messages...</span>
            </div>
          )}

          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-xs font-semibold">Opening message vault...</p>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto space-y-4 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
              <h4 className="font-bold text-lg">Failed to Join Chat</h4>
              <p className="text-xs text-slate-450 leading-relaxed">{errorMsg}</p>
              <button 
                onClick={() => navigate("/dashboard")}
                className="px-5 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
              >
                Back to Dashboard
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 max-w-xs mx-auto text-center animate-fade-in">
              <div className="w-14 h-14 bg-slate-850/50 rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner">
                <MessageSquare className="w-6 h-6 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-350 text-sm">Welcome to Group Workspace!</h5>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Send a text, share memories, and organize details live with your trip companions.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message._id || message.id}
                message={message}
                currentUser={currentUser}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            ))
          )}
        </div>

        {/* Typing Indicators Banner */}
        <div className="h-6 px-6 bg-slate-900/80 text-[11px] text-slate-400 font-semibold flex items-center italic">
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-1.5 animate-pulse text-teal-400 font-bold">
              <span>
                {typingUsers.map((u) => u.username.split(" ")[0]).join(", ")}
                {typingUsers.length === 1 ? " is typing..." : " are typing..."}
              </span>
            </div>
          )}
        </div>

        {/* Attachment image preview banner */}
        {imagePreview && (
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center space-x-4 shrink-0 animate-fade-in">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center shadow-inner">
              <img
                src={imagePreview}
                alt="Attachment preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-1 right-1 bg-slate-950/70 hover:bg-slate-950 p-1 rounded-full text-white shadow backdrop-blur transition-all"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-left text-xs space-y-1">
              <p className="font-bold text-slate-200">Image attachment ready</p>
              <p className="text-slate-400">Click Send to upload and share.</p>
            </div>
          </div>
        )}

        {/* Input Bar Form */}
        <form 
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-800 bg-slate-950 shrink-0 z-10 flex items-center gap-2"
        >
          {/* Add Emojis */}
          <EmojiPickerButton
            onEmojiSelect={(emoji) => setText(prev => prev + emoji)}
          />

          {/* Add Image Attachment */}
          <div className="shrink-0">
            <label
              htmlFor="chat-image-input"
              className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-950 text-slate-400 transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
              title="Attach an image"
            >
              <ImageIcon className="w-5 h-5" />
            </label>
            <input
              id="chat-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Message Text Input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isUploading ? "Uploading image..." : "Write a message..."}
            disabled={isUploading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-40"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isUploading || (!text.trim() && !imageFile)}
            className="p-2.5 rounded-xl text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-md shadow-teal-800/10 disabled:opacity-30 flex items-center justify-center shrink-0"
            title="Send Message"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </main>

      {/* 3. Collapsible Right Panel (Members Indicator Panel) */}
      {showMembers && (
        <aside className="hidden lg:flex w-[260px] shrink-0 border-l border-slate-800 bg-slate-950 flex-col z-10 animate-fade-in">
          {/* Members Panel Header */}
          <div className="h-16 px-4 flex items-center border-b border-slate-800 shrink-0 justify-between">
            <span className="font-extrabold text-sm text-slate-200 tracking-tight flex items-center">
              <Users className="w-4 h-4 mr-2 text-teal-405" />
              Active Plan Crew
            </span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full shrink-0">
              {activeTrip?.members?.length || 1} Total
            </span>
          </div>

          {/* Members Scroll list */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-3.5">
            {loadingMessages ? (
              <div className="space-y-3">
                <div className="h-10 bg-slate-800 rounded-xl animate-pulse"></div>
                <div className="h-10 bg-slate-800 rounded-xl animate-pulse"></div>
              </div>
            ) : activeTrip?.members ? (
              activeTrip.members.map((member) => {
                const isOnline = onlineUsers.includes(member._id);
                const isHost = member._id === activeTrip.creator?._id;

                return (
                  <div 
                    key={member._id} 
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative">
                        <Avatar
                          name={member.name}
                          imageUrl={member.profileImage}
                          size="w-8.5 h-8.5"
                          textClass="text-[10px] font-bold"
                          roundedClass="rounded-full"
                        />
                        {/* Small Online status dot inside avatar */}
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 shadow-inner ${
                          isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                        }`}></span>
                      </div>

                      <div className="text-left min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-bold text-slate-200 truncate leading-snug">{member.name}</p>
                          {isHost && (
                            <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-[8px] font-black uppercase text-white px-1 py-0.2 rounded shrink-0 leading-none">
                              Host
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block leading-none mt-1">{member.email}</span>
                      </div>
                    </div>

                    {/* Online status label */}
                    <div className="shrink-0 text-[10px] font-bold">
                      {isOnline ? (
                        <span className="text-emerald-450 uppercase tracking-wide">Online</span>
                      ) : (
                        <span className="text-slate-500 uppercase tracking-wide">Offline</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">No member info loaded.</p>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
