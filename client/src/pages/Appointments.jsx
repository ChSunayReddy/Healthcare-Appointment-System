import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch } from "react-redux";
import { Table } from "antd";
import { hideLoading, showLoading } from "../redux/alertsSlice";
import axios from "axios";
import moment from "moment";
function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();
  const getAppointmentsData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get(
        "/api/user/get-appointments-by-user-id",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getAppointmentsData();
  }, []);

  const columns = [
  {
    title: "Appointment ID",
    dataIndex: "_id",
  },
  {
    title: "Doctor",
    dataIndex: "doctorInfo",
    render: (text, record) => (
      <span>
        {record.doctorInfo.firstName} {record.doctorInfo.lastName}
      </span>
    ),
  },
  {
    title: "Phone",
    dataIndex: "doctorInfo",
    render: (text, record) => (
      <span>{record.doctorInfo.phoneNumber}</span>
    ),
  },
  {
    title: "Date & Time",
    dataIndex: "appointmentStartTime",
    render: (text, record) => (
      <span>
        {moment(record.appointmentStartTime).format("DD-MM-YYYY HH:mm")} –{" "}
        {moment(record.appointmentEndTime).format("HH:mm")}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status) => (
      <span
        style={{
          color:
            status === "approved"
              ? "green"
              : status === "rejected"
              ? "red"
              : "orange",
          fontWeight: "bold",
        }}
      >
        {status.toUpperCase()}
      </span>
    ),
  },
];

  return (
    <Layout>
      <h1>Appointments</h1>
      <Table columns={columns} dataSource={appointments} rowKey="_id" />
    </Layout>
  );
}
export default Appointments;
