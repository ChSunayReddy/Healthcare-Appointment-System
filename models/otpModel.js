const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["registration", "forgot-password", "login"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Document automatically expires and gets deleted after 300 seconds (5 minutes)
    },
  }
);

const otpModel = mongoose.model("otps", otpSchema);
module.exports = otpModel;
