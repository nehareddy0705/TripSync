import {Schema,Types,model} from "mongoose"
const PollSchema = new Schema({
  trip: {
    type: Types.ObjectId,
    ref: "Trip"
  },

  question: {
    type: String,
    required: true
  },

  options: [{
    text: String,
    votes: [{
      type: Types.ObjectId,
      ref: "User"
    }]
  }],

  createdBy: {
    type: Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

export const PollModel = model("Poll", PollSchema);