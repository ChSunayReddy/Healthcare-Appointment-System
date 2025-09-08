import React, { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import { useDispatch } from "react-redux";
import { Table } from "antd";
import { hideLoading, showLoading } from "../../redux/alertsSlice";
import axios from "axios";
import { toast } from "react-hot-toast";
import moment from "moment";

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();

  // Fetch appointments data
  const getAppointmentsData = useCallback(async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get(
        "/api/doctor/get-appointments-by-doctor-id",
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
      toast.error("Error fetching appointments");
    }
  }, [dispatch]);

  // Change appointment status
  const changeAppointmentStatus = async (record, status) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/doctor/change-appointment-status",
        { appointmentId: record._id, status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        getAppointmentsData();
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Error changing appointment status");
    }
  };

  useEffect(() => {
    getAppointmentsData();
  }, [getAppointmentsData]);

  // Table columns
  const columns = [
    { title: "Appointment ID", dataIndex: "_id" },
    {
      title: "Patient",
      dataIndex: "name",
      render: (text, record) => <span>{record.userInfo.name}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text, record) => <span>{record.userInfo.email}</span>,
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
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => {
        if (record.status === "pending") {
          return (
            <div className="d-flex">
              <h1
                className="anchor px-3"
                style={{
                  cursor: "pointer",
                  color: "#1890ff",
                  fontSize: "1.2rem",
                  margin: 0,
                }}
                onClick={() => changeAppointmentStatus(record, "approved")}
              >
                Approve
              </h1>
              <h1
                className="anchor"
                style={{
                  cursor: "pointer",
                  color: "#ff4d4f",
                  fontSize: "1.2rem",
                  margin: 0,
                }}
                onClick={() => changeAppointmentStatus(record, "rejected")}
              >
                Reject
              </h1>
            </div>
          );
        } else {
          return null;
        }
      },
    },
  ];

  return (
    <Layout>
      <h1>Appointments</h1>
      <Table columns={columns} dataSource={appointments} rowKey="_id" />
    </Layout>
  );
}

export default DoctorAppointments;


// import React, { useEffect, useState } from "react";
// import Layout from "../../components/Layout";
// import { useDispatch } from "react-redux";
// import { Table } from "antd";
// import { hideLoading, showLoading } from "../../redux/alertsSlice";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import moment from "moment";
// function DoctorAppointments() {
//   const [appointments, setAppointments] = useState([]);
//   const dispatch = useDispatch();
//   const getAppointmentsData = async () => {
//     try {
//       dispatch(showLoading());
//       const response = await axios.get(
//         "/api/doctor/get-appointments-by-doctor-id",
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       dispatch(hideLoading());
//       if (response.data.success) {
//         setAppointments(response.data.data);
//       }
//     } catch (error) {
//       dispatch(hideLoading());
//     }
//   };
//   const changeAppointmentStatus = async (record, status) => {
//     try {
//       dispatch(showLoading());
//       const response = await axios.post(
//         "/api/doctor/change-appointment-status",
//         { appointmentId: record._id, status: status},
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       dispatch(hideLoading());
//       if (response.data.success) {
//         toast.success(response.data.message);
//         getAppointmentsData();
//       }
//     } catch (error) {
//       toast.error("Error changing doctor status");
//       dispatch(hideLoading());
//     }
//   };

//   useEffect(() => {
//     getAppointmentsData();
//   }, []);

//   const columns = [
//     {
//       title: "Appointment ID",
//       dataIndex: "_id",
//     },
//     {
//       title: "Patient",
//       dataIndex: "name",
//       render: (text, record) => <span>{record.userInfo.name}</span>,
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       render: (text, record) => <span>{record.userInfo.email}</span>,
//     },
//     {
//       title: "Date & Time",
//       dataIndex: "appointmentStartTime",
//       render: (text, record) => (
//         <span>
//           {moment(record.appointmentStartTime).format("DD-MM-YYYY HH:mm")} –{" "}
//           {moment(record.appointmentEndTime).format("HH:mm")}
//         </span>
//       ),
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       render: (status) => (
//         <span
//           style={{
//             color:
//               status === "approved"
//                 ? "green"
//                 : status === "rejected"
//                 ? "red"
//                 : "orange",
//             fontWeight: "bold",
//           }}
//         >
//           {status.toUpperCase()}
//         </span>
//       ),
//     },
//     {
//       title: "Actions",
//       dataIndex: "actions",
//       render: (text, record) => {
//         return (
//           <div className="d-flex">
//             {record.status === "pending" && (
//               <div className="d-flex">
//                 <h1
//                   className="anchor px-3"
//                   style={{
//                     cursor: "pointer",
//                     color: "#1890ff",
//                     fontSize: "1.2rem",
//                     margin: 0,
//                   }}
//                   onClick={() => {
//                     changeAppointmentStatus(record, "approved");
//                   }}
//                 >
//                   Approve
//                 </h1>
//                 <h1
//                   className="anchor"
//                   style={{
//                     cursor: "pointer",
//                     color: "#ff4d4f",
//                     fontSize: "1.2rem",
//                     margin: 0,
//                   }}
//                   onClick={() => {
//                     changeAppointmentStatus(record, "rejected");
//                   }}
//                 >
//                   Reject
//                 </h1>
//               </div>
//             )}
//           </div>
//         );
//       },
//     },
//   ];

//   return (
//     <Layout>
//       <h1>Appointments</h1>
//       <Table columns={columns} dataSource={appointments} rowKey="_id" />
//     </Layout>
//   );
// }
// export default DoctorAppointments;
