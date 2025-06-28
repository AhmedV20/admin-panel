import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { doctor, loading, updateDoctorProfile, refreshDoctorData, approvalStatus, requestApproval } = useContext(DoctorContext);
  const [isEdit, setIsEdit] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);
  const [setupData, setSetupData] = useState({
    phoneNumber: "",
    specialty: 0,
    degree: "",
    experience: "",
    about: "",
    address: "",
    fees: 0
  });

  const specialties = [
    { label: "General Physician", value: 0 },
    { label: "Gynecologist", value: 1 },
    { label: "Dermatologist", value: 2 },
    { label: "Pediatrician", value: 3 },
    { label: "Neurologist", value: 4 },
    { label: "Gastroenterologist", value: 5 }
  ];

  useEffect(() => {
    // Set refreshing state when component mounts
    setIsRefreshing(true);
    // Refresh doctor data when component mounts (fixes navigation issue)
    const loadData = async () => {
      try {
        await refreshDoctorData();
      } finally {
        setIsRefreshing(false);
      }
    };
    loadData();
  }, []); // Empty dependency array means this runs once when component mounts

  useEffect(() => {
    if (doctor) {
      setProfileData(doctor);
      setShowSetupForm(false);
    } else if (!loading && !isRefreshing) {
      setShowSetupForm(true);
    }
  }, [doctor, loading, isRefreshing]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSetupInputChange = (e) => {
    const { name, value } = e.target;
    setSetupData((prev) => ({
      ...prev,
      [name]: value,
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

  const onCancelHandler = () => {
    // Reset profile data to original doctor data
    setProfileData(doctor);
    setIsEdit(false);
    toast.info("Changes cancelled");
  };

  const handleRequestApproval = async () => {
    setIsRequestingApproval(true);
    try {
      const success = await requestApproval();
      if (success) {
        // The approval status will be updated automatically via the context
      }
    } finally {
      setIsRequestingApproval(false);
    }
  };

  const getApprovalStatusInfo = () => {
    if (!approvalStatus) return null;
    
    switch (approvalStatus.status?.toLowerCase()) {
      case "approved":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✓",
          message: "Your profile is approved and active!"
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "✕",
          message: "Your profile was rejected"
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⏳",
          message: "Your approval request is pending review"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "?",
          message: "Approval status unknown"
        };
    }
  };

  const onSetupSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format experience as "X Years" before sending to backend
      const formatExperienceForBackend = (experience) => {
        if (!experience) return "0 Years";
        return `${experience} Years`;
      };

      const setupDataToSend = {
        ...setupData,
        experience: formatExperienceForBackend(setupData.experience)
      };

      const res = await fetch("https://authappapi.runasp.net/api/doctors/me/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("dToken")}`,
        },
        body: JSON.stringify(setupDataToSend),
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success("Profile setup completed! Please wait for admin approval.");
        // Refresh the page to load the new doctor data
        window.location.reload();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to setup profile");
      }
    } catch (error) {
      toast.error("Failed to setup profile");
    }
  };

  // Helper function to format experience
  const formatExperience = (experience) => {
    if (!experience) return "0 Years";
    // Remove "years" if already present and add it back with proper capitalization
    const cleanExp = experience.toString().replace(/\s*years?/i, '');
    return `${cleanExp} Years`;
  };

  // Helper function to get clean experience number
  const getCleanExperience = (experience) => {
    if (!experience) return "0";
    return experience.toString().replace(/\s*years?/i, '');
  };

  // Default image fallback
  const getDefaultImage = () => {
    return "https://authappapi.runasp.net/profile-pictures/defaults/default-picture-profile.png";
  };

  // Show loading state during initial load or refresh
  if (loading || isRefreshing) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show setup form if doctor record is missing
  if (showSetupForm) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-300 shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Complete Your Profile Setup</h1>
            <p className="text-gray-600 mb-6 text-center">
              Welcome! Please complete your profile setup to start using the doctor dashboard.
            </p>
            
            <form onSubmit={onSetupSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={setupData.phoneNumber}
                    onChange={handleSetupInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                  <select
                    name="specialty"
                    value={setupData.specialty}
                    onChange={handleSetupInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    {specialties.map((spec) => (
                      <option key={spec.value} value={spec.value}>{spec.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    value={setupData.degree}
                    onChange={handleSetupInputChange}
                    required
                    placeholder="e.g., MBBS, MD"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={setupData.experience}
                    onChange={handleSetupInputChange}
                    required
                    min="0"
                    placeholder="e.g., 5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fees</label>
                  <input
                    type="number"
                    name="fees"
                    value={setupData.fees}
                    onChange={handleSetupInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g., 500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={setupData.address}
                    onChange={handleSetupInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                <textarea
                  name="about"
                  value={setupData.about}
                  onChange={handleSetupInputChange}
                  rows={4}
                  placeholder="Tell us about your experience and expertise..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-md"
                >
                  Complete Setup
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <div className="flex gap-3">
          {!isEdit ? (
            <>
              <button
                onClick={() => setIsEdit(true)}
                className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-md"
              >
                Edit Profile
              </button>
              {approvalStatus && approvalStatus.status?.toLowerCase() !== "approved" && (
                <button
                  onClick={handleRequestApproval}
                  disabled={isRequestingApproval || approvalStatus.status?.toLowerCase() === "pending"}
                  className={`px-6 py-3 rounded-xl font-medium transition-all shadow-md ${
                    isRequestingApproval || approvalStatus.status?.toLowerCase() === "pending"
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isRequestingApproval ? "Sending..." : "Request Approval"}
                </button>
              )}
            </>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={onUpdateHandler}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-all shadow-md"
              >
                Save Changes
              </button>
              <button
                onClick={onCancelHandler}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-all shadow-md"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Approval Status Banner */}
      {approvalStatus && (
        <div className="mb-6">
          {(() => {
            const statusInfo = getApprovalStatusInfo();
            if (!statusInfo) return null;
            
            return (
              <div className={`p-4 rounded-xl border ${statusInfo.color}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{statusInfo.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{statusInfo.message}</p>
                    {approvalStatus.adminNote && (
                      <p className="text-sm mt-1 opacity-90">
                        <strong>Admin Note:</strong> {approvalStatus.adminNote}
                      </p>
                    )}
                    {approvalStatus.requestDate && (
                      <p className="text-sm mt-1 opacity-90">
                        Request Date: {new Date(approvalStatus.requestDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-300 shadow-lg overflow-hidden">
        <div className="p-8">
          <form onSubmit={onUpdateHandler} className="flex flex-col lg:flex-row gap-8">
            {/* Profile Image Section */}
            <div className="lg:w-1/3 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative text-center">
                <img
                  src={profileData.image || getDefaultImage()}
                  alt="Doctor"
                  className="w-48 h-48 rounded-2xl object-cover border-4 border-gray-200 shadow-lg mx-auto"
                  onError={(e) => {
                    e.target.src = getDefaultImage();
                  }}
                />
                {isEdit && (
                  <div className="mt-4">
                    <label className="bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/90 transition-all shadow-md inline-block">
                      Upload New Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                <div className="mt-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Dr. {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-gray-600">{profileData.speciality || profileData.specialty}</p>
                </div>
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
                    <input
                      type="text"
                      name="specialty"
                      value={profileData.speciality || profileData.specialty || ''}
                      disabled={true} // Specialty should not be editable
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    />
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
                      type="text"
                      name="experience"
                      value={isEdit ? getCleanExperience(profileData.experience) : formatExperience(profileData.experience)}
                      onChange={handleInputChange}
                      disabled={!isEdit}
                      placeholder="e.g., 5"
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

  // Fallback rendering - this should never be reached but ensures no white page
  return (
    <div className="p-6 flex justify-center items-center min-h-[400px]">
      <div className="text-center">
        <p className="text-lg text-gray-600">Loading profile data...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your information.</p>
      </div>
    </div>
  );
};

export default DoctorProfile;
