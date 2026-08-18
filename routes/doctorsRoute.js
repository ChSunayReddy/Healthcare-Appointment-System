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
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.status === false) {
      return res.status(403).send({
        success: false,
        message: "Account is blocked. Cannot update profile.",
      });
    }

    const { status, _id, userId: _, ...allowedUpdates } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { userId },
      allowedUpdates,
      { new: true }
    );

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor profile not found",
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
      error: error.message,
    });
  }
});

router.get("/get-appointments-by-doctor-id", authMiddleware, async (req, res) => {
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
      error: error.message,
    });
  }
});

router.post("/change-appointment-status", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const userId = req.user.id;

    // Verify doctor identity
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(403).send({ success: false, message: "Doctor profile not found" });
    }

    const appointment = await Appointment.findOne({ _id: appointmentId, doctorId: doctor._id.toString() });
    if (!appointment) {
      return res.status(404).send({ success: false, message: "Appointment not found or unauthorized" });
    }

    appointment.status = status;
    await appointment.save();

    const patientUser = await User.findById(appointment.userId);
    if (patientUser) {
      const unseenNotifications = patientUser.unseenNotifications || [];
      unseenNotifications.push({
        type: "appointment-status-changed",
        message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been ${status}`,
        onClickPath: "/appointments",
      });
      await patientUser.save();
    }

    res.status(200).send({
      message: "Appointment status changed successfully",
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error changing appointment status",
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
