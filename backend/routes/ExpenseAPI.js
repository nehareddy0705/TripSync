import exp from "express";
import verifyToken from "../middleware/verifyToken.js";
import { ExpenseModel } from "../models/ExpenseModel.js";
import { TripModel } from "../models/TripModel.js";

export const expenseRouter = exp.Router();


// ======================================
// Create Expense
// POST /expenses
// ======================================
expenseRouter.post("/", verifyToken, async (req, res) => {
  try {
    const {
      tripId,
      title,
      amount,
      paidBy,
      participants,
    } = req.body;

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

    const expense = await ExpenseModel.create({
      trip: tripId,
      title,
      amount,
      paidBy,
      participants,
    });

    const populatedExpense = await ExpenseModel.findById(
      expense._id
    )
      .populate("paidBy", "name profilePic email")
      .populate(
        "participants",
        "name profilePic email"
      );

    res.status(201).json({
      success: true,
      expense: populatedExpense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ======================================
// Get All Expenses For Trip
// GET /expenses/:tripId
// ======================================
expenseRouter.get("/:tripId", verifyToken, async (req, res) => {
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

    const expenses = await ExpenseModel.find({
      trip: req.params.tripId,
    })
      .populate("paidBy", "name profilePic email")
      .populate(
        "participants",
        "name profilePic email"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ======================================
// Delete Expense
// DELETE /expenses/:id
// ======================================
expenseRouter.delete("/:id", verifyToken, async (req, res) => {
  try {
    const expense = await ExpenseModel.findById(
      req.params.id
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const trip = await TripModel.findById(
      expense.trip
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

    await ExpenseModel.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ======================================
// Calculate Balances
// GET /expenses/:tripId/balances
// ======================================
expenseRouter.get(
  "/:tripId/balances",
  verifyToken,
  async (req, res) => {
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

      const expenses = await ExpenseModel.find({
        trip: req.params.tripId,
      }).populate("paidBy", "name");

      const balances = [];

      expenses.forEach((expense) => {
        const share =
          expense.amount /
          expense.participants.length;

        expense.participants.forEach(
          (participantId) => {
            if (
              participantId.toString() !==
              expense.paidBy._id.toString()
            ) {
              balances.push({
                from: participantId,
                to: expense.paidBy,
                amount: share,
              });
            }
          }
        );
      });

      res.json({
        success: true,
        balances,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);