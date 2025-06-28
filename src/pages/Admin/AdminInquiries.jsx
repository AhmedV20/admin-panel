import React, { useState, useEffect } from "react";
import inquiryService from "../../services/inquiryService";
import Swal from "sweetalert2";
import { FaEye, FaThumbsUp, FaThumbsDown, FaCalendarAlt, FaUser, FaUserMd, FaFileImage, FaChartBar, FaFilter } from "react-icons/fa";

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, answered
  const [specialtyFilter, setSpecialtyFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inquiriesData, analyticsData] = await Promise.all([
        inquiryService.getAllInquiries(),
        inquiryService.getInquiryAnalytics()
      ]);
      setInquiries(inquiriesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Swal.fire({
        title: "Error",
        text: "Failed to load inquiries data",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedInquiry(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredInquiries = () => {
    let filtered = inquiries;

    // Filter by status
    if (filter === 'pending') {
      filtered = filtered.filter(inq => inq.status === 'Pending');
    } else if (filter === 'answered') {
      filtered = filtered.filter(inq => inq.status === 'Answered');
    }

    // Filter by specialty
    if (specialtyFilter) {
      filtered = filtered.filter(inq => inq.specialty === specialtyFilter);
    }

    return filtered;
  };

  const getUniqueSpecialties = () => {
    return [...new Set(inquiries.map(inq => inq.specialty))];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inquiries data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Inquiries Management</h1>
        <p className="text-gray-600">Monitor and analyze all patient inquiries and doctor responses</p>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalInquiries}</p>
              </div>
              <FaChartBar className="text-blue-600 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.pendingInquiries}</p>
              </div>
              <FaCalendarAlt className="text-yellow-600 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Answered</p>
                <p className="text-2xl font-bold text-green-600">{analytics.answeredInquiries}</p>
              </div>
              <FaUserMd className="text-green-600 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.totalInquiries > 0 
                    ? Math.round((analytics.answeredInquiries / analytics.totalInquiries) * 100) 
                    : 0}%
                </p>
              </div>
              <FaThumbsUp className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Specialty Analytics */}
      {analytics?.specialtyStats && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Inquiries by Specialty</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.specialtyStats.map((stat, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">{stat.specialty}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{stat.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="text-yellow-600">{stat.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span className="text-green-600">{stat.answered}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Inquiries</option>
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
          </select>
          
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Specialties</option>
            {getUniqueSpecialties().map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
          
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Inquiries ({getFilteredInquiries().length})
          </h2>
        </div>
        
        {getFilteredInquiries().length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No inquiries found with the current filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {getFilteredInquiries().map((inquiry) => (
              <div key={inquiry.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {inquiry.specialty}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        inquiry.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {inquiry.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        <FaCalendarAlt className="inline mr-1" />
                        {formatDate(inquiry.createdAt)}
                      </span>
                    </div>

                    {/* Patient Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <FaUser className="text-gray-400" />
                      <span className="text-sm text-gray-600">{inquiry.userName}</span>
                    </div>

                    {/* Message Preview */}
                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {inquiry.message}
                    </p>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {inquiry.files && inquiry.files.length > 0 && (
                        <span className="flex items-center gap-1">
                          <FaFileImage />
                          {inquiry.files.length} attachment(s)
                        </span>
                      )}
                      {inquiry.doctorResponse && (
                        <span className="flex items-center gap-1">
                          <FaUserMd />
                          {inquiry.respondingDoctorName}
                        </span>
                      )}
                      {inquiry.status === 'Answered' && (
                        <div className="flex items-center gap-2">
                          <FaThumbsUp className="text-green-500" />
                          <span>{inquiry.likes || 0}</span>
                          <FaThumbsDown className="text-red-500" />
                          <span>{inquiry.dislikes || 0}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openDetailsModal(inquiry)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition ml-4"
                  >
                    <FaEye />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Inquiry Details</h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Inquiry Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Inquiry Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedInquiry.id}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedInquiry.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedInquiry.status}
                    </span>
                  </div>
                  <div><span className="font-medium">Specialty:</span> {selectedInquiry.specialty}</div>
                  <div><span className="font-medium">Created:</span> {formatDate(selectedInquiry.createdAt)}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Patient Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedInquiry.userName}</div>
                  <div><span className="font-medium">User ID:</span> {selectedInquiry.userId}</div>
                </div>
              </div>
            </div>

            {/* Patient Message */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Patient Message</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{selectedInquiry.message}</p>
              </div>
              
              {selectedInquiry.files && selectedInquiry.files.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Patient Attachments:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedInquiry.files.map((file, idx) => (
                      <a 
                        key={idx} 
                        href={`https://authappapi.runasp.net/${file.filePath}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={`https://authappapi.runasp.net/${file.filePath}`} 
                          alt="patient attachment" 
                          className="w-20 h-20 object-cover rounded border hover:scale-110 transition" 
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Response */}
            {selectedInquiry.doctorResponse && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Doctor Response</h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="mb-2">
                    <span className="font-medium text-green-800">Doctor:</span> {selectedInquiry.respondingDoctorName}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-green-800">Responded:</span> {formatDate(selectedInquiry.respondedAt)}
                  </div>
                  <p className="text-gray-800 mb-3">{selectedInquiry.doctorResponse}</p>
                  
                  {selectedInquiry.responseFiles && selectedInquiry.responseFiles.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium text-green-800 mb-2">Doctor Attachments:</h4>
                      <div className="flex gap-2 flex-wrap">
                        {selectedInquiry.responseFiles.map((file, idx) => (
                          <a 
                            key={idx} 
                            href={`https://authappapi.runasp.net/${file.filePath}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <img 
                              src={`https://authappapi.runasp.net/${file.filePath}`} 
                              alt="doctor attachment" 
                              className="w-16 h-16 object-cover rounded border hover:scale-110 transition" 
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating Stats */}
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-sm text-gray-600">Patient Rating:</span>
                    <div className="flex items-center gap-2">
                      <FaThumbsUp className="text-green-500" />
                      <span className="text-sm text-gray-600">{selectedInquiry.likes || 0}</span>
                      <FaThumbsDown className="text-red-500" />
                      <span className="text-sm text-gray-600">{selectedInquiry.dislikes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries; 