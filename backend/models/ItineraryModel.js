import {Schema,Types,model} from "mongoose"

const ItinerarySchema = new Schema({
  trip: {
    type: Types.ObjectId,
    ref: "Trip"
  },

  date: Date,

  title: String,

  description: String,

  createdBy: {
    type: Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

export const ItineraryModel = model("Itinerary", ItinerarySchema);