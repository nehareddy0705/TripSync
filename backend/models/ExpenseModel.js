import { Schema,Types,model } from "mongoose";
const ExpenseSchema = new Schema({
  trip: {
    type: Types.ObjectId,
    ref: "Trip"
  },

  title: String,

  amount: Number,

  paidBy: {
    type: Types.ObjectId,
    ref: "User"
  },

  participants: [{
    type: Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });
export const ExpenseModel = model("Expense", ExpenseSchema);