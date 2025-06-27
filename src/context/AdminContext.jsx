import { createContext, useState, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AdminContext = createContext();

const API_BASE_URL = "https://authappapi.runasp.net/api";

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([
    {
      _id: "1",
      firstName: "Ahmed",
      lastName: "Mohamed",
      email: "ahmed@example.com",
      phone: "0123456789",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23e5e7eb'/%3E%3Ctext x='75' y='85' text-anchor='middle' font-family='Arial' font-size='16' fill='%236b7280'%3EDr. Ahmed%3C/text%3E%3C/svg%3E",
      speciality: "Cardiology",
      degree: "MBBS, MD",
      experience: "10 years",
      about: "Experienced cardiologist with expertise in interventional cardiology",
      fees: 500,
      isAvailable: true
    },
    {
      _id: "2", 
      firstName: "Fatima",
      lastName: "Ali",
      email: "fatima@example.com",
      phone: "0987654321",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23e5e7eb'/%3E%3Ctext x='75' y='85' text-anchor='middle' font-family='Arial' font-size='16' fill='%236b7280'%3EDr. Fatima%3C/text%3E%3C/svg%3E",
      speciality: "Pediatrics",
      degree: "MBBS, DCH",
      experience: "8 years",
      about: "Specialized in pediatric care and child development",
      fees: 400,
      isAvailable: false
    }
  ]);
  const [appointments, setAppointments] = useState([
    {
      _id: "1",
      userData: {
        name: "Mohamed Ahmed",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3Ctext x='16' y='20' text-anchor='middle' font-family='Arial' font-size='10' fill='%236b7280'%3EMA%3C/text%3E%3C/svg%3E",
        dob: "1990-05-15"
      },
      docData: {
        name: "Dr. Ahmed Mohamed",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3Ctext x='16' y='20' text-anchor='middle' font-family='Arial' font-size='10' fill='%236b7280'%3EDr%3C/text%3E%3C/svg%3E"
      },
      slotDate: "2024-01-15",
      slotTime: "10:00",
      amount: 500,
      cancelled: false,
      isCompleted: false
    },
    {
      _id: "2",
      userData: {
        name: "Sara Mahmoud",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3Ctext x='16' y='20' text-anchor='middle' font-family='Arial' font-size='10' fill='%236b7280'%3ESM%3C/text%3E%3C/svg%3E",
        dob: "1985-08-22"
      },
      docData: {
        name: "Dr. Fatima Ali",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3Ctext x='16' y='20' text-anchor='middle' font-family='Arial' font-size='10' fill='%236b7280'%3EDr%3C/text%3E%3C/svg%3E"
      },
      slotDate: "2024-01-16",
      slotTime: "14:30",
      amount: 400,
      cancelled: false,
      isCompleted: true
    },
    {
      _id: "3",
      userData: {
        name: "Ali Hassan",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3Ctext x='16' y='20' text-anchor='middle' font-family='Arial' font-size='10' fill='%236b7280'%3EAH%3C/text%3E%3C/svg%3E",
        dob: "1992-03-10"
      },
      docData: {
        name: "Dr. Ahmed Mohamed",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3Ctext x='16' y='20' text-anchor='middle' font-family='Arial' font-size='10' fill='%236b7280'%3EDr%3C/text%3E%3C/svg%3E"
      },
      slotDate: "2024-01-17",
      slotTime: "09:00",
      amount: 500,
      cancelled: true,
      isCompleted: false
    }
  ]);
  const [dashData, setDashData] = useState(null);
  const [users, setUsers] = useState([]);

  const getAllDoctors = async () => {
    try {
      if (!aToken) return;
      const response = await axios.get(`${API_BASE_URL}/doctors?includeInactive=true`, {
        headers: {
          Authorization: `Bearer ${aToken}`,
        },
      });
      setDoctors(response.data);
      return response.data || [];
    } catch (error) {
      toast.error("Failed to fetch doctors list.");
      console.error("Error fetching doctors:", error);
      return [];
    }
  };

  const activateDoctor = async (docId) => {
    try {
      await axios.patch(`${API_BASE_URL}/doctors/${docId}/activate`, {}, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      getAllDoctors();
      toast.success("Doctor activated successfully");
    } catch (error) {
      toast.error("Failed to activate doctor.");
    }
  };

  const deactivateDoctor = async (docId) => {
    try {
      await axios.patch(`${API_BASE_URL}/doctors/${docId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      getAllDoctors();
      toast.success("Doctor deactivated successfully");
    } catch (error) {
      toast.error("Failed to deactivate doctor.");
    }
  };

  const changeAvailability = async (docId, isActive) => {
    if (isActive) {
      await deactivateDoctor(docId);
    } else {
      await activateDoctor(docId);
    }
  };

  const notifyDoctor = async (docId, message) => {
    try {
      await axios.post(`${API_BASE_URL}/doctors/${docId}/notify`, { message }, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      toast.success("Notification sent to doctor");
    } catch (error) {
      toast.error("Failed to send notification.");
    }
  };

  const getAllAppointments = async (filters = {}) => {
    try {
      let url = `${API_BASE_URL}/appointments`;
      const params = [];
      if (filters.status) params.push(`status=${filters.status}`);
      if (filters.doctorId) params.push(`doctorId=${filters.doctorId}`);
      if (filters.userId) params.push(`userId=${filters.userId}`);
      if (filters.includeAll) params.push(`includeAll=true`);
      if (params.length) url += `?${params.join('&')}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${aToken}` }
      });
      setAppointments(res.data);
      return res.data || [];
    } catch (error) {
      toast.error("Failed to fetch appointments");
      setAppointments([]);
      return [];
    }
  };

  const approveAppointment = async (appointmentId) => {
    try {
      await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/approve`, {}, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      toast.success("Appointment approved successfully");
      getAllAppointments();
    } catch (error) {
      toast.error("Failed to approve appointment");
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {}, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      toast.success("Appointment marked as completed");
      getAllAppointments();
    } catch (error) {
      toast.error("Failed to complete appointment");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      toast.success("Appointment cancelled successfully");
      getAllAppointments();
    } catch (error) {
      toast.error("Error cancelling appointment");
    }
  };

  const deleteDoctor = async (docId) => {
    try {
      await axios.delete(`${API_BASE_URL}/doctors/${docId}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setDoctors((prevDoctors) =>
        prevDoctors.filter((doc) => (doc.id || doc._id) !== docId)
      );
      toast.success("Doctor deleted successfully");
    } catch (error) {
      toast.error("Failed to delete doctor.");
      console.error("Error deleting doctor:", error);
    }
  };

  const getDashData = async () => {
    if (!aToken) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setDashData({
        totalDoctors: response.data.totalDoctors,
        totalAppointments: response.data.totalAppointments,
        totalPatients: response.data.totalPatients,
        totalEarnings: response.data.totalEarnings,
        latestAppointments: response.data.recentAppointments,
      });
    } catch (error) {
      toast.error("Failed to fetch dashboard stats.");
      setDashData(null);
    }
  };

  const getAllUsers = useCallback(async () => {
    try {
      if (!aToken) return;
      const res = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setUsers(res.data);
      return res.data;
    } catch (error) {
      toast.error("Failed to fetch users list.");
      setUsers([]);
      return [];
    }
  }, [aToken]);

  const updateUser = async (userId, data) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/user/${userId}`, data, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      toast.success("User updated successfully");
      getAllUsers();
    } catch (error) {
      toast.error("Failed to update user.");
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      toast.success("User deleted successfully");
      getAllUsers();
    } catch (error) {
      toast.error("Failed to delete user.");
    }
  };

  const notifyUser = async (userId, message) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/user/${userId}/notify`, { message }, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      toast.success("Notification sent to user");
    } catch (error) {
      toast.error("Failed to send notification.");
    }
  };

  const value = {
    aToken,
    setAToken,
    doctors,
    setDoctors,
    getAllDoctors,
    activateDoctor,
    deactivateDoctor,
    changeAvailability,
    notifyDoctor,
    appointments,
    setAppointments,
    getAllAppointments,
    approveAppointment,
    completeAppointment,
    cancelAppointment,
    deleteDoctor,
    dashData,
    getDashData,
    users,
    setUsers,
    getAllUsers,
    updateUser,
    deleteUser,
    notifyUser,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
