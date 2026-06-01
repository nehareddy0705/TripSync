import { Schema,Types,model } from "mongoose";
const PhotoSchema = new Schema({
  trip: {
    type: Types.ObjectId,
    ref: "Trip"
  },

  imageUrl: String,

  uploadedBy: {
    type: Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });
export const PhotoModel = model("Photo", PhotoSchema);