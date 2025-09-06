import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DoctorForm from "../../components/DoctorForm";
import moment from "moment";

function Profile() {
  const [doctor, setDoctor] = useState(null);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/doctor/update-doctor-profile",
        {
          ...values,
          userId: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  };

  const getDoctorData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/doctor/get-doctor-info-by-user-id",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        setDoctor(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Failed to fetch doctor data");
    }
  };

  useEffect(() => {
    if (user?._id) {
      getDoctorData();
    }
  }, [user]);

  // FIX: Use a more robust check to ensure valid moment objects are created
  const initialValues = useMemo(() => {
    if (!doctor) return null;

    const formattedTimings =
      Array.isArray(doctor.timings) && doctor.timings.length === 2
        ? [
            moment(doctor.timings[0], "HH:mm"),
            moment(doctor.timings[1], "HH:mm"),
          ]
        : undefined;

    return {
      ...doctor,
      timings: formattedTimings,
    };
  }, [doctor]);

  return (
    <Layout>
      <h1 className="page-title">Doctor Profile</h1>
      <hr />
      {initialValues && (
        <DoctorForm onFinish={onFinish} initialValues={initialValues} />
      )}
    </Layout>
  );
}

export default Profile;