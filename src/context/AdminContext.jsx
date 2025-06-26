import { createContext, useState } from "react";
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

  const getAllDoctors = async () => {
    try {
      if (!aToken) return;
      const response = await axios.get(`${API_BASE_URL}/doctors`, {
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

  const changeAvailability = async (docId) => {
    try {
      setDoctors(prevDoctors => 
        prevDoctors.map(doctor => 
          doctor._id === docId 
            ? { ...doctor, isAvailable: !doctor.isAvailable }
            : doctor
        )
      );
      toast.success("Availability status changed successfully");
    } catch (error) {
      toast.error("Error changing availability status");
    }
  };

  const getAllAppointments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointments`, {
        headers: {
          Authorization: `Bearer ${aToken}`
        }
      });
      setAppointments(res.data);
      return res.data || [];
    } catch (error) {
      toast.error("Failed to fetch appointments");
      setAppointments([]);
      return [];
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment._id === appointmentId
            ? { ...appointment, cancelled: true }
            : appointment
        )
      );
      toast.success("Appointment cancelled successfully");
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
      let doctorsData = [];
      let appointmentsData = [];
      let usersData = [];

      try {
        doctorsData = await getAllDoctors();
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }

      try {
        appointmentsData = await getAllAppointments();
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        if (Array.isArray(response.data)) {
          usersData = response.data;
        } else {
          console.warn("Data from /api/users is not an array:", response.data);
          usersData = [];
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }

      const totalDoctors = doctorsData.length;
      const totalAppointments = appointmentsData.length;
      const totalEarnings = appointmentsData
        .filter((app) => app.isCompleted)
        .reduce((sum, app) => sum + (app.amount || 0), 0);

      const totalPatients = usersData.filter(
        (user) => user.role === "Patient"
      ).length;

      const latestAppointments = appointmentsData
        .sort((a, b) => new Date(b.slotDate) - new Date(a.slotDate))
        .slice(0, 5);

      setDashData({
        totalDoctors,
        totalAppointments,
        totalPatients,
        totalEarnings,
        latestAppointments,
      });
    } catch (error) {
      toast.error("An unexpected error occurred while fetching dashboard data.");
      console.error("Error in getDashData:", error);
    }
  };

  const value = {
    aToken,
    setAToken,
    doctors,
    setDoctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    deleteDoctor,
    dashData,
    getDashData,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
