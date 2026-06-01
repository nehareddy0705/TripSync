import exp from "express";
import verifyToken from "../middleware/verifyToken.js";
import { TripModel } from "../models/TripModel.js";

export const tripRouter = exp.Router();

// @route   POST /trip
// @desc    Create a new trip
// @access  Protected
tripRouter.post("/", verifyToken, async (req, res) => {
  try {
    let {
      title,
      destination,
      startDate,
      endDate,
      inviteCode,
    } = req.body;

    // Generate code if user didn't provide one
    if (!inviteCode) {
      inviteCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
    } else {
      inviteCode = inviteCode.toUpperCase();
    }

    const existingTrip = await TripModel.findOne({
      inviteCode,
    });

    if (existingTrip) {
      return res.status(400).json({
        success: false,
        message: "Invite code already exists. Please choose a different code.",
      });
    }

    const trip = await TripModel.create({
      title,
      destination,
      startDate,
      endDate,
      creator: req.user.userId,
      members: [req.user.userId],
      inviteCode,
    });

    // Populate creator and members details before sending to client
    const populatedTrip = await TripModel.findById(trip._id)
      .populate("creator", "name profileImage email")
      .populate("members", "name profileImage email");

    res.status(201).json({
      success: true,
      trip: populatedTrip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /trip
// @desc    Get all trips for the authenticated user
// @access  Protected
tripRouter.get("/", verifyToken, async (req, res) => {
  try {
    const trips = await TripModel.find({
      members: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .populate("creator", "name profileImage email")
      .populate("members", "name profileImage email");

    res.json({
      success: true,
      trips,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /trip/join
// @desc    Join an existing trip using an invite code
// @access  Protected
tripRouter.post("/join", verifyToken, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: "Invite code is required",
      });
    }

    const uppercaseCode = inviteCode.trim().toUpperCase();

    const trip = await TripModel.findOne({
      inviteCode: uppercaseCode,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Invalid invite code. Trip not found.",
      });
    }

    // Check if the user is already a member
    const isMember = trip.members.some(
      (memberId) => memberId.toString() === req.user.userId
    );
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this trip!",
      });
    }

    // Add user to the members array
    await TripModel.findByIdAndUpdate(
    trip._id,
    {
        $addToSet: {
        members: req.user.userId,
        },
    },
    { new: true }
    );
    // Populate creator and members
    const populatedTrip = await TripModel.findById(trip._id)
      .populate("creator", "name profileImage email")
      .populate("members", "name profileImage email");

    res.json({
      success: true,
      trip: populatedTrip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /trip/:id
// @desc    Get trip details by ID
// @access  Protected
tripRouter.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await TripModel.findById(id)
      .populate("creator", "name profileImage email")
      .populate("members", "name profileImage email");

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    // Verify requesting user is a member of the trip
    const isMember = trip.members.some((member) => {
      const memberId = member._id ? member._id.toString() : member.toString();
      return memberId === req.user.userId;
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access Denied. You are not a member of this trip.",
      });
    }

    res.json({
      success: true,
      trip,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
