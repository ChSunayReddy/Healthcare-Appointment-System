import React from "react";
import {BrowserRouter , Routes , Route} from 'react-router-dom';
import Login from './pages/Login'
import Register from './pages/Register'
import { Toaster } from 'react-hot-toast';
import {Button} from 'antd';
import Home from "./pages/Home";
import { useSelector } from "react-redux";
import ProtectedRoutes from "./components/ProtectedRoutes";
import PublicRoute from "./components/publicRoute";
import ApplyDocter from "./pages/ApplyDocter";
import Notifications from "./pages/Notifications";
import Doctorslist from "./pages/Admin/DoctorsList";
import Userslist from "./pages/Admin/UsersList";
import Profile from "./pages/Doctor/Profile";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import ForgotPassword from "./pages/ForgotPassword";
function App() {
  const {loading} = useSelector(state => state.alerts);
  return (
    <BrowserRouter>
    {loading && (
      <div className="spinner-parent">
      <div class="spinner-border" role="status">
        
      </div>
    </div>
    )}
      <Toaster position="top-center" reverseOrder={false}/>
      <Routes>
          <Route path='/login' element={<PublicRoute><Login/></PublicRoute>}/>
          <Route path='/register' element={<PublicRoute><Register/></PublicRoute>}/>
          <Route path='/forgot-password' element={<PublicRoute><ForgotPassword/></PublicRoute>}/>
          <Route path='/' element={<ProtectedRoutes><Home/></ProtectedRoutes>}/>
          <Route path='/apply-doctor' element={<ProtectedRoutes><ApplyDocter/></ProtectedRoutes>}/>
          <Route path='/notifications' element={<ProtectedRoutes><Notifications/></ProtectedRoutes>}/>
          <Route path='/admin/doctorslist' element={<ProtectedRoutes><Doctorslist/></ProtectedRoutes>}/>
          <Route path='/admin/userslist' element={<ProtectedRoutes><Userslist/></ProtectedRoutes>}/>
          <Route path='/doctor/profile/:userId' element={<ProtectedRoutes><Profile/></ProtectedRoutes>}/>
          <Route path='/book-appointment/:doctorId' element={<ProtectedRoutes><BookAppointment/></ProtectedRoutes>}/>
          <Route path='/appointments' element={<ProtectedRoutes><Appointments/></ProtectedRoutes>}/>
          <Route path='/doctor/appointments' element={<ProtectedRoutes><DoctorAppointments/></ProtectedRoutes>}/>
      </Routes>
    
    
    </BrowserRouter>
  );
}

export default App;
