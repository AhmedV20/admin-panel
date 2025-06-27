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
      // Fetch doctor first, handle error separately
      let doctorRes;
      try {
        doctorRes = await axios.get(`${API_BASE_URL}/doctors/me`, config);
        setDoctor(doctorRes.data);
      } catch (err) {
        setDoctor(null);
        setAppointments([]);
        setInquiries([]);
        setStats({ total: 0, completed: 0, cancelled: 0, pending: 0, rejected: 0, earnings: 0 });
        setRecentAppointment(null);
        toast.error("Failed to fetch critical doctor data. Please try logging in again.");
        setLoading(false);
        return;
      }
      // If doctor exists, fetch the rest
      const [appointmentsRes, inquiriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/appointments`, config),
        axios.get(`${API_BASE_URL}/inquiries`, config)
      ]);
      setAppointments(appointmentsRes.data);
      setInquiries(inquiriesRes.data);
      await fetchDoctorStats(token);
      await fetchRecentAppointment(token);
    } catch (error) {
      toast.error("Failed to fetch additional doctor data.");
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
      // Map the frontend data to match the backend's DoctorProfileUpdateRequest DTO
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phone, // Map phone to phoneNumber
        degree: profileData.degree,
        experience: profileData.experience,
        about: profileData.about,
        address: profileData.address,
        fees: profileData.fees,
        image: profileData.image
        // Note: specialty is intentionally excluded as it should not be editable
      };

      const res = await axios.patch(`${API_BASE_URL}/doctors/me`, updateData, {
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
