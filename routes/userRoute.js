const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
// const moment = require("moment");
const moment = require("moment-timezone");

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newuser = new User(req.body);
    await newuser.save();
    res
      .status(200)
      .send({ message: "User created successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error in creating user", success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.status(200).send({
        message: "Login successful",
        success: true,
        data: token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isDocter: user.isDocter,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error logging in", success: false, error });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email, password, "confirm-password": confirmPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }
    if (password !== confirmPassword) {
      return res
        .status(200)
        .send({ success: false, message: "Passwords do not match" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exists", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: user,
        //     data: {
        //     name : user.name,
        //     email : user.email,

        // }
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
});

router.post("/apply-doctor-account", authMiddleware, async (req, res) => {
  try {
    const newdoctor = new Doctor({ ...req.body, status: "pending" });
    await newdoctor.save();
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      return res
        .status(400)
        .send({ success: false, message: "No admin found" });
    }
    const unseenNotifications = adminUser.unseenNotifications || [];
    unseenNotifications.push({
      type: "new-doctor-request",
      message: `${newdoctor.firstName} ${newdoctor.lastName} has applied for a docter account`,
      data: {
        docterId: newdoctor._id,
        name: newdoctor.firstName + " " + newdoctor.lastName,
      },
      onClickPath: "/admin/doctorslist",
    });
    await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    res.status(200).send({
      success: true,
      message: "Doctor account applied successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({
        message: "Error in applying doctor account",
        success: false,
        error,
      });
  }
});

router.post("/mark-all-notifications-as-seen", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    // Move all unseen → seen
    user.seenNotifications.push(
      ...user.unseenNotifications.map((n) => ({ ...n.toObject(), isRead: true }))
    );
    user.unseenNotifications = [];

    await user.save();

    res.status(200).send({
      success: true,
      message: "All notifications marked as seen",
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error marking all notifications as seen",
      error: error.message,
    });
  }
});

router.post("/mark-notification-as-seen", authMiddleware, async (req, res) => {
  try {
    const { userId, notificationId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const notification = user.unseenNotifications.id(notificationId);
    if (!notification) {
      return res.status(404).send({ success: false, message: "Notification not found" });
    }

    // Move notification to seen
    user.unseenNotifications = user.unseenNotifications.filter(
      (n) => n._id.toString() !== notificationId
    );
    user.seenNotifications.push({ ...notification.toObject(), isRead: true });

    await user.save();

    res.status(200).send({
      success: true,
      message: "Notification marked as seen",
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error marking notification as seen",
      error: error.message,
    });
  }
});

router.post("/delete-all-notifications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "All notifications are deleted",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({
        message: "Error in applying doctor account",
        success: false,
        error,
      });
  }
});

router.get("/get-all-approved-doctors", authMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" });
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

router.post("/book-appointment", authMiddleware, async (req, res) => {
  try {
    const { doctorId, userId, startTime, doctorInfo, userInfo } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }
    if (!user.status) {   
      return res.status(403).send({
        success: false,
        message: "User account has been blocked, cannot book an appointment",
      });
    }
    // Parse start time from frontend in IST
    const startIST = moment.tz(startTime, "DD-MM-YYYY HH:mm", "Asia/Kolkata");
    if (!startIST.isValid()) {
      return res.status(400).send({ success: false, message: "Invalid start time" });
    }

    // Appointment duration = 30 mins
    const endIST = startIST.clone().add(30, "minutes");

    // Convert to UTC for DB storage
    const appointmentStartTime = startIST.clone().utc().toDate();
    const appointmentEndTime = endIST.clone().utc().toDate();

    // Create appointment
    const newAppointment = new Appointment({
      doctorId,
      userId,
      doctorInfo,
      userInfo,
      appointmentStartTime,
      appointmentEndTime,
      status: "pending",
    });

    await newAppointment.save();

    // Find doctor by userId (inside doctorInfo)
    const doctorUser = await User.findOne({ _id: doctorInfo.userId });

    if (doctorUser) {
      doctorUser.unseenNotifications.push({
        type: "new-appointment-request",
        message: `New appointment request by ${userInfo.name} on ${startIST.format("DD-MM-YYYY")} at ${startIST.format("HH:mm")}`,
        onClickPath: "/doctor/appointments",
      });

      await doctorUser.save();
    }

    res.status(200).send({
      success: true,
      message: "Appointment booked successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "Error booking appointment",
      error: err.message,
    });
  }
});

router.post("/check-booking-availability", authMiddleware, async (req, res) => {
  try {
    const { doctorId, startTime } = req.body;

    const requestedStartIST = moment.tz(startTime, "DD-MM-YYYY HH:mm", "Asia/Kolkata");
    if (!requestedStartIST.isValid()) {
      return res.status(400).send({ success: false, message: "Invalid start time" });
    }

    const requestedEndIST = requestedStartIST.clone().add(30, "minutes");

    const requestedStartUTC = requestedStartIST.clone().utc().toDate();
    const requestedEndUTC = requestedEndIST.clone().utc().toDate();

    const overlappingAppointment = await Appointment.findOne({
      doctorId,
      status: "approved",
      appointmentStartTime: { $lt: requestedEndUTC },
      appointmentEndTime: { $gt: requestedStartUTC },
    });

    if (overlappingAppointment) {
      return res.status(200).send({ success: false, message: "This time slot is already booked" });
    }

    res.status(200).send({ success: true, message: "Appointment slot available" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Error checking availability" });
  }
});

router.get("/get-appointments-by-user-id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await Appointment.find({userId});
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
});

module.exports = router;