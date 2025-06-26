import React, { useContext, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const DoctorAppointments = () => {
  const {
    appointments,
    loading,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  const { calculateAge } = useContext(AppContext);

  const [filterStatus, setFilterStatus] = useState("all");

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Filter appointments based on status
  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus === "all") return true;
    return appointment.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <p className="text-lg text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 lg:mb-0">My Appointments</h1>
        
        {/* Filter */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Fees</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={appointment.patient?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12' fill='%239ca3af'/%3E%3C/svg%3E"}
                        alt="Patient"
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12' fill='%239ca3af'/%3E%3C/svg%3E";
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Age: {calculateAge(appointment.patient?.dateOfBirth)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{formatDate(appointment.date)}</td>
                  <td className="px-6 py-4 text-gray-700">{appointment.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : appointment.status === "cancelled" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">${appointment.fees}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {appointment.status === "pending" && (
                        <>
                          <button
                            onClick={() => completeAppointment(appointment._id)}
                            className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                            title="Mark as completed"
                          >
                            <img src={assets.tick_icon} alt="Complete" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelAppointment(appointment._id)}
                            className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                            title="Cancel appointment"
                          >
                            <img src={assets.cancel_icon} alt="Cancel" className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {appointment.status === "completed" && (
                        <span className="text-green-600 text-sm font-medium">Completed</span>
                      )}
                      {appointment.status === "cancelled" && (
                        <span className="text-red-600 text-sm font-medium">Cancelled</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAppointments.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
