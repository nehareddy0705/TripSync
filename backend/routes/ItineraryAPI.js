import exp from "express";
import verifyToken from "../middleware/verifyToken.js";
import { ItineraryModel } from "../models/ItineraryModel.js";
import { TripModel } from "../models/TripModel.js";

export const itineraryRouter = exp.Router();


// ===============================
// Create Activity
// POST /itinerary
// ===============================
itineraryRouter.post("/", verifyToken, async (req, res) => {
  try {
    const { tripId, title, description, date } = req.body;

    const trip = await TripModel.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const isMember = trip.members.some(
      (memberId) =>
        memberId.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const activity = await ItineraryModel.create({
      trip: tripId,
      title,
      description,
      date,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ===============================
// Get All Activities Of A Trip
// GET /itinerary/:tripId
// ===============================
itineraryRouter.get("/:tripId", verifyToken, async (req, res) => {
  try {
    const trip = await TripModel.findById(
      req.params.tripId
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const isMember = trip.members.some(
      (memberId) =>
        memberId.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const activities = await ItineraryModel.find({
      trip: req.params.tripId,
    })
      .populate(
        "createdBy",
        "name profilePic email"
      )
      .sort({ date: 1 });

    res.json({
      success: true,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ===============================
// Update Activity
// PUT /itinerary/:id
// ===============================
itineraryRouter.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, date } = req.body;

    const activity =
      await ItineraryModel.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const trip = await TripModel.findById(
      activity.trip
    );

    const isMember = trip.members.some(
      (memberId) =>
        memberId.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    activity.title = title || activity.title;
    activity.description =
      description || activity.description;
    activity.date = date || activity.date;

    await activity.save();

    res.json({
      success: true,
      activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ===============================
// Delete Activity
// DELETE /itinerary/:id
// ===============================
itineraryRouter.delete("/:id", verifyToken, async (req, res) => {
  try {
    const activity =
      await ItineraryModel.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const trip = await TripModel.findById(
      activity.trip
    );

    const isMember = trip.members.some(
      (memberId) =>
        memberId.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await ItineraryModel.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});