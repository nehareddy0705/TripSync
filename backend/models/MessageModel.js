import { Schema, Types, model } from "mongoose";

const MessageSchema = new Schema(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // This automatically handles `createdAt` and `updatedAt`
  }
);

// Add validator to ensure either text or image is present
MessageSchema.pre("validate", function () {
  if (!this.text && !this.image) {
    throw new Error("A message must contain either text or an image.");
  }
});

export const MessageModel = model("Message", MessageSchema);
