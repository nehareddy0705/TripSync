import { TripModel } from "../models/TripModel.js";
import { MessageModel } from "../models/MessageModel.js";

// Verify that the logged-in user is a member of the trip
export const verifyMembership = async (req, res, next) => {
  try {
    const tripId = req.params.tripId || req.body.tripId;
    
    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: "Trip ID is required",
      });
    }

    const trip = await TripModel.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const isMember = trip.members.some(
      (memberId) => memberId.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access Denied. You are not a member of this trip.",
      });
    }

    req.trip = trip; // Attach trip to request object for convenience
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify that the message exists and the logged-in user is the sender
export const verifyMessageOwnership = async (req, res, next) => {
  try {
    const messageId = req.params.id;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: "Message ID is required",
      });
    }

    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only modify your own messages.",
      });
    }

    req.chatMessage = message; // Attach message to request object for convenience
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
