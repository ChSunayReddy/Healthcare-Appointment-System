# 🏥 Healthcare Doctor Appointment System

A modern, full-stack **MERN (MongoDB, Express.js, React, Node.js)** web application for seamless online healthcare appointment scheduling and management. Equipped with **Email OTP Verification (Nodemailer)**, **Role-Based Access Control (RBAC)**, **Redux Toolkit state management**, and **Ant Design UI**.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Website-brightgreen?style=for-the-badge&logo=netlify)](https://healthcare-doctor-appointment-system.netlify.app/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

---

## 🌐 Live Demo
🔗 **Deployed Application**: [https://healthcare-doctor-appointment-system.netlify.app/](https://healthcare-doctor-appointment-system.netlify.app/)

---

## 🚀 Key Features

### 🔐 1. Authentication & Security
- **Email OTP Verification**: 6-digit OTP dispatched via Gmail SMTP for new account registration and password resets.
- **Auto-Expiring OTPs**: Managed with MongoDB Time-To-Live (TTL) index (5-minute auto-deletion).
- **JWT Stateless Authentication**: Secure token generation with 1-day validity.
- **Role-Based Access Control (RBAC)**: Enforced via `authMiddleware` and `adminMiddleware`.
- **Bcrypt Password Hashing**: Passwords are securely salted and hashed.
- **Direct Login**: Fast, secure login with email and password.

---

### 🧑‍⚕️ 2. Patient / User Module
- **Browse Doctors**: View approved doctors by specialty, consultation fees, and working hours.
- **Slot Availability Check**: Real-time 30-minute interval availability checks in IST/UTC.
- **Atomic Booking**: Schedule appointments with automatic collision prevention against double-booking.
- **Appointment History**: Track real-time status of booked appointments (`pending`, `approved`, `rejected`).
- **Apply as Doctor**: Submit personal and professional credentials to become a registered doctor on the platform.
- **Notification Hub**: Real-time alerts for appointment updates and application decisions with "Mark as seen" and "Delete all".

---

### 👨‍⚕️ 3. Doctor Module
- **Profile & Timings Management**: Configure consultation fees, addresses, specialties, and active consultation hours.
- **Appointment Management**: View incoming patient requests and **Approve** or **Reject** appointments.
- **Patient Alerts**: Trigger automatic in-app notifications to patients whenever appointment statuses are updated.

---

### 🛡️ 4. Admin Dashboard
- **Doctor Verification**: Review pending doctor applications with one-click **Approve** or **Block** actions.
- **User Management**: Monitor all registered users and toggle account statuses (**Active** / **Blocked**).
- **Protected Endpoints**: Admin APIs are strictly guarded by `adminMiddleware`.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, React Router v7, Redux Toolkit, Ant Design (v5), React Hot Toast, Axios |
| **Backend** | Node.js, Express.js (v5), Nodemailer (Gmail SMTP), Moment.js, Moment-Timezone |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Auth & Security** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, MongoDB TTL Indexes |

---

## 📂 Project Structure

```bash
Healthcare-Appointment-System/
├── config/
│   └── dbconfig.js               # MongoDB connection configuration
├── middlewares/
│   ├── authMiddleware.js         # JWT token authentication middleware
│   └── adminMiddleware.js        # Admin role authorization guard
├── models/
│   ├── userModel.js              # User schema & notification subdocument
│   ├── doctorModel.js            # Doctor details & approval status schema
│   ├── appointmentModel.js       # Appointment booking schema
│   └── otpModel.js               # OTP schema with 5-minute TTL index
├── routes/
│   ├── userRoute.js              # Auth, OTP, booking & notification routes
│   ├── doctorsRoute.js           # Doctor profile & appointment status routes
│   └── adminRoute.js             # Admin doctor/user management routes
├── utils/
│   └── sendEmail.js              # Nodemailer email dispatcher with HTML template
├── client/                       # React 19 Single Page Application
│   ├── public/                   # Static assets & HTML entry
│   └── src/
│       ├── components/           # Reusable UI (Layout, DoctorCard, DoctorForm, Guards)
│       ├── pages/                # App Views (Home, Login, Register, ForgotPassword, etc.)
│       │   ├── Admin/            # DoctorsList & UsersList management pages
│       │   └── Doctor/           # Profile & DoctorAppointments pages
│       └── redux/                # Redux Toolkit store, userSlice & alertsSlice
├── .env.example                  # Environment variable reference
├── .gitignore                    # Git ignore file (excludes secrets & dependencies)
├── server.js                     # Express API entry point
└── package.json                  # Root dependencies & scripts
```

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** database (Local or MongoDB Atlas)
- **Gmail Account** with an [App Password](https://myaccount.google.com/security) (for OTP delivery)

---

### 2. Clone the Repository
```bash
git clone https://github.com/ChSunayReddy/Healthcare-Appointment-System.git
cd Healthcare-Appointment-System
```

---

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/healthcare

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Server Port
PORT=5000

# Nodemailer / Gmail OTP Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_google_app_password
```

> [!TIP]
> **How to get a Gmail App Password**:
> 1. Enable **2-Step Verification** in your Google Account.
> 2. Search for **App passwords** in Google Account settings.
> 3. Generate a 16-character password and paste it into `EMAIL_PASS`.

---

### 4. Install Dependencies

**Install Backend Dependencies (Root):**
```bash
npm install
```

**Install Frontend Dependencies (Client):**
```bash
cd client
npm install
cd ..
```

---

### 5. Run the Application

Open **two separate terminals**:

**Terminal 1 (Backend Server):**
```bash
node server.js
# Or with nodemon for auto-reload:
npx nodemon server.js
```
*Backend runs at `http://localhost:5000`*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm start
```
*Frontend opens automatically at `http://localhost:3000`*

---

## 📡 REST API Reference

### 👤 User & Auth Endpoints (`/api/user`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/send-register-otp` | Send 6-digit registration OTP to email | Public |
| `POST` | `/verify-and-register` | Verify OTP and create user account | Public |
| `POST` | `/login` | Authenticate user & issue JWT token | Public |
| `POST` | `/send-reset-otp` | Send password reset OTP to email | Public |
| `POST` | `/forgot-password` | Verify OTP & update password | Public |
| `POST` | `/get-user-info-by-id` | Fetch authenticated user data | Authenticated |
| `POST` | `/apply-doctor-account` | Submit doctor application to admin | Authenticated |
| `GET`  | `/get-all-approved-doctors` | Fetch approved doctors list | Authenticated |
| `POST` | `/check-booking-availability`| Check 30-min slot availability | Authenticated |
| `POST` | `/book-appointment` | Book appointment & notify doctor | Authenticated |
| `GET`  | `/get-appointments-by-user-id`| Fetch user's appointment history | Authenticated |
| `POST` | `/mark-all-notifications-as-seen` | Move unseen notifications to seen | Authenticated |
| `POST` | `/mark-notification-as-seen` | Mark a specific notification as seen | Authenticated |
| `POST` | `/delete-all-notifications` | Delete all user notifications | Authenticated |

---

### 👨‍⚕️ Doctor Endpoints (`/api/doctor`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/get-doctor-info-by-user-id` | Get doctor profile by user ID | Authenticated |
| `POST` | `/get-doctor-info-by-id` | Get doctor public profile by doctor ID | Authenticated |
| `POST` | `/update-doctor-profile` | Update profile, timings & consultation fees | Doctor |
| `GET`  | `/get-appointments-by-doctor-id` | Fetch doctor's assigned appointments | Doctor |
| `POST` | `/change-appointment-status` | Approve or reject patient appointment | Doctor |

---

### 🛡️ Admin Endpoints (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET`  | `/get-all-doctors` | Fetch all doctors (Pending / Approved / Blocked) | Admin Only |
| `GET`  | `/get-all-users` | Fetch all registered patient accounts | Admin Only |
| `POST` | `/change-doctor-account-status`| Approve or block doctor account | Admin Only |
| `POST` | `/change-user-status` | Activate or block user account | Admin Only |

---

## 👨‍💻 Author
- **Sunay Reddy**
- GitHub: [@ChSunayReddy](https://github.com/ChSunayReddy)
- Project: [Healthcare Appointment System](https://github.com/ChSunayReddy/Healthcare-Appointment-System)

---

## 📜 License
This project is licensed for educational and portfolio demonstration purposes.
