const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/get-all-doctors", authMiddleware, async (req, res) => {
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
      error,
    });
  }
});
router.get("/get-all-users", authMiddleware, async (req, res) => {
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
      error,
    });
  }
});
router.post("/change-doctor-account-status", authMiddleware, async (req, res) => {
  try {
    const { doctorId, status,userId } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
  doctorId,
  { status },
  { new: true }
);
    const user = await User.findById(userId);
    const unseenNotifications = user.unseenNotifications || [];
    unseenNotifications.push({
      type : "new-doctor-request-changed",
      message : `Your doctor account has been ${status}`,
      
      onClickPath : "/notifications"
    })
    user.isDoctor = status === "approved" ? true : false;
    await user.save();
    res.status(200).send({
      message: "Doctor status updated successfully",
      success: true,
      data: doctor,
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error getting doctor status",
      success: false,
      error,
    });
  }
});
router.post("/change-user-status", authMiddleware, async (req, res) => {
  try {
    const { status,userId } = req.body;
    const user = await User.findById(userId);
    const unseenNotifications = user.unseenNotifications || [];
    unseenNotifications.push({
      type : "new-user-request-changed",
      message : `Your user account has been ${status}`,
      
      onClickPath : "/notifications"
    })
    user.status = status === "Active" ;
    await user.save();
    res.status(200).send({
      message: "User status updated successfully",
      success: true,
      data: user,
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error getting user status",
      success: false,
      error,
    });
  }
});
module.exports = router;
