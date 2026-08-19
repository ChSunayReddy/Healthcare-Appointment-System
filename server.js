const dns = require("dns");
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Fallback if older node version
}

const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

const dbConfig = require("./config/dbconfig");

// Allowed CORS origins
const allowedOrigins = [
  "https://healthcare-doctor-appointment-system.netlify.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

const userRoute = require("./routes/userRoute");
app.use("/api/user", userRoute);

const doctorRoute = require("./routes/doctorsRoute");
app.use("/api/doctor", doctorRoute);

const adminRoute = require("./routes/adminRoute");
app.use("/api/admin", adminRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Node server started at port: ${port}`));
