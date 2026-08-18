const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.get("/get-all-doctors", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).send({
      message: "Doctors fetched successfully",
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching doctors",
      success: false,
      error: error.message,
    });
  }
});

router.get("/get-all-users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({
      message: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching users",
      success: false,
      error: error.message,
    });
  }
});

router.post("/change-doctor-account-status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { doctorId, status, userId } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { status },
      { new: true }
    );
    const user = await User.findById(userId);
    if (user) {
      const unseenNotifications = user.unseenNotifications || [];
      unseenNotifications.push({
        type: "new-doctor-request-changed",
        message: `Your doctor account has been ${status}`,
        onClickPath: "/notifications",
      });
      user.isDoctor = status === "approved";
      await user.save();
    }
    res.status(200).send({
      message: "Doctor status updated successfully",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error updating doctor status",
      success: false,
      error: error.message,
    });
  }
});

router.post("/change-user-status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }
    const unseenNotifications = user.unseenNotifications || [];
    unseenNotifications.push({
      type: "new-user-request-changed",
      message: `Your user account has been ${status}`,
      onClickPath: "/notifications",
    });
    user.status = status === "Active";
    await user.save();
    res.status(200).send({
      message: "User status updated successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error updating user status",
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
