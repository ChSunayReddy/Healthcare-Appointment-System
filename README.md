# 🏥 Healthcare Appointment System

A **full-stack MERN web application** designed to simplify and digitize the healthcare appointment booking process. The system enables patients to book appointments online and allows doctors to manage schedules securely using **JWT-based authentication**, **role-based access control**, and **MongoDB**.

# Deployed Link 
- https://healthcare-doctor-appointment-system.netlify.app/

---

## 📌 Project Overview

The Healthcare Appointment System provides an efficient platform for managing healthcare appointments through a secure and user-friendly interface. It replaces manual appointment scheduling with a digital solution, making it suitable for **academic projects, campus placements, and portfolio demonstrations**.
- It has three logins Patient, Doctor, and Admin. 
- Patient applies appointment for the doctor and Doctor Accepts or Rejects the appointment. 
- For the Doctor , The patient applies for the doctor to the admin and the admin accepts or rejects the doctor application.

---

## 🚀 Features

### 👤 Authentication & Authorization
- User registration and login
- JSON Web Token (JWT) based authentication
- Role-based access control (Patient / Doctor)
- Protected backend routes

### 🧑‍⚕️ Patient Module
- Book healthcare appointments
- View scheduled appointments
- Cancel appointments
- Manage personal profile

### 👨‍⚕️ Doctor Module
- View assigned appointments
- Manage appointment schedules
- Access patient appointment details

### 🔐 Security
- Secure password handling
- Environment-based configuration
- API protection using JWT middleware

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- RESTful APIs

### Database
- MongoDB
- Mongoose

### Authentication
- JSON Web Tokens (JWT)
- Role-Based Access Control

---

## 📂 Project Structure
```bash
Healthcare-Appointment-System/
├── client/                     # React frontend application
│   ├── public/                 # Static assets
│   └── src/                    # React components, pages, services
│
├── models/                     # MongoDB schemas (User, Doctor, Appointment)
│
├── routes/                     # Express API routes
│   ├── authRoutes.js           # Authentication routes
│   └── appointmentRoutes.js    # Appointment management routes
│
├── middleware/                 # Authentication & role-based authorization
│   └── authMiddleware.js
│
├── config/                     # Database & environment configuration
│   └── db.js                   # MongoDB connection setup
│
├── server.js                   # Main backend entry point
├── package.json                # Backend dependencies & scripts
└── README.md                   # Project documentation

```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js
- MongoDB
- npm

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/ChSunayReddy/Healthcare-Appointment-System.git
Navigate to the project directory

cd Healthcare-Appointment-System
Install backend dependencies

npm install
Install frontend dependencies

cd client
npm install
Create a .env file in the root directory

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
Run the application

Backend:
npm start

Frontend:
cd client
npm start
```

🔄 API Endpoints (Sample)
Method	Endpoint	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	Login user
GET	/api/appointments	View appointments
POST	/api/appointments	Book appointment
DELETE	/api/appointments/:id	Cancel appointment

🎯 Learning Outcomes
Practical experience with MERN stack

Implementation of JWT authentication

Role-based authorization

REST API development

Frontend–backend integration

MongoDB data modeling

🚧 Future Enhancements
Admin dashboard

Appointment reminders (Email/SMS)

Doctor availability calendar

Online payment integration

👨‍💻 Author
Sunay Reddy
GitHub: https://github.com/ChSunayReddy

📜 License
This project is developed for educational and academic purposes.
