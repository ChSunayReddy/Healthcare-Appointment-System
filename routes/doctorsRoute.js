const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const moment = require("moment");
router.post("/get-doctor-info-by-user-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting doctor info", success: false, error });
  }
});

router.post("/get-doctor-info-by-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting doctor info", success: false, error });
  }
});

router.post("/update-doctor-profile", authMiddleware, async (req, res) => {
  try {
    // The timings are already sent as strings from the frontend,
    // so no need to format them again.
    const timings = req.body.timings;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.body.userId },
      { ...req.body, timings }, // Use the timings directly
      { new: true }
    );

    const user = await User.findById(req.body.userId);
    if (!user || user.status === false) {
      return res.status(403).send({
        success: false,
        message: "Account is blocked. Cannot update profile.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error updating doctor profile",
      success: false,
      error,
    });
  }
});

router.get("/get-appointments-by-doctor-id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const doctor = await Doctor.findOne({ userId });
      if (!doctor) {
        return res.status(404).send({
          success: false,
          message: "Doctor not found",
        });
      }
      const appointments = await Appointment.find({ doctorId: doctor._id });
      res.status(200).send({
        message: "Appointments fetched successfully",
        success: true,
        data: appointments,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error getting appointments",
        success: false,
        error,
      });
    }
  }
);
router.post("/change-appointment-status", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      status,
    });
    const user = await User.findById({ _id: appointment.userId });
    const unseenNotifications = user.unseenNotifications || [];
    unseenNotifications.push({
      type: "appointment-status-changed",
      message: `Your appointment has been ${status}`,

      onClickPath: "/appointments",
    });
    await user.save();
    res.status(200).send({
      message: "Appointment status Changed successfully",
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error getting Appointment status",
      success: false,
      error,
    });
  }
});
module.exports = router;
