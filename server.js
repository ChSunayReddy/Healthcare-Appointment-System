const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

const dbConfig = require("./config/dbconfig");

// Enable CORS
app.use(cors({
  origin: "https://healthcare-doctor-appointment-system.netlify.app", // frontend URL
  credentials: true
}));

app.use(express.json());

const userRoute = require("./routes/userRoute");
app.use('/api/user', userRoute);

const doctorRoute = require("./routes/doctorsRoute");
app.use('/api/doctor', doctorRoute);

const adminRoute = require("./routes/adminRoute");
app.use('/api/admin', adminRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Node server started at port: ${port}`));

// const express=require('express');
// const app=express();
// require('dotenv').config()

// const dbConfig= require("./config/dbconfig");
// app.use(express.json());
// const userRoute = require("./routes/userRoute");
// app.use('/api/user',userRoute);
// const doctorRoute = require("./routes/doctorsRoute");
// app.use('/api/doctor',doctorRoute);
// const adminRoute  = require("./routes/adminRoute");
// app.use('/api/admin',adminRoute);
// const port=process.env.PORT || 5000;


// app.listen(port, () => console.log(`Node server started at port : ${port}`));
