import { Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { hideLoading, showLoading } from "../redux/alertsSlice";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({});
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // Step 1: Send OTP to email
  const handleSendOtp = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/send-register-otp", {
        email: values.email,
      });
      dispatch(hideLoading());

      if (response.data.success) {
        toast.success(response.data.message);
        setFormData(values);
        setOtpSent(true);
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error(error.response?.data?.message || "Failed to send verification OTP");
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyAndRegister = async () => {
    if (!otp || otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/verify-and-register", {
        ...formData,
        otp: otp.trim(),
      });
      dispatch(hideLoading());

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/login");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/send-register-otp", {
        email: formData.email,
      });
      dispatch(hideLoading());

      if (response.data.success) {
        toast.success("New OTP sent to your email");
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="authentication">
      <div className="authentication-form card p-3">
        <h1 className="card-title">Nice to meet You</h1>
        <p className="text-secondary mb-3" style={{ fontSize: "14px" }}>
          {!otpSent
            ? "Create an account with email verification"
            : `Enter the 6-digit OTP sent to ${formData.email}`}
        </p>

        {!otpSent ? (
          <Form form={form} layout="vertical" onFinish={handleSendOtp}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Full Name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Email Address" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter a password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input placeholder="Password" type="password" />
            </Form.Item>

            <Button
              className="primary-button my-2 full-width-button"
              htmlType="submit"
            >
              GET OTP & PROCEED
            </Button>

            <Link to="/login" className="anchor mt-2">
              ALREADY HAVE AN ACCOUNT? LOGIN
            </Link>
          </Form>
        ) : (
          <div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: 500 }}>
                Verification OTP
              </label>
              <Input
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{
                  letterSpacing: "6px",
                  fontSize: "20px",
                  textAlign: "center",
                }}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ fontSize: "13px", color: "#666" }}>
                {timer > 0 ? `Resend OTP in ${timer}s` : "Didn't receive code?"}
              </span>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={handleResendOtp}
                disabled={!canResend}
                style={{
                  fontSize: "13px",
                  textDecoration: "none",
                  cursor: canResend ? "pointer" : "not-allowed",
                  color: canResend ? "#005555" : "#999",
                }}
              >
                Resend OTP
              </button>
            </div>

            <Button
              className="primary-button my-2 full-width-button"
              onClick={handleVerifyAndRegister}
            >
              VERIFY & REGISTER
            </Button>

            <div className="text-center mt-2">
              <span
                className="anchor"
                style={{ cursor: "pointer", fontSize: "13px" }}
                onClick={() => setOtpSent(false)}
              >
                ← Change Email or Details
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;