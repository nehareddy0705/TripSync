import exp from "express";
import verifyToken from "../middleware/verifyToken.js";
import { PhotoModel } from "../models/PhotoModel.js";
import { TripModel } from "../models/TripModel.js";

export const photoRouter = exp.Router();


// ======================================
// Upload Photo
// POST /photos
// ======================================
photoRouter.post("/", verifyToken, async (req, res) => {
  try {
    const { tripId, imageUrl } = req.body;

    if (!tripId || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "tripId and imageUrl are required",
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
      (memberId) =>
        memberId.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const photo = await PhotoModel.create({
      trip: tripId,
      imageUrl,
      uploadedBy: req.user.userId,
    });

    const populatedPhoto =
      await PhotoModel.findById(photo._id)
        .populate(
          "uploadedBy",
          "name profilePic email"
        );

    res.status(201).json({
      success: true,
      photo: populatedPhoto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ======================================
// Get All Photos For Trip
// GET /photos/:tripId
// ======================================
photoRouter.get("/:tripId", verifyToken, async (req, res) => {
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

    const photos = await PhotoModel.find({
      trip: req.params.tripId,
    })
      .populate(
        "uploadedBy",
        "name profilePic email"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      photos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ======================================
// Delete Photo
// DELETE /photos/:id
// ======================================
photoRouter.delete("/:id", verifyToken, async (req, res) => {
  try {
    const photo = await PhotoModel.findById(
      req.params.id
    );

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    const trip = await TripModel.findById(
      photo.trip
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

    await PhotoModel.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});