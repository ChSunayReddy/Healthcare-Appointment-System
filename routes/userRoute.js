const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Otp = require("../models/otpModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const sendOtpEmail = require("../utils/sendEmail");
const moment = require("moment-timezone");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send OTP for Registration
router.post("/send-register-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ success: false, message: "Email is required" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(200).send({ success: false, message: "User already exists with this email" });
    }

    const otp = generateOtp();
    await Otp.deleteMany({ email: email.toLowerCase().trim(), purpose: "registration" });
    await new Otp({
      email: email.toLowerCase().trim(),
      otp,
      purpose: "registration",
    }).save();

    await sendOtpEmail(email.toLowerCase().trim(), otp, "Account Registration");

    res.status(200).send({
      success: true,
      message: "Verification OTP sent to your email",
    });
  } catch (error) {
    console.error("Error sending register OTP:", error);
    res.status(500).send({
      success: false,
      message: "Failed to send OTP. Please check your email credentials.",
      error: error.message,
    });
  }
});

// 2. Verify OTP and Complete Registration
router.post("/verify-and-register", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!name || !normalizedEmail || !password || !otp) {
      return res.status(400).send({ success: false, message: "All fields including OTP are required" });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(200).send({ success: false, message: "User already exists with this email" });
    }

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp,
      purpose: "registration",
    });

    if (!otpRecord) {
      return res.status(200).send({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });
    await newUser.save();

    // Delete used OTP
    await Otp.deleteMany({ email: normalizedEmail, purpose: "registration" });

    res.status(200).send({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error in verify-and-register:", error);
    res.status(500).send({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
});

// Fallback direct register
router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email?.toLowerCase().trim() });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    req.body.email = req.body.email?.toLowerCase().trim();
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

// 3. Direct Login (Validates Password & returns JWT)
router.post("/login", async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }

    if (!user.status) {
      return res.status(200).send({
        message: "Your account is blocked. Please contact support.",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password is incorrect", success: false });
    }

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
        isDoctor: user.isDoctor,
      },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error logging in", success: false, error });
  }
});

// 5. Send OTP for Forgot Password
router.post("/send-reset-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).send({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).send({ success: false, message: "User not found with this email" });
    }

    const otp = generateOtp();
    await Otp.deleteMany({ email: normalizedEmail, purpose: "forgot-password" });
    await new Otp({
      email: normalizedEmail,
      otp,
      purpose: "forgot-password",
    }).save();

    await sendOtpEmail(normalizedEmail, otp, "Password Reset");

    res.status(200).send({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in send-reset-otp:", error);
    res.status(500).send({
      success: false,
      message: "Failed to send reset OTP",
      error: error.message,
    });
  }
});

// 6. Reset Password with OTP Verification
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, otp, password, "confirm-password": confirmPassword } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
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

    if (!otp) {
      return res.status(200).send({ success: false, message: "OTP is required" });
    }

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp,
      purpose: "forgot-password",
    });

    if (!otpRecord) {
      return res.status(200).send({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();

    // Delete used OTP
    await Otp.deleteMany({ email: normalizedEmail, purpose: "forgot-password" });

    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
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
    const newdoctor = new Doctor({
      ...req.body,
      userId: req.user.id,
      status: "pending",
    });
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
      message: `${newdoctor.firstName} ${newdoctor.lastName} has applied for a doctor account`,
      data: {
        doctorId: newdoctor._id,
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
    res.status(500).send({
      message: "Error in applying doctor account",
      success: false,
      error: error.message,
    });
  }
});

router.post("/mark-all-notifications-as-seen", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
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
    const userId = req.user.id;
    const { notificationId } = req.body;
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