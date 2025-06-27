import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { doctor, loading, updateDoctorProfile } = useContext(DoctorContext);
  const [isEdit, setIsEdit] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (doctor) {
      setProfileData(doctor);
    }
  }, [doctor]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("Picture", file);
    try {
      const res = await fetch("https://authappapi.runasp.net/api/profile-pictures/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("dToken")}` },
        body: formData,
      });
      const data = await res.json();
      if (data.fileUrl || data.FileUrl) {
        setProfileData((prev) => ({ ...prev, image: data.fileUrl || data.FileUrl }));
        toast.success("Profile image uploaded!");
      } else {
        toast.error(data.message || "Failed to upload image");
      }
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

  const onUpdateHandler = async (e) => {
    e.preventDefault();
    await updateDoctorProfile(profileData);
    // Request admin approval after saving
    try {
      const res = await fetch("https://authappapi.runasp.net/api/doctors/request-approval", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("dToken")}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Approval request sent to admin.");
      } else {
        toast.error(data.message || "Failed to notify admin");
      }
    } catch (err) {
      toast.error("Failed to notify admin");
    }
    setIsEdit(false);
  };

  if (loading || !profileData) {
    return (
      <div className="p-6 flex justify-center items-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        {!isEdit ? (
          <button
            onClick={() => setIsEdit(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-md"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={onUpdateHandler}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-all shadow-md"
          >
            Save Changes
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 shadow-lg overflow-hidden">
        <div className="p-8">
          <form onSubmit={onUpdateHandler} className="flex flex-col lg:flex-row gap-8">
            {/* Profile Image */}
            <div className="lg:w-1/3">
              <div className="text-center">
                <img
                  src={profileData.image || "https://via.placeholder.com/256x256?text=Doctor+Image"}
                  alt="Doctor"
                  className="w-48 h-48 rounded-2xl mx-auto mb-4 object-cover border-4 border-gray-200"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/256x256?text=Doctor+Image";
                  }}
                />
                {isEdit && (
                  <div className="mt-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                  </div>
                )}
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Dr. {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-gray-600 mb-4">{profileData.specialty}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:w-2/3">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName || ''}
                      onChange={handleInputChange}
                      disabled={!isEdit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName || ''}
                      onChange={handleInputChange}
                      disabled={!isEdit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email || ''}
                      onChange={handleInputChange}
                      disabled={true} // Email should not be editable
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone || ''}
                      onChange={handleInputChange}
                      disabled={!isEdit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                    <select
                      name="specialty"
                      value={profileData.specialty || ''}
                      onChange={handleInputChange}
                      disabled={!isEdit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="General physician">General physician</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatricians">Pediatricians</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Gastroenterologist">Gastroenterologist</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Orthopedist">Orthopedist</option>
                      <option value="Psychiatrist">Psychiatrist</option>
                      <option value="Ophthalmologist">Ophthalmologist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                    <input
                      type="text"
                      name="degree"
                      value={profileData.degree || ''}
                      onChange={handleInputChange}
                      disabled={!isEdit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={profileData.experience || 0}
                      onChange={handleInputChange}
                      disabled={!isEdit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fees</label>
                    <input
                      type="number"
                      name="fees"
                      value={profileData.fees || 0}
                      onChange={handleInputChange}
                      disabled={!isEdit}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                  <textarea
                    name="about"
                    value={profileData.about || ''}
                    onChange={handleInputChange}
                    disabled={!isEdit}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
