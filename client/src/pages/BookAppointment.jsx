import { Row, Col, Button, DatePicker, TimePicker } from "antd";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

function BookAppointment() {
  const [isAvailable, setIsAvailable] = useState(false);
  const navigate = useNavigate();
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null); // Moment
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();

  // Fetch doctor info
  const getDoctorData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/doctor/get-doctor-info-by-id",
        { doctorId: params.doctorId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) setDoctor(response.data.data);
      else toast.error(response.data.message);
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Failed to fetch doctor data");
    }
  };

  // Book appointment
  const bookNow = async () => {
    if (!date || !time) {
      toast.error("Please select both date and time");
      return;
    }

    const startTime = moment(
      date.format("DD-MM-YYYY") + " " + time.format("HH:mm"),
      "DD-MM-YYYY HH:mm"
    );
    const endTime = startTime.clone().add(30, "minutes");

    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date: date.format("DD-MM-YYYY"),
          startTime: startTime.format("DD-MM-YYYY HH:mm"),
          endTime: endTime.format("DD-MM-YYYY HH:mm"),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/appointments");
      } else toast.error(response.data.message);
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Error booking appointment");
    }
  };

  // Check availability
  const checkAvailability = async () => {
    if (!date || !time) {
      toast.error("Please select both date and time");
      return;
    }

    const startTime = moment(
      date.format("DD-MM-YYYY") + " " + time.format("HH:mm"),
      "DD-MM-YYYY HH:mm"
    );
    const endTime = startTime.clone().add(30, "minutes");

    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/check-booking-availability",
        {
          doctorId: params.doctorId,
          date: date.format("DD-MM-YYYY"),
          startTime: startTime.format("DD-MM-YYYY HH:mm"),
          endTime: endTime.format("DD-MM-YYYY HH:mm"),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        setIsAvailable(true);
      } else {
        toast.error(response.data.message);
        setIsAvailable(false);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Error checking availability");
    }
  };

  // Fetch doctor data on mount
  useEffect(() => {
    getDoctorData();
  }, []);

  // Functions to disable hours and minutes based on doctor timing
  const getDisabledHours = () => {
    if (!doctor) return [];
    const start = parseInt(doctor.timings[0].split(":")[0]);
    const end = parseInt(doctor.timings[1].split(":")[0]);
    const hours = [];
    for (let i = 0; i < 24; i++) {
      if (i < start || i >= end) hours.push(i);
    }
    return hours;
  };

  const getDisabledMinutes = (selectedHour) => {
    if (!doctor) return [];
    const startHour = parseInt(doctor.timings[0].split(":")[0]);
    const endHour = parseInt(doctor.timings[1].split(":")[0]);
    if (selectedHour < startHour || selectedHour >= endHour) {
      return Array.from({ length: 60 }, (_, i) => i);
    }
    return [];
  };

  return (
    <Layout>
      {doctor && (
        <div>
          <h1 className="page-title">
            {doctor.firstName} {doctor.lastName}
          </h1>
          <hr />
          <Row gutter={[32, 20]} justify="space-between">
            <Col span={12} sm={24} xs={24} lg={10}>
              <h1 className="normal-text">
                <b>Timings : </b>
                {doctor.timings[0]} - {doctor.timings[1]}
              </h1>
              <p className="normal-text">
                <b>Phone Number : </b>
                {doctor.phoneNumber}
              </p>
              <p className="normal-text">
                <b>Address : </b>
                {doctor.address}
              </p>
              <p className="normal-text">
                <b>Fee per Visit : </b>
                {doctor.feePerConsultation}
              </p>
              <p className="normal-text">
                <b>Website : </b>
                {doctor.website}
              </p>

              <div className="d-flex flex-column pt-2">
                {user?.status ? (
                  <>
                    <DatePicker
                      format="DD-MM-YYYY"
                      onChange={(value) => setDate(value)}
                    />

                    <TimePicker
                      format="HH:mm"
                      className="mt-3"
                      onChange={(value) => setTime(value)}
                      disabledHours={getDisabledHours}
                      disabledMinutes={getDisabledMinutes}
                      minuteStep={15}
                    />

                    <Button
                      className="primary-button mt-3 full-width-button"
                      onClick={checkAvailability}
                    >
                      Check Availability
                    </Button>

                    {isAvailable && (
                      <Button
                        className="primary-button mt-3 full-width-button"
                        onClick={bookNow}
                      >
                        Book Now
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-danger mt-3">
                    🚫 Your account has been blocked. You cannot book appointments.
                  </p>
                )}
              </div>
            </Col>
            <Col span={12} sm={24} xs={24} lg={12}>
              <img
                src="https://www.shutterstock.com/image-vector/book-appointment-online-visit-hospital-600nw-2275269467.jpg"
                alt=""
                width="100%"
                height={400}
                className="image-online"
              />
            </Col>
          </Row>
        </div>
      )}
    </Layout>
  );
}

export default BookAppointment;