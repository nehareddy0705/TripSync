import { MessageModel } from "../models/MessageModel.js";
import { TripModel } from "../models/TripModel.js";

// GET /api/messages/:tripId - Fetch messages for a trip with pagination (infinite scroll)
export const getMessages = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { limit = 30, before } = req.query;

    const query = { tripId };
    if (before) {
      // Load messages created before the oldest message currently on the client
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await MessageModel.find(query)
      .sort({ createdAt: -1 }) // Get newest first
      .limit(parseInt(limit))
      .populate("sender", "name profileImage email");

    // Return messages in chronological order (oldest first)
    res.json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/messages - Create a new message and broadcast via Socket.IO
export const createMessage = async (req, res) => {
  try {
    const { tripId, text, image } = req.body;
    const sender = req.user.userId;

    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: "Message must contain either text or an image.",
      });
    }

    const message = await MessageModel.create({
      tripId,
      sender,
      text,
      image,
      readBy: [sender],
    });

    const populatedMessage = await MessageModel.findById(message._id).populate(
      "sender",
      "name profileImage email"
    );

    const io = req.app.get("socketio");
    if (io) {
      // 1. Broadcast to the trip room for users inside the chat
      io.to(`trip_${tripId}`).emit("receive_message", populatedMessage);

      // 2. Broadcast to individual user rooms for members outside the chat room (for notification badge)
      const trip = req.trip; // attached by verifyMembership middleware
      trip.members.forEach((memberId) => {
        if (memberId.toString() !== sender.toString()) {
          io.to(`user_${memberId}`).emit("new_message_notification", {
            tripId,
            message: populatedMessage,
          });
        }
      });
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/messages/:id - Delete a message and broadcast deletion
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = req.chatMessage; // attached by verifyMessageOwnership

    await MessageModel.findByIdAndDelete(messageId);

    const io = req.app.get("socketio");
    if (io) {
      io.to(`trip_${message.tripId}`).emit("message_deleted", {
        messageId,
        tripId: message.tripId,
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/messages/:id - Edit a message and broadcast edit
export const updateMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { text, isEdited: true },
      { new: true }
    ).populate("sender", "name profileImage email");

    const io = req.app.get("socketio");
    if (io) {
      io.to(`trip_${updatedMessage.tripId}`).emit("message_edited", updatedMessage);
    }

    res.json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/messages/read/:tripId - Mark messages as read by current user
export const markAsRead = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;

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

    const io = req.app.get("socketio");
    if (io) {
      io.to(`trip_${tripId}`).emit("message_read", {
        tripId,
        userId,
      });
    }

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/messages/unread - Retrieve counts of unread messages for all of user's trips
export const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find all trips the user belongs to
    const trips = await TripModel.find({ members: userId });

    const unreadCounts = {};
    for (const trip of trips) {
      const count = await MessageModel.countDocuments({
        tripId: trip._id,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      });
      unreadCounts[trip._id] = count;
    }

    res.json({
      success: true,
      unreadCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
