import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Routes, Navigate } from "react-router-dom";

// Layout and Auth Components
import Layout from "./components/Layout";
import AdminRoute from "./components/AdminRoute";
import DoctorRoute from "./components/DoctorRoute";
import Login from "./pages/Login";
import DoctorSignup from "./pages/Doctor/DoctorSignup";
import OTP from "./pages/OTP";

// Admin Pages
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import EditDoctor from "./pages/Admin/EditDoctor";

// Doctor Pages
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import Inquiries from "./pages/Doctor/Inquiries";

const App = () => {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/doctor-signup" element={<DoctorSignup />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<AllAppointments />} />
            <Route path="add-doctor" element={<AddDoctor />} />
            <Route path="doctors" element={<DoctorsList />} />
            <Route path="edit-doctor/:id" element={<EditDoctor />} />
          </Route>
        </Route>

        {/* Protected Doctor Routes */}
        <Route path="/doctor" element={<DoctorRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="inquiries" element={<Inquiries />} />
          </Route>
        </Route>

        {/* Fallback to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
