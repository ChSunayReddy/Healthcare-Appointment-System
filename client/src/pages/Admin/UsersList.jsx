import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import axios from "axios";
import { Table } from "antd";
import moment from "moment";
import toast from "react-hot-toast";
function Userslist() {
  const [users, setUsers ] = useState([]);
  const dispatch = useDispatch();
  const getUserData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get("/api/admin/get-all-users",{
        headers:{
                Authorization : `Bearer ${localStorage.getItem('token')}`
        },
      });
      dispatch(hideLoading());
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };
   const changeUserStatus = async (record, status) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/admin/change-user-status",
        {userId: record._id, status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        getUserData();
  
      }
    } catch (error) {
      toast.error("Error changing User status");
      dispatch(hideLoading());
    }
  };
  useEffect(() => {
    console.log(`Bearer ${localStorage.getItem('token')}`);
    getUserData();
  }, []);

  const columns = [
    {
    title: 'Name',
    dataIndex: 'name',
    },
    {
    title: 'Email',
    dataIndex: 'email',
    },
    {
    title: 'Created At',
    dataIndex: 'createdAt',
    render: (text) => moment(text).format("DD-MM-YYYY HH:mm"),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (status ? "Active" : "Blocked"),
    },
    {
    title: 'Actions',
    dataIndex: 'actions',
    render: (text, record) => {
        return (
          <div className="d-flex">
            {record.status === true && (
              <h1
                className="anchor"
                style={{
                  cursor: "pointer",
                  color: "#1890ff",
                  fontSize: "1.2rem",
                  margin: 0,
                }}
                onClick={() => {
                  changeUserStatus(record, "Blocked");
                }}
              >
                Block
              </h1>
            )}
            {record.status === false && (
              <h1
                className="anchor"
                style={{
                  cursor: "pointer",
                  color: "#ff4d4f",
                  fontSize: "1.2rem",
                  margin: 0,
                }}
                onClick={() => {
                  changeUserStatus(record, "Active");
                }}
              >
                Unblock
              </h1>
            )}
          </div>
        );
      },
    },
  ]
  return (
    <Layout>
      <h1>Users List</h1>
      <Table columns={columns} dataSource={users}/>
    </Layout>
  );
}
export default Userslist;
