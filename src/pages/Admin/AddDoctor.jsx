import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE_URL = "https://authappapi.runasp.net/api";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null); // Will hold the base64 string
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [about, setAbout] = useState("");
  const [fees, setFees] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");

  const { setDoctors, aToken } = useContext(AdminContext);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axios.post(`${API_BASE_URL}/doctors/upload`, formData, {
          headers: {
            Authorization: `Bearer ${aToken}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setDocImg(res.data.url);
        toast.success('Image uploaded successfully');
      } catch (err) {
        toast.error('Failed to upload image');
      }
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!docImg) {
        toast.error("Please select an image for the doctor.");
        setLoading(false);
        return;
      }

      const payload = {
        firstName,
        lastName,
        email,
        phone,
        image: docImg, // Now a URL
        speciality: specialty, // Use correct spelling
        degree,
        experience,
        about,
        fees: Number(fees),
        isAvailable,
        isActive,
        address,
      };

      console.log("Sending with token:", aToken); // Log the token

      const res = await axios.post(`${API_BASE_URL}/doctors`, payload, {
        headers: {
          Authorization: `Bearer ${aToken}`,
          "Content-Type": "application/json",
        },
      });

      setDoctors((prevDoctors) => [...prevDoctors, res.data]);
      toast.success("Doctor added successfully");

      // Reset form
      setDocImg(null);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setSpecialty("General physician");
      setDegree("");
      setExperience("1 Year");
      setAbout("");
      setFees("");
      setIsAvailable(true);
      setIsActive(true);
      setAddress("");
    } catch (error) {
      console.error("Error response from server:", error.response);
      const errorMessage = error.response?.data?.message || 
                         (error.response?.data && Object.values(error.response.data).flat().join(' ')) || 
                         "An unexpected error occurred. Please check the data.";
      toast.error(`Error adding doctor: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-6 w-full">
      <p className="mb-4 text-xl font-semibold text-gray-800">Add Doctor</p>
      <div className="bg-white px-8 py-8 border border-gray-300 rounded-lg w-full max-w-5xl shadow-lg">
        {/* Image Upload */}
        <div className="flex items-center gap-6 mb-8 text-gray-600">
          <label htmlFor="doc-img">
            <img
              className="w-24 h-24 bg-gray-100 rounded-lg cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary transition-all object-cover"
              src={docImg || assets.upload_area}
              alt="Upload"
            />
          </label>
          <input
            onChange={handleImageChange}
            type="file"
            id="doc-img"
            accept="image/*"
            hidden
          />
          <div>
            <p className="font-medium">Upload doctor picture</p>
            <p className="text-sm text-gray-500">Click to select image</p>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-gray-700">
          {/* First Name */}
          <div className="flex flex-col gap-2">
            <p className="font-medium">First Name</p>
            <input
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              type="text"
              placeholder="e.g. John"
              required
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-2">
            <p className="font-medium">Last Name</p>
            <input
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              type="text"
              placeholder="e.g. Doe"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <p className="font-medium">Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              type="email"
              placeholder="e.g. john.doe@example.com"
              required
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <p className="font-medium">Phone</p>
            <input
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              type="tel"
              placeholder="e.g. +1234567890"
              required
            />
          </div>

          {/* Speciality */}
          <div className="flex flex-col gap-2">
            <p className="font-medium">Speciality</p>
            <select
              onChange={(e) => setSpecialty(e.target.value)}
              value={specialty}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="General physician">General physician</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>

          {/* Degree */}
          <div className="flex flex-col gap-2">
            <p className="font-medium">Degree</p>
            <input
              onChange={(e) => setDegree(e.target.value)}
              value={degree}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              type="text"
              placeholder="e.g. MBBS, MD"
              required
            />
          </div>

          {/* Experience */}
          <div className="flex flex-col gap-2">
            <p className="font-medium">Experience</p>
            <select
              onChange={(e) => setExperience(e.target.value)}
              value={experience}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={`${i + 1} Year${i > 0 ? 's' : ''}`}>
                  {`${i + 1} Year${i > 0 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </div>

          {/* Fees */}
          <div className="flex flex-col gap-2">
            <p className="font-medium">Fees</p>
            <input
              onChange={(e) => setFees(e.target.value)}
              value={fees}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              type="number"
              placeholder="e.g. 150"
              required
            />
          </div>

          {/* About */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <p className="font-medium">About</p>
            <textarea
              onChange={(e) => setAbout(e.target.value)}
              value={about}
              rows="4"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Brief description about the doctor..."
            ></textarea>
          </div>

          {/* Availability */}
          <div className="md:col-span-2 flex items-center gap-4">
            <p className="font-medium">Is Available?</p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={() => setIsAvailable(!isAvailable)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Active Status */}
          <div className="flex flex-col gap-2">
            <p className="font-medium">Active Status</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive((prev) => !prev)}
                className="form-checkbox h-5 w-5 text-primary"
              />
              <span>{isActive ? 'Active' : 'Inactive'}</span>
            </label>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <p className="font-medium">Address</p>
            <input
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              type="text"
              placeholder="e.g. 123 Main St, City"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-all disabled:bg-gray-400"
          >
            {loading ? "Adding..." : "Add Doctor"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddDoctor;
