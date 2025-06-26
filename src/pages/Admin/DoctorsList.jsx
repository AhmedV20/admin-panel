import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import ConfirmationModal from "../../components/ConfirmationModal";

const DoctorsList = () => {
  const { doctors, getAllDoctors, changeAvailability, deleteDoctor, aToken } =
    useContext(AdminContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

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
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          doctor.isAvailable ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <p
                        className={`text-sm font-semibold ${
                          doctor.isAvailable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {doctor.isAvailable ? "Available" : "Unavailable"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
