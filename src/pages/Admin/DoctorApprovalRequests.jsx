import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import ConfirmationModal from "../../components/ConfirmationModal";

const DoctorApprovalRequests = () => {
  const { approvalRequests, getApprovalRequests, approveDoctor, rejectDoctor, aToken } = useContext(AdminContext);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aToken) {
      loadApprovalRequests();
    }
  }, [aToken, filterStatus]);

  const loadApprovalRequests = async () => {
    setLoading(true);
    try {
      await getApprovalRequests(filterStatus);
    } catch (error) {
      toast.error("Failed to load approval requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await approveDoctor(doctorId);
      toast.success("Doctor approved successfully!");
      loadApprovalRequests();
    } catch (error) {
      toast.error("Failed to approve doctor");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectNote.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await rejectDoctor(selectedRequest.doctor.id || selectedRequest.doctor._id, rejectNote);
      toast.success("Doctor rejected successfully!");
      setShowRejectModal(false);
      setRejectNote("");
      setSelectedRequest(null);
      loadApprovalRequests();
    } catch (error) {
      toast.error("Failed to reject doctor");
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectNote("");
    setSelectedRequest(null);
  };

  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✓",
          bgColor: "bg-green-50"
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "✕",
          bgColor: "bg-red-50"
        };
      default:
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⏳",
          bgColor: "bg-yellow-50"
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={closeRejectModal}
        onConfirm={handleReject}
        title="Reject Doctor Application"
        confirmText="Reject"
        confirmColor="bg-red-600 hover:bg-red-700"
      >
        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            Are you sure you want to reject Dr. {selectedRequest?.doctor?.firstName} {selectedRequest?.doctor?.lastName}?
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason (Required)
          </label>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={4}
            required
          />
        </div>
      </ConfirmationModal>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Doctor Approval Requests</h1>
            <p className="text-gray-600">Review and manage doctor applications</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="All">All</option>
            </select>
          </div>
        </div>

        {approvalRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-300 shadow-lg p-8 text-center">
            <img src={assets.appointment_icon} alt="No requests" className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Approval Requests</h3>
            <p className="text-gray-600">
              {filterStatus === "Pending" 
                ? "No pending approval requests at the moment." 
                : `No ${filterStatus.toLowerCase()} requests found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {approvalRequests.map((request) => {
              const statusInfo = getStatusInfo(request.status);
              return (
                <div key={request.id} className={`bg-white rounded-2xl border border-gray-300 shadow-lg overflow-hidden ${statusInfo.bgColor}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={request.doctor?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23e5e7eb'/%3E%3Ccircle cx='30' cy='24' r='12' fill='%239ca3af'/%3E%3Cpath d='M12 54c0-9.941 8.059-18 18-18s18 8.059 18 18' fill='%239ca3af'/%3E%3C/svg%3E"}
                          alt="Doctor"
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23e5e7eb'/%3E%3Ccircle cx='30' cy='24' r='12' fill='%239ca3af'/%3E%3Cpath d='M12 54c0-9.941 8.059-18 18-18s18 8.059 18 18' fill='%239ca3af'/%3E%3C/svg%3E";
                          }}
                        />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Dr. {request.doctor?.firstName} {request.doctor?.lastName}
                          </h3>
                          <p className="text-gray-600">{request.doctor?.email}</p>
                          <p className="text-sm text-gray-500">{request.doctor?.phone}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                        {statusInfo.icon} {request.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Specialty</p>
                        <p className="text-gray-800">{request.doctor?.speciality || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Degree</p>
                        <p className="text-gray-800">{request.doctor?.degree || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Experience</p>
                        <p className="text-gray-800">{request.doctor?.experience || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Fees</p>
                        <p className="text-gray-800">${request.doctor?.fees || 0}</p>
                      </div>
                    </div>

                    {request.doctor?.about && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">About</p>
                        <p className="text-gray-800 text-sm">{request.doctor.about}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Request Date: {formatDate(request.requestDate)}</p>
                        {request.processedDate && (
                          <p className="text-gray-600">Processed: {formatDate(request.processedDate)}</p>
                        )}
                      </div>
                      {request.adminName && (
                        <div>
                          <p className="text-gray-600">Processed by: {request.adminName}</p>
                        </div>
                      )}
                    </div>

                    {request.adminNote && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Admin Note:</p>
                        <p className="text-gray-800 text-sm">{request.adminNote}</p>
                      </div>
                    )}

                    {request.status === "Pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(request.doctor.id || request.doctor._id)}
                          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-all shadow-sm"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(request)}
                          className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-all shadow-sm"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorApprovalRequests; 