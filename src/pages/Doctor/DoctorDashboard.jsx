import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorDashboard = () => {
  const { doctor, stats, recentAppointment, loading, approvalStatus } = useContext(DoctorContext);

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

  // Helper function to calculate age
  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading && !doctor) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (doctor && doctor.isActive === false) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-xl">
          <p className="font-semibold">Your account is pending approval by the administrator. Please wait for activation.</p>
          <p className="mt-2 text-sm text-yellow-700">You can still edit your profile to make sure all your information is correct and appealing for approval.</p>
        </div>
      </div>
    );
  }

  // Check approval status and show appropriate message
  if (approvalStatus && approvalStatus.status?.toLowerCase() === "rejected") {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-xl">
          <p className="font-semibold">Your profile approval request was rejected.</p>
          {approvalStatus.adminNote && (
            <p className="mt-2 text-sm text-red-700">
              <strong>Reason:</strong> {approvalStatus.adminNote}
            </p>
          )}
          <p className="mt-2 text-sm text-red-700">
            Please update your profile information and submit a new approval request.
          </p>
        </div>
      </div>
    );
  }

  if (approvalStatus && approvalStatus.status?.toLowerCase() === "pending") {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-xl">
          <p className="font-semibold">Your approval request is pending review.</p>
          <p className="mt-2 text-sm text-yellow-700">
            Please wait for the administrator to review your profile. You will be notified once a decision is made.
          </p>
          {approvalStatus.requestDate && (
            <p className="mt-2 text-sm text-yellow-700">
              Request submitted on: {new Date(approvalStatus.requestDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, Dr. {doctor?.firstName}!</h1>
        <p className="text-gray-600">Here's what's happening with your practice today.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <img src={assets.appointments_icon} alt="Appointments" className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <img src={assets.tick_icon} alt="Completed" className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <img src={assets.appointment_icon} alt="Pending" className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <img src={assets.appointment_icon} alt="Rejected" className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <img src={assets.appointment_icon} alt="Cancelled" className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-800">${stats.earnings?.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <img src={assets.earning_icon} alt="Earnings" className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointment */}
      <div className="bg-white rounded-2xl border border-gray-300 shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Most Recent Appointment</h2>
        </div>
        {recentAppointment ? (
          <div className="p-6">
            <p><strong>Patient:</strong> {recentAppointment.patientName}</p>
            <p><strong>Date:</strong> {formatDate(recentAppointment.appointmentDate)}</p>
            <p><strong>Time:</strong> {recentAppointment.appointmentTime}</p>
            <p><strong>Status:</strong> {recentAppointment.status}</p>
            <p><strong>Amount:</strong> ${recentAppointment.fees}</p>
          </div>
        ) : (
          <div className="p-6 text-gray-500">No recent appointment found.</div>
        )}
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl border border-gray-300 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recent Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Fees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentAppointment ? (
                <tr key={recentAppointment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={recentAppointment.patient?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12' fill='%239ca3af'/%3E%3C/svg%3E"}
                        alt="Patient"
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12' fill='%239ca3af'/%3E%3C/svg%3E";
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {recentAppointment.patient?.firstName} {recentAppointment.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Age: {calculateAge(recentAppointment.patient?.dateOfBirth)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{formatDate(recentAppointment.appointmentDate)}</td>
                  <td className="px-6 py-4 text-gray-700">{recentAppointment.appointmentTime}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      recentAppointment.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : recentAppointment.status === "cancelled" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {recentAppointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">${recentAppointment.fees}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No recent appointments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
