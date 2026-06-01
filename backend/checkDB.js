import mongoose from "mongoose";
import { TripModel } from "./models/TripModel.js";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/group-trip-planner";
console.log("Connecting to:", dbUrl);

mongoose.connect(dbUrl)
  .then(async () => {
    console.log("Connected successfully!");
    const trips = await TripModel.find({});
    console.log("Existing Trips Count:", trips.length);
    console.log("Existing Trips Details:");
    console.log(JSON.stringify(trips, null, 2));
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Connection error:", err);
  });
