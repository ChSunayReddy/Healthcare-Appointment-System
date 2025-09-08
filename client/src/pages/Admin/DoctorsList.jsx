import React, { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import { useDispatch } from "react-redux";
import { Table } from "antd";
import { hideLoading, showLoading } from "../../redux/alertsSlice";
import axios from "axios";
import { toast } from "react-hot-toast";
import moment from "moment";

function Doctorslist() {
  const [doctors, setDoctors] = useState([]);
  const dispatch = useDispatch();

  const getDoctorsData = useCallback(async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get("/api/admin/get-all-doctors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  }, [dispatch]);

  const changeDoctorStatus = async (record, status) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/admin/change-doctor-account-status",
        { doctorId: record._id, userId: record.userId, status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        getDoctorsData();
      }
    } catch (error) {
      toast.error("Error changing doctor status");
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, [getDoctorsData]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => (
        <span>
          {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("DD-MM-YYYY HH:mm"),
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex">
          {record.status === "pending" && (
            <h1
              className="anchor"
              style={{ cursor: "pointer", color: "#1890ff", fontSize: "1.2rem", margin: 0 }}
              onClick={() => changeDoctorStatus(record, "approved")}
            >
              Approve
            </h1>
          )}
          {record.status === "approved" && (
            <h1
              className="anchor"
              style={{ cursor: "pointer", color: "#ff4d4f", fontSize: "1.2rem", margin: 0 }}
              onClick={() => changeDoctorStatus(record, "blocked")}
            >
              Block
            </h1>
          )}
          {record.status === "blocked" && (
            <h1
              className="anchor"
              style={{ cursor: "pointer", color: "#1890ff", fontSize: "1.2rem", margin: 0 }}
              onClick={() => changeDoctorStatus(record, "approved")}
            >
              Unblock
            </h1>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <h1>Doctors List</h1>
      <Table columns={columns} dataSource={doctors} rowKey="_id" />
    </Layout>
  );
}

export default Doctorslist;


// import React, { useEffect, useState } from "react";
// import Layout from "../../components/Layout";
// import { useDispatch } from "react-redux";
// import { Table } from "antd";
// import { hideLoading, showLoading } from "../../redux/alertsSlice";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import moment from "moment";
// function Doctorslist() {
//   const [doctors, setDoctors] = useState([]);
//   const dispatch = useDispatch();
//   const getDoctorsData = async () => {
//     try {
//       dispatch(showLoading());
//       const response = await axios.get("/api/admin/get-all-doctors", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       dispatch(hideLoading());
//       if (response.data.success) {
//         setDoctors(response.data.data);
//         console.log(response.data.data);
//       }
//     } catch (error) {
//       dispatch(hideLoading());
//     }
//   };

//   const changeDoctorStatus = async (record, status) => {
//     try {
//       dispatch(showLoading());
//       const response = await axios.post(
//         "/api/admin/change-doctor-account-status",
//         { doctorId: record._id, userId: record.userId, status: status },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       dispatch(hideLoading());
//       if (response.data.success) {
//         toast.success(response.data.message);
//         getDoctorsData();
  
//       }
//     } catch (error) {
//       toast.error("Error changing doctor status");
//       dispatch(hideLoading());
//     }
//   };
//   useEffect(() => {
//     getDoctorsData();
//   }, []);
//   const columns = [
//     {
//       title: "Name",
//       dataIndex: "name",
//       render: (text, record) => (
//         <span>
//           {record.firstName} {record.lastName}
//         </span>
//       ),
//     },
//     {
//       title: "Created At",
//       dataIndex: "createdAt",
//       render: (text) => moment(text).format("DD-MM-YYYY HH:mm"),
//     },
//     {
//       title: "Phone",
//       dataIndex: "phoneNumber",
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//     },
//     {
//       title: "Actions",
//       dataIndex: "actions",
//       render: (text, record) => {
//         return (
//           <div className="d-flex">
//             {record.status === "pending" && (
//               <h1
//                 className="anchor"
//                 style={{
//                   cursor: "pointer",
//                   color: "#1890ff",
//                   fontSize: "1.2rem",
//                   margin: 0,
//                 }}
//                 onClick={() => {
//                   changeDoctorStatus(record, "approved");
//                 }}
//               >
//                 Approve
//               </h1>
//             )}
//             {record.status === "approved" && (
//               <h1
//                 className="anchor"
//                 style={{
//                   cursor: "pointer",
//                   color: "#ff4d4f",
//                   fontSize: "1.2rem",
//                   margin: 0,
//                 }}
//                 onClick={() => {
//                   changeDoctorStatus(record, "blocked");
//                 }}
//               >
//                 Block
//               </h1>
//             )}
//             {record.status === "blocked" && (
//   <h1
//     className="anchor"
//     style={{
//       cursor: "pointer",
//       color: "#1890ff",
//       fontSize: "1.2rem",
//       margin: 0,
//     }}
//     onClick={() => {
//       changeDoctorStatus(record, "approved");
//     }}
//   >
//     Unblock
//   </h1>
// )}
//           </div>
//         );
//       },
//     },
//   ];
//   return (
//     <Layout>
//       <h1>Doctors List</h1>
//       <Table columns={columns} dataSource={doctors} rowKey="_id" />
//     </Layout>
//   );
// }
// export default Doctorslist;
