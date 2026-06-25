import jwt from "jsonwebtoken";
import { TripModel } from "../models/TripModel.js";
import { MessageModel } from "../models/MessageModel.js";
import { UserModel } from "../models/UserModel.js";

// Keep track of active connections
// Maps userId (string) -> Set of active socket IDs (supports multiple tabs per user)
const onlineUsers = new Map();

export const setupSocket = (io) => {
  // Authentication middleware for Socket.IO connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user details to verify user still exists and get name
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      socket.userProfileImage = user.profileImage;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`Socket connected: ${socket.id} for user ${userId}`);

    // Register user in online users map
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join a user-specific room for private notifications
    socket.join(`user_${userId}`);

    // Broadcast the updated list of online user IDs to all clients
    io.emit("online_users", Array.from(onlineUsers.keys()));

    // Event: join_trip - join a trip's chat room
    socket.on("join_trip", async ({ tripId }) => {
      try {
        if (!tripId) return;

        // Verify that the user is actually a member of the trip
        const trip = await TripModel.findById(tripId);
        if (!trip || !trip.members.some((m) => m.toString() === userId)) {
          socket.emit("error_msg", "Access Denied. You are not a member of this trip.");
          return;
        }

        // Join room trip_tripId
        socket.join(`trip_${tripId}`);
        console.log(`User ${userId} joined room trip_${tripId}`);

        // Mark all past messages in this trip as read by this user
        await MessageModel.updateMany(
          {
            tripId,
            sender: { $ne: userId },
            readBy: { $ne: userId },
          },
          {
            $addToSet: { readBy: userId },
          }
        );

        // Broadcast to the trip room that messages are read
        io.to(`trip_${tripId}`).emit("message_read", { tripId, userId });
      } catch (err) {
        console.error("Error in join_trip socket event:", err);
      }
    });

    // Event: leave_trip - leave a trip's chat room
    socket.on("leave_trip", ({ tripId }) => {
      if (!tripId) return;
      socket.leave(`trip_${tripId}`);
      console.log(`User ${userId} left room trip_${tripId}`);
    });

    // Event: send_message - receive message from client, save it, and broadcast
    socket.on("send_message", async ({ tripId, text, image }) => {
      try {
        if (!tripId) return;

        // Verify membership
        const trip = await TripModel.findById(tripId);
        if (!trip || !trip.members.some((m) => m.toString() === userId)) {
          socket.emit("error_msg", "Access Denied. You are not a member of this trip.");
          return;
        }

        if (!text && !image) {
          socket.emit("error_msg", "Message must contain either text or an image.");
          return;
        }

        // Save new message to database
        const message = await MessageModel.create({
          tripId,
          sender: userId,
          text,
          image,
          readBy: [userId],
        });

        const populatedMessage = await MessageModel.findById(message._id).populate(
          "sender",
          "name profileImage email"
        );

        // Broadcast the message to all users currently in the trip room
        io.to(`trip_${tripId}`).emit("receive_message", populatedMessage);

        // Notify other members of the trip who are online but not currently in the trip room
        trip.members.forEach((memberId) => {
          const memberIdStr = memberId.toString();
          if (memberIdStr !== userId) {
            io.to(`user_${memberIdStr}`).emit("new_message_notification", {
              tripId,
              message: populatedMessage,
            });
          }
        });
      } catch (err) {
        console.error("Error in send_message socket event:", err);
        socket.emit("error_msg", "Failed to send message: " + err.message);
      }
    });

    // Event: typing - broadcast that user is typing
    socket.on("typing", ({ tripId }) => {
      if (!tripId) return;
      socket.to(`trip_${tripId}`).emit("typing", {
        tripId,
        userId,
        username: socket.userName,
      });
    });

    // Event: stop_typing - broadcast that user stopped typing
    socket.on("stop_typing", ({ tripId }) => {
      if (!tripId) return;
      socket.to(`trip_${tripId}`).emit("stop_typing", {
        tripId,
        userId,
        username: socket.userName,
      });
    });

    // Event: message_read - user manually read messages (e.g. focused on chat)
    socket.on("message_read", async ({ tripId }) => {
      try {
        if (!tripId) return;

        await MessageModel.updateMany(
          {
            tripId,
            sender: { $ne: userId },
            readBy: { $ne: userId },
          },
          {
            $addToSet: { readBy: userId },
          }
        );

        io.to(`trip_${tripId}`).emit("message_read", { tripId, userId });
      } catch (err) {
        console.error("Error in message_read socket event:", err);
      }
    });

    // Event: message_edited - update edited message and broadcast update
    socket.on("message_edited", async ({ messageId, text }) => {
      try {
        if (!messageId || !text || text.trim() === "") return;

        const message = await MessageModel.findById(messageId);
        if (!message || message.sender.toString() !== userId) return;

        message.text = text;
        message.isEdited = true;
        await message.save();

        const populatedMessage = await MessageModel.findById(message._id).populate(
          "sender",
          "name profileImage email"
        );

        io.to(`trip_${message.tripId}`).emit("message_edited", populatedMessage);
      } catch (err) {
        console.error("Error in message_edited socket event:", err);
      }
    });

    // Event: message_deleted - delete message and broadcast deletion
    socket.on("message_deleted", async ({ messageId }) => {
      try {
        if (!messageId) return;

        const message = await MessageModel.findById(messageId);
        if (!message || message.sender.toString() !== userId) return;

        await MessageModel.findByIdAndDelete(messageId);

        io.to(`trip_${message.tripId}`).emit("message_deleted", {
          messageId,
          tripId: message.tripId,
        });
      } catch (err) {
        console.error("Error in message_deleted socket event:", err);
      }
    });

    // Event: disconnect - handle disconnection
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id} for user ${userId}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }

      // Broadcast the updated list of online user IDs
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
};
