import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const API_BASE_URL = "https://authappapi.runasp.net/api";

const DoctorContextProvider = (props) => {
  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    rejected: 0,
    earnings: 0,
  });
  const [recentAppointment, setRecentAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDoctorStats = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.get(`${API_BASE_URL}/appointments/stats`, config);
    setStats(res.data);
    return res.data;
  };

  const fetchRecentAppointment = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.get(`${API_BASE_URL}/appointments/recent`, config);
    setRecentAppointment(res.data);
    return res.data;
  };

  const fetchAllDoctorData = async (token) => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [doctorRes, appointmentsRes, inquiriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/doctors/me`, config),
        axios.get(`${API_BASE_URL}/appointments`, config),
        axios.get(`${API_BASE_URL}/inquiries`, config) 
      ]);

      setDoctor(doctorRes.data);
      setAppointments(appointmentsRes.data);
      setInquiries(inquiriesRes.data);
      await fetchDoctorStats(token);
      await fetchRecentAppointment(token);

    } catch (error) {
      toast.error("Failed to fetch critical doctor data. Please try logging in again.");
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const completeAppointment = async (appointmentId) => {
    try {
      await axios.post(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {}, {
        headers: { Authorization: `Bearer ${dToken}` }
      });
      toast.success("Appointment marked as completed.");
      await fetchAllDoctorData(dToken); // Re-fetch all data
    } catch (error) {
      toast.error("Failed to update appointment.");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await axios.post(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${dToken}` }
      });
      toast.success("Appointment cancelled.");
      await fetchAllDoctorData(dToken); // Re-fetch all data
    } catch (error) {
      toast.error("Failed to cancel appointment.");
    }
  };

  const updateDoctorProfile = async (profileData) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/doctors/me`, profileData, {
        headers: { Authorization: `Bearer ${dToken}` }
      });
      setDoctor(res.data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error("Profile update error:", error, error?.response);
    }
  };

  useEffect(() => {
    if (dToken) {
      fetchAllDoctorData(dToken);
    } else {
      setLoading(false);
    }
  }, [dToken]);

  const contextValue = {
    dToken,
    setDToken,
    doctor,
    appointments,
    inquiries,
    stats,
    recentAppointment,
    loading,
    completeAppointment,
    cancelAppointment,
    updateDoctorProfile,
    fetchDoctorStats,
    fetchRecentAppointment,
  };

  return (
    <DoctorContext.Provider value={contextValue}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
