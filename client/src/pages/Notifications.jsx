import React from "react";
import Layout from "../components/Layout";
import { Tabs } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { setUser } from "../redux/userSlice";

function Notifications() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const markAllasSeen = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/mark-all-notifications-as-seen",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(setUser(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  };

  const deleteAll = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/delete-all-notifications",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(setUser(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  };

  // Mark single notification as seen and navigate
  const handleNotificationClick = async (notification) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/mark-notification-as-seen",
        { notificationId: notification._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        dispatch(setUser(response.data.data));
        navigate(notification.onClickPath);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  };

  const unseenContent = (
    <div>
      <div className="d-flex justify-content-end mb-2">
        <h1 className="anchor" style={{ cursor: "pointer", fontSize: "14px" }} onClick={markAllasSeen}>
          Mark all as seen
        </h1>
      </div>
      {user?.unseenNotifications && user.unseenNotifications.length > 0 ? (
        user.unseenNotifications.map((notification, index) => (
          <div
            key={notification._id || index}
            className="card p-2 mt-2 cursor-pointer"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="card-text">{notification.message}</div>
          </div>
        ))
      ) : (
        <p className="text-secondary text-center my-4">No unseen notifications</p>
      )}
    </div>
  );

  const seenContent = (
    <div>
      <div className="d-flex justify-content-end mb-2">
        <h1 className="anchor" style={{ cursor: "pointer", fontSize: "14px" }} onClick={deleteAll}>
          Delete all
        </h1>
      </div>
      {user?.seenNotifications && user.seenNotifications.length > 0 ? (
        user.seenNotifications.map((notification, index) => (
          <div
            key={notification._id || index}
            className="card p-2 mt-2 cursor-pointer"
            onClick={() => navigate(notification.onClickPath)}
          >
            <div className="card-text">{notification.message}</div>
          </div>
        ))
      ) : (
        <p className="text-secondary text-center my-4">No seen notifications</p>
      )}
    </div>
  );

  const tabItems = [
    {
      key: "0",
      label: `Unseen (${user?.unseenNotifications?.length || 0})`,
      children: unseenContent,
    },
    {
      key: "1",
      label: `Seen (${user?.seenNotifications?.length || 0})`,
      children: seenContent,
    },
  ];

  return (
    <Layout>
      <h1 className="page-title">Notifications</h1>
      <Tabs items={tabItems} defaultActiveKey="0" />
    </Layout>
  );
}

export default Notifications;