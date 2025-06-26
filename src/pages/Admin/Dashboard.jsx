import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } =
    useContext(AdminContext);

  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString || !new Date(dateString).getTime()) {
      return "Invalid Date";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    dashData && (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-800">${dashData.totalEarnings?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <img src={assets.earning_icon} alt="Earnings" className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Patients</p>
                <p className="text-2xl font-bold text-gray-800">{dashData.totalPatients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <img src={assets.patients_icon} alt="Patients" className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-800">{dashData.totalAppointments || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <img src={assets.appointments_icon} alt="Appointments" className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-800">{dashData.totalDoctors || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <img src={assets.doctor_icon} alt="Doctors" className="w-6 h-6" />
              </div>
            </div>
          </div>
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
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Doctor</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Fees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashData.latestAppointments && dashData.latestAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={appointment.userData?.image}
                          alt="Patient"
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {appointment.userData?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={appointment.docData?.image}
                          alt="Doctor"
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            Dr. {appointment.docData?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(appointment.slotDate)}</td>
                    <td className="px-6 py-4 text-gray-700">{appointment.time}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.isCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {appointment.isCompleted ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">${appointment.fees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
