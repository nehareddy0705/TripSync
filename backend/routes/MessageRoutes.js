import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  verifyMembership,
  verifyMessageOwnership,
} from "../middleware/membershipMiddleware.js";
import {
  getMessages,
  createMessage,
  deleteMessage,
  updateMessage,
  markAsRead,
  getUnreadCounts,
} from "../controllers/MessageController.js";

const messageRouter = express.Router();

// Get unread message counts for all active trips (placed before :tripId to avoid clash)
messageRouter.get("/unread", verifyToken, getUnreadCounts);

// Get messages for a specific trip (paginated)
messageRouter.get("/:tripId", verifyToken, verifyMembership, getMessages);

// Create a new message in a trip
messageRouter.post("/", verifyToken, verifyMembership, createMessage);

// Delete a specific message
messageRouter.delete("/:id", verifyToken, verifyMessageOwnership, deleteMessage);

// Edit a specific message
messageRouter.put("/:id", verifyToken, verifyMessageOwnership, updateMessage);

// Mark all messages in a trip as read by the user
messageRouter.put("/read/:tripId", verifyToken, verifyMembership, markAsRead);

export default messageRouter;
