import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import ConfirmationModal from "../../components/ConfirmationModal";
import notifyIcon from '../../assets/appointment_icon.svg';

const DoctorsList = () => {
  const { doctors, getAllDoctors, changeAvailability, deleteDoctor, notifyDoctor, aToken } =
    useContext(AdminContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [notifyModal, setNotifyModal] = useState({ open: false, doctor: null });
  const [notifyMessage, setNotifyMessage] = useState('');

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  const handleAvailabilityToggle = async (docId, e) => {
    e.stopPropagation(); // Prevent navigation when toggling
    try {
      await changeAvailability(docId);
      toast.success("Availability status updated.");
    } catch (error) {
      toast.error("Failed to update availability.");
    }
  };

  const openDeleteModal = (docId, e) => {
    e.stopPropagation();
    setDoctorToDelete(docId);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDoctorToDelete(null);
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (doctorToDelete) {
      await deleteDoctor(doctorToDelete);
    }
    closeDeleteModal();
  };

  const handleNotify = async () => {
    if (!notifyModal.doctor) return;
    await notifyDoctor(notifyModal.doctor.id || notifyModal.doctor._id, notifyMessage);
    setNotifyModal({ open: false, doctor: null });
    setNotifyMessage('');
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Doctor"
      >
        Are you sure you want to permanently delete this doctor? This action cannot be undone.
      </ConfirmationModal>

      {/* Notify Modal */}
      {notifyModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-2">Send Notification to Dr. {notifyModal.doctor.firstName} {notifyModal.doctor.lastName}</h3>
            <textarea className="border p-2 w-full mb-2" placeholder="Message" value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} />
            <div className="flex gap-2 mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleNotify}>Send</button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setNotifyModal({ open: false, doctor: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Our Doctors</h1>
        {doctors && doctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id || doctor._id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:border-primary/30"
              >
                <img
                  className="w-full h-52 object-cover bg-blue-50"
                  src={
                    doctor.image ||
                    "https://via.placeholder.com/300x300.png?text=No+Image"
                  }
                  alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x300.png?text=No+Image";
                  }}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${doctor.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <p className={`text-sm font-semibold ${doctor.isActive ? 'text-green-600' : 'text-gray-600'}`}>{doctor.isActive ? 'Active' : 'Inactive'}</p>
                      <span className={`h-2.5 w-2.5 rounded-full ${doctor.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <p className={`text-sm font-semibold ${doctor.isAvailable ? 'text-green-600' : 'text-red-600'}`}>{doctor.isAvailable ? 'Available' : 'Unavailable'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeAvailability(doctor.id || doctor._id, doctor.isActive)}
                        className={`p-1 rounded-full ${doctor.isActive ? 'bg-red-100 hover:bg-red-200' : 'bg-green-100 hover:bg-green-200'}`}
                        title={doctor.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {doctor.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setNotifyModal({ open: true, doctor })}
                        className="p-1 rounded-full hover:bg-blue-100"
                        title="Notify"
                      >
                        <img src={notifyIcon} alt="Notify" className="w-5 h-5" />
                      </button>
                      <Link
                        to={`/admin/edit-doctor/${doctor.id || doctor._id}`}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <img
                          src={assets.edit_icon}
                          alt="Edit"
                          className="w-5 h-5 text-gray-600"
                        />
                      </Link>
                      <button
                        onClick={(e) => openDeleteModal(doctor.id || doctor._id, e)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <img
                          src={assets.delete_icon}
                          alt="Delete"
                          className="w-5 h-5 text-red-500"
                        />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 truncate">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{doctor.speciality}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No doctors found or still loading...
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorsList;
