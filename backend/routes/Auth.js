import exp from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import {UserModel} from "../models/UserModel.js";
dotenv.config();

export const auth = exp.Router();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

auth.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub,
      email,
      name,
      picture,
    } = payload;

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        googleId: sub,
        name,
        email,
        profileImage: picture,
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});