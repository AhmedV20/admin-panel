import React, { useState, useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import inquiryService from "../../services/inquiryService";
import Swal from "sweetalert2";
import { FaReply, FaEye, FaThumbsUp, FaThumbsDown, FaCalendarAlt, FaUser, FaFileImage } from "react-icons/fa";

const DoctorInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [response, setResponse] = useState("");
  const [responseFiles, setResponseFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { doctor } = useContext(DoctorContext);

  useEffect(() => {
    if (doctor?.speciality) {
      loadInquiries();
    }
  }, [doctor]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await inquiryService.getInquiriesBySpecialty(doctor.speciality);
      setInquiries(data);
    } catch (error) {
      console.error('Error loading inquiries:', error);
      Swal.fire({
        title: "Error",
        text: "Failed to load inquiries",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        Swal.fire({ title: "Invalid File", text: "Only image files are allowed", icon: "warning" });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        Swal.fire({ title: "File Too Large", text: "File size must be less than 5MB", icon: "warning" });
        return false;
      }
      return true;
    });
    setResponseFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setResponseFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openResponseModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setResponse("");
    setResponseFiles([]);
    setShowResponseModal(true);
  };

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setSelectedInquiry(null);
    setResponse("");
    setResponseFiles([]);
  };

  const submitResponse = async () => {
    if (!response.trim()) {
      Swal.fire({ title: "Response Required", text: "Please enter a response", icon: "warning" });
      return;
    }

    setSubmitting(true);
    try {
      const responseData = {
        response: response,
        responseFiles: responseFiles
      };

      if (responseFiles.length > 0) {
        await inquiryService.respondToInquiryWithFiles(selectedInquiry.id, responseData);
      } else {
        await inquiryService.respondToInquiry(selectedInquiry.id, responseData);
      }

      Swal.fire({
        title: "Success",
        text: "Response submitted successfully",
        icon: "success"
      });

      closeResponseModal();
      loadInquiries(); // Refresh the list
    } catch (error) {
      console.error('Error submitting response:', error);
      Swal.fire({
        title: "Error",
        text: "Failed to submit response",
        icon: "error"
      });
    } finally {
      setSubmitting(false);
    }
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

  if (!doctor?.speciality) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Please complete your profile to view inquiries.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Inquiries - {doctor.speciality}</h1>
        <p className="text-gray-600">View and respond to patient inquiries in your specialty</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inquiries...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No pending inquiries in your specialty.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              {/* Inquiry Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  <span className="text-sm text-gray-600">{inquiry.userName}</span>
                </div>
              </div>

              {/* Inquiry Content */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Patient Message:</h3>
                <p className="text-gray-700 mb-4">{inquiry.message}</p>

                {/* Patient Files */}
                {inquiry.files && inquiry.files.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaFileImage />
                      Patient Attachments:
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {inquiry.files.map((file, idx) => (
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

                {/* Doctor Response (if already responded) */}
                {inquiry.doctorResponse && (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Your Response:</h4>
                    <p className="text-gray-800 mb-2">{inquiry.doctorResponse}</p>
                    {inquiry.respondedAt && (
                      <span className="text-xs text-green-600">
                        Responded on {formatDate(inquiry.respondedAt)}
                      </span>
                    )}
                    
                    {/* Response Files */}
                    {inquiry.responseFiles && inquiry.responseFiles.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium text-green-800 mb-2">Your Attachments:</h5>
                        <div className="flex gap-2 flex-wrap">
                          {inquiry.responseFiles.map((file, idx) => (
                            <a 
                              key={idx} 
                              href={`https://authappapi.runasp.net/${file.filePath}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <img 
                                src={`https://authappapi.runasp.net/${file.filePath}`} 
                                alt="response attachment" 
                                className="w-16 h-16 object-cover rounded border hover:scale-110 transition" 
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating Display */}
                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-sm text-gray-600">Patient Rating:</span>
                      <div className="flex items-center gap-2">
                        <FaThumbsUp className="text-green-500" />
                        <span className="text-sm text-gray-600">{inquiry.likes || 0}</span>
                        <FaThumbsDown className="text-red-500" />
                        <span className="text-sm text-gray-600">{inquiry.dislikes || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {inquiry.status === 'Pending' && (
                  <button
                    onClick={() => openResponseModal(inquiry)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FaReply />
                    Respond
                  </button>
                )}
                <button
                  onClick={() => openResponseModal(inquiry)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <FaEye />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Respond to Inquiry</h2>
              <button
                onClick={closeResponseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Patient's Original Message */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Patient's Message:</h3>
              <p className="text-gray-700">{selectedInquiry.message}</p>
              {selectedInquiry.files && selectedInquiry.files.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-gray-700 mb-2">Patient Attachments:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedInquiry.files.map((file, idx) => (
                      <img 
                        key={idx}
                        src={`https://authappapi.runasp.net/${file.filePath}`} 
                        alt="patient attachment" 
                        className="w-16 h-16 object-cover rounded border" 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Response Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response *
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                  placeholder="Enter your response to the patient..."
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Images (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
                {responseFiles.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-700 mb-2">Selected Files:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {responseFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`file-${index}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeResponseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={submitResponse}
                  disabled={submitting || !response.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorInquiries; 