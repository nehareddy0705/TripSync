import { Schema,Types,model } from "mongoose";
const TripSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: Date,
  endDate: Date,

  creator: {
    type: Types.ObjectId,
    ref: "User"
  },

  members: [{
    type: Types.ObjectId,
    ref: "User"
  }],

  inviteCode: {
  type: String,
  required: true,
  unique: true,
  uppercase: true
}
}, { timestamps: true });

export const TripModel = model("Trip", TripSchema);