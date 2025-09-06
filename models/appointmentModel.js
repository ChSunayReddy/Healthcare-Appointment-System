const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorInfo: { type: Object, required: true },
    userInfo: { type: Object, required: true },
    appointmentStartTime: { type: Date, required: true }, // start slot
    appointmentEndTime: { type: Date, required: true },   // end slot
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const appointmentModel = mongoose.model("appointments", appointmentSchema);
module.exports = appointmentModel;