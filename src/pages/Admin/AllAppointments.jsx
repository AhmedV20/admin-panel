import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment, approveAppointment, completeAppointment, setAppointments, doctors, getAllDoctors, users, getAllUsers, sendReminderToDoctor } =
    useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // cards or table
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterUser, setFilterUser] = useState("");

  useEffect(() => {
    if (aToken) {
      getAllDoctors && getAllDoctors();
      getAllUsers && getAllUsers();
      getAllAppointments({
        status: filterStatus !== "all" ? filterStatus : undefined,
        doctorId: filterDoctor || undefined,
        userId: filterUser || undefined,
        includeAll: true
      });
    }
  }, [aToken, filterStatus, filterDoctor, filterUser]);

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

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  // Helper function to format wait time
  const formatWaitTime = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Helper function to calculate age
  const getAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter appointments based on status
  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus === "all") return true;
    return appointment.status === filterStatus;
  });

  // Action handlers
  const handleApprove = (id) => approveAppointment(id);
  const handleComplete = (id) => completeAppointment(id);
  const handleCancel = (id) => cancelAppointment(id);

  // NEW: Handle sending reminder to doctor
  const handleSendReminder = async (appointmentId) => {
    try {
      await sendReminderToDoctor(appointmentId);
      toast.success("Reminder sent to doctor successfully");
    } catch (error) {
      toast.error("Failed to send reminder");
    }
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "Approved":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✓",
          bgColor: "bg-green-50"
        };
      case "Rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "✕",
          bgColor: "bg-red-50"
        };
      case "Completed":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "✓",
          bgColor: "bg-blue-50"
        };
      case "Cancelled":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "✕",
          bgColor: "bg-gray-50"
        };
      default: // Pending
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⏳",
          bgColor: "bg-yellow-50"
        };
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointments Management</h1>
            <p className="text-gray-600">Manage and track all patient appointments</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "cards" 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "table" 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Table
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="all">All Appointments</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Filter by doctor and user */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Doctor:</label>
              <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-2 bg-white">
                <option value="">All</option>
                {doctors && doctors.map(doc => <option key={doc.id || doc._id} value={doc.id || doc._id}>{doc.firstName} {doc.lastName}</option>)}
              </select>
              <label className="text-sm font-medium text-gray-700">Patient:</label>
              <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-2 bg-white">
                <option value="">All</option>
                {users && users.map(user => <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <img src={assets.appointments_icon} alt="Total" className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(apt => apt.status === "Pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => apt.status === "Approved").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {appointments.filter(apt => apt.status === "Completed").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejected/Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {appointments.filter(apt => apt.status === "Rejected" || apt.status === "Cancelled").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-xl">✕</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {viewMode === "cards" ? (
        // Cards View
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => {
            const statusInfo = getStatusInfo(appointment.status);
            return (
              <div key={appointment._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Header */}
                <div className={`p-6 ${statusInfo.bgColor} border-b border-gray-100`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                      {statusInfo.icon} {appointment.status}
                    </span>
                    <span className="text-lg font-bold text-gray-800">${appointment.fees}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(appointment.appointmentDate || appointment.date)} at {formatTime(appointment.appointmentTime || appointment.time)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={appointment.userImage || appointment.patient?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23e5e7eb'/%3E%3Ccircle cx='30' cy='24' r='12' fill='%239ca3af'/%3E%3Cpath d='M12 54c0-9.941 8.059-18 18-18s18 8.059 18 18' fill='%239ca3af'/%3E%3C/svg%3E"}
                      alt="Patient"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23e5e7eb'/%3E%3Ccircle cx='30' cy='24' r='12' fill='%239ca3af'/%3E%3Cpath d='M12 54c0-9.941 8.059-18 18-18s18 8.059 18 18' fill='%239ca3af'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {appointment.userName || `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`}
                      </h3>
                      <p className="text-sm text-gray-600">Age: {getAge(appointment.userDateOfBirth || appointment.patient?.dateOfBirth)}</p>
                      <p className="text-sm text-gray-600">Phone: {appointment.userPhone || appointment.patient?.phoneNumber || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={appointment.doctorImage || appointment.doctor?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='25' fill='%23e5e7eb'/%3E%3Ccircle cx='25' cy='20' r='10' fill='%239ca3af'/%3E%3Cpath d='M10 45c0-8.284 6.716-15 15-15s15 6.716 15 15' fill='%239ca3af'/%3E%3C/svg%3E"}
                      alt="Doctor"
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='25' fill='%23e5e7eb'/%3E%3Ccircle cx='25' cy='20' r='10' fill='%239ca3af'/%3E%3Cpath d='M10 45c0-8.284 6.716-15 15-15s15 6.716 15 15' fill='%239ca3af'/%3E%3C/svg%3E";
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        Dr. {appointment.doctorName || `${appointment.doctor?.firstName || ''} ${appointment.doctor?.lastName || ''}`}
                      </p>
                      <p className="text-sm text-gray-600">{appointment.doctorSpecialty || appointment.doctor?.speciality}</p>
                    </div>
                  </div>

                  {/* NEW: Additional Information */}
                  {appointment.doctorNote && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm font-medium text-gray-800">Doctor's Note:</p>
                      <p className="text-sm text-gray-600">{appointment.doctorNote}</p>
                    </div>
                  )}

                  {appointment.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                      <p className="text-sm font-medium text-gray-800">Rejection Reason:</p>
                      <p className="text-sm text-gray-600">{appointment.rejectionReason}</p>
                    </div>
                  )}

                  {appointment.patientWaitMinutes && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <p className="text-sm font-medium text-gray-800">Response Time:</p>
                      <p className="text-sm text-gray-600">{formatWaitTime(appointment.patientWaitMinutes)}</p>
                    </div>
                  )}

                  {appointment.respondedAt && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm font-medium text-gray-800">Responded:</p>
                      <p className="text-sm text-gray-600">{formatDate(appointment.respondedAt)}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {appointment.status === "Pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(appointment.id || appointment._id)}
                        className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-all shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleComplete(appointment.id || appointment._id)}
                        className="flex-1 bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-all shadow-sm"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleCancel(appointment.id || appointment._id)}
                        className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-all shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSendReminder(appointment.id || appointment._id)}
                        className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-yellow-600 transition-all shadow-sm"
                        title="Send reminder to doctor"
                      >
                        Remind
                      </button>
                    </div>
                  )}
                  
                  {appointment.status === "Approved" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleComplete(appointment.id || appointment._id)}
                        className="flex-1 bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-all shadow-sm"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleCancel(appointment.id || appointment._id)}
                        className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-all shadow-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {(appointment.status === "Completed" || appointment.status === "Rejected" || appointment.status === "Cancelled") && (
                    <div className="text-center py-3">
                      <span className={`font-medium ${
                        appointment.status === "Completed" ? "text-green-600" :
                        appointment.status === "Rejected" ? "text-red-600" : "text-gray-600"
                      }`}>
                        {appointment.status === "Completed" ? "✓ Appointment Completed" :
                         appointment.status === "Rejected" ? "✕ Appointment Rejected" : "✕ Appointment Cancelled"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Doctor</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Fees</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => {
                  const statusInfo = getStatusInfo(appointment.status);
                  return (
                    <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={appointment.userImage || appointment.patient?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12' fill='%239ca3af'/%3E%3C/svg%3E"}
                            alt="Patient"
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12' fill='%239ca3af'/%3E%3C/svg%3E";
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-800">
                              {appointment.userName || `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              Age: {getAge(appointment.userDateOfBirth || appointment.patient?.dateOfBirth)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={appointment.doctorImage || appointment.doctor?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12' fill='%239ca3af'/%3E%3C/svg%3E"}
                            alt="Doctor"
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12' fill='%239ca3af'/%3E%3C/svg%3E";
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-800">
                              Dr. {appointment.doctorName || `${appointment.doctor?.firstName || ''} ${appointment.doctor?.lastName || ''}`}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.doctorSpecialty || appointment.doctor?.speciality}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{formatDate(appointment.appointmentDate || appointment.date)}</p>
                          <p className="text-sm text-gray-500">{formatTime(appointment.appointmentTime || appointment.time)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          {statusInfo.icon} {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">${appointment.fees}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {appointment.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(appointment.id || appointment._id)}
                                className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                                title="Approve"
                              >
                                <img src={assets.tick_icon} alt="Approve" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleComplete(appointment.id || appointment._id)}
                                className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                                title="Complete"
                              >
                                <img src={assets.tick_icon} alt="Complete" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(appointment.id || appointment._id)}
                                className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                                title="Cancel"
                              >
                                <img src={assets.cancel_icon} alt="Cancel" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSendReminder(appointment.id || appointment._id)}
                                className="p-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors"
                                title="Send reminder to doctor"
                              >
                                <img src={assets.reminder_icon} alt="Remind" className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {appointment.status === "Approved" && (
                            <button
                              onClick={() => handleComplete(appointment.id || appointment._id)}
                              className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                              title="Complete"
                            >
                              <img src={assets.tick_icon} alt="Complete" className="w-4 h-4" />
                            </button>
                          )}
                          {appointment.status === "Completed" && (
                            <span className="text-green-600 text-sm font-medium">Completed</span>
                          )}
                          {appointment.status === "Rejected" && (
                            <span className="text-red-600 text-sm font-medium">Rejected</span>
                          )}
                          {appointment.status === "Cancelled" && (
                            <span className="text-gray-600 text-sm font-medium">Cancelled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {filteredAppointments.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <img src={assets.appointments_icon} alt="No appointments" className="w-12 h-12 opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
          <p className="text-gray-600">There are no appointments matching your current filter.</p>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
