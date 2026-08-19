import { Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { hideLoading, showLoading } from "../redux/alertsSlice";

function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
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

  // Step 1: Send Reset OTP
  const handleSendOtp = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/send-reset-otp", {
        email: values.email,
      });
      dispatch(hideLoading());

      if (response.data.success) {
        toast.success(response.data.message);
        setEmail(values.email);
        setOtpSent(true);
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to send reset OTP";
      toast.error(msg);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (values) => {
    if (values.password !== values["confirm-password"]) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/forgot-password", {
        email,
        otp: values.otp.trim(),
        password: values.password,
        "confirm-password": values["confirm-password"],
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
      toast.error(error.response?.data?.message || "Error resetting password");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      dispatch(showLoading());
      const response = await axios.post("/api/user/send-reset-otp", { email });
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
        <h1 className="card-title">Reset Password</h1>
        <p className="text-secondary mb-3" style={{ fontSize: "14px" }}>
          {!otpSent
            ? "Enter your registered email to receive a reset code"
            : `Enter the code sent to ${email} along with your new password`}
        </p>

        {!otpSent ? (
          <Form form={form} layout="vertical" onFinish={handleSendOtp}>
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

            <Button
              className="primary-button my-2 full-width-button"
              htmlType="submit"
            >
              SEND RESET OTP
            </Button>

            <Link to="/login" className="anchor mt-2">
              REMEMBER YOUR PASSWORD? LOGIN
            </Link>
          </Form>
        ) : (
          <Form layout="vertical" onFinish={handleResetPassword}>
            <Form.Item
              label="6-Digit OTP"
              name="otp"
              rules={[
                { required: true, message: "Please enter the OTP" },
                { len: 6, message: "OTP must be exactly 6 digits" },
              ]}
            >
              <Input
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                style={{
                  letterSpacing: "6px",
                  fontSize: "18px",
                  textAlign: "center",
                }}
              />
            </Form.Item>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ fontSize: "13px", color: "#666" }}>
                {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive code?"}
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

            <Form.Item
              label="New Password"
              name="password"
              rules={[
                { required: true, message: "Please enter a new password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input placeholder="New Password" type="password" />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirm-password"
              rules={[
                { required: true, message: "Please confirm your new password" },
              ]}
            >
              <Input placeholder="Confirm New Password" type="password" />
            </Form.Item>

            <Button
              className="primary-button my-2 full-width-button"
              htmlType="submit"
            >
              UPDATE PASSWORD
            </Button>

            <div className="text-center mt-2">
              <span
                className="anchor"
                style={{ cursor: "pointer", fontSize: "13px" }}
                onClick={() => setOtpSent(false)}
              >
                ← Change Email Address
              </span>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;