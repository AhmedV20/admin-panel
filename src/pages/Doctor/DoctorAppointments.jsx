import React, { useContext, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const DoctorAppointments = () => {
  const {
    appointments,
    loading,
    completeAppointment,
    cancelAppointment,
    approveAppointment,
    rejectAppointment,
  } = useContext(DoctorContext);

  const { calculateAge } = useContext(AppContext);

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending' },
      'Approved': { color: 'bg-green-100 text-green-800 border-green-200', text: 'Approved' },
      'Rejected': { color: 'bg-red-100 text-red-800 border-red-200', text: 'Rejected' },
      'Completed': { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Completed' },
      'Cancelled': { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Handle appointment approval
  const handleApproveAppointment = async (appointmentId) => {
    const { value: note } = await Swal.fire({
      title: 'Approve Appointment',
      input: 'textarea',
      inputLabel: 'Add a note (optional)',
      inputPlaceholder: 'Enter any additional notes for the patient...',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        // Note is optional, so no validation needed
        return null;
      }
    });

    if (note !== undefined) {
      try {
        await approveAppointment(appointmentId, note);
        toast.success('Appointment approved successfully');
      } catch (error) {
        toast.error('Failed to approve appointment');
      }
    }
  };

  // Handle appointment rejection
  const handleRejectAppointment = async (appointmentId) => {
    const { value: formValues } = await Swal.fire({
      title: 'Reject Appointment',
      html: `
        <input id="swal-reason" class="swal2-input" placeholder="Reason for rejection (required)">
        <textarea id="swal-note" class="swal2-textarea" placeholder="Additional note (optional)"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const reason = document.getElementById('swal-reason').value;
        const note = document.getElementById('swal-note').value;
        if (!reason) {
          Swal.showValidationMessage('Please provide a reason for rejection');
          return false;
        }
        return { reason, note };
      }
    });

    if (formValues) {
      try {
        await rejectAppointment(appointmentId, formValues.reason, formValues.note);
        toast.success('Appointment rejected successfully');
      } catch (error) {
        toast.error('Failed to reject appointment');
      }
    }
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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Wait Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Fees</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id || appointment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={appointment.userImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12' fill='%239ca3af'/%3E%3C/svg%3E"}
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
                          {appointment.userPhone || appointment.patient?.phoneNumber || 'No phone'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Age: {calculateAge(appointment.userDateOfBirth || appointment.patient?.dateOfBirth)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-700">
                      <p>{formatDate(appointment.appointmentDate || appointment.date)}</p>
                      <p className="text-sm text-gray-500">{formatTime(appointment.appointmentTime || appointment.time)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(appointment.status)}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {appointment.patientWaitMinutes ? formatWaitTime(appointment.patientWaitMinutes) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">${appointment.fees}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {appointment.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleApproveAppointment(appointment.id || appointment._id)}
                            className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                            title="Approve appointment"
                          >
                            <img src={assets.tick_icon} alt="Approve" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectAppointment(appointment.id || appointment._id)}
                            className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                            title="Reject appointment"
                          >
                            <img src={assets.cancel_icon} alt="Reject" className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {appointment.status === "Approved" && (
                        <>
                          <button
                            onClick={() => completeAppointment(appointment.id || appointment._id)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                            title="Mark as completed"
                          >
                            <img src={assets.tick_icon} alt="Complete" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelAppointment(appointment.id || appointment._id)}
                            className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                            title="Cancel appointment"
                          >
                            <img src={assets.cancel_icon} alt="Cancel" className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {(appointment.status === "Completed" || appointment.status === "Rejected" || appointment.status === "Cancelled") && (
                        <span className={`text-sm font-medium ${
                          appointment.status === "Completed" ? "text-green-600" :
                          appointment.status === "Rejected" ? "text-red-600" : "text-gray-600"
                        }`}>
                          {appointment.status}
                        </span>
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
