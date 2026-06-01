import exp from "express";
import verifyToken from "../middleware/verifyToken.js";
import { PollModel } from "../models/PollModel.js";
import { TripModel } from "../models/TripModel.js";

export const pollRouter = exp.Router();

//create poll
pollRouter.post("/", verifyToken, async (req, res) => {
  try {
    const { tripId, question, options } = req.body;

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

    const poll = await PollModel.create({
      trip: tripId,
      question,
      options: options.map((option) => ({
        text: option,
        votes: [],
      })),
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      poll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//Get All Polls For Trip
pollRouter.get("/:tripId", verifyToken, async (req, res) => {
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

    const polls = await PollModel.find({
      trip: req.params.tripId,
    })
      .populate("createdBy", "name profilePic")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      polls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//Vote On Poll
pollRouter.post(
  "/:pollId/vote",
  verifyToken,
  async (req, res) => {
    try {
      const { optionIndex } = req.body;

      const poll = await PollModel.findById(
        req.params.pollId
      );

      if (!poll) {
        return res.status(404).json({
          success: false,
          message: "Poll not found",
        });
      }

      // Remove previous vote
      poll.options.forEach((option) => {
        option.votes = option.votes.filter(
          (vote) =>
            vote.toString() !== req.user.userId
        );
      });

      // Add new vote
      poll.options[optionIndex].votes.push(
        req.user.userId
      );

      await poll.save();

      res.json({
        success: true,
        poll,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

//Delete Poll
pollRouter.delete(
  "/:pollId",
  verifyToken,
  async (req, res) => {
    try {
      const poll = await PollModel.findById(
        req.params.pollId
      );

      if (!poll) {
        return res.status(404).json({
          success: false,
          message: "Poll not found",
        });
      }

      await PollModel.findByIdAndDelete(
        req.params.pollId
      );

      res.json({
        success: true,
        message: "Poll deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
); 
