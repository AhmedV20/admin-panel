import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../../assets/assets";

const API_BASE_URL = "https://authappapi.runasp.net/api";

const EditDoctor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { aToken } = useContext(AdminContext);

  const [docImg, setDocImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [degree, setDegree] = useState("");
  const [experience, setExperience] = useState("");
  const [about, setAbout] = useState("");
  const [fees, setFees] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/doctors/${id}`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        const doctor = response.data;
        setFirstName(doctor.firstName);
        setLastName(doctor.lastName);
        setEmail(doctor.email);
        setPhone(doctor.phone);
        setSpeciality(doctor.speciality);
        setDegree(doctor.degree);
        setExperience(doctor.experience);
        setAbout(doctor.about);
        setFees(doctor.fees);
        setIsAvailable(doctor.isAvailable);
        setImgPreview(doctor.image);
      } catch (error) {
        toast.error("Failed to fetch doctor details.");
        console.error(error);
      }
    };

    if (id && aToken) {
      fetchDoctorData();
    }
  }, [id, aToken]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocImg(reader.result);
        setImgPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      id,
      firstName,
      lastName,
      email,
      phone,
      speciality,
      degree,
      experience,
      about,
      fees: Number(fees),
      isAvailable,
    };
    
    if (docImg) {
      payload.image = docImg;
    }

    try {
      await axios.put(`${API_BASE_URL}/doctors/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${aToken}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Doctor updated successfully");
      navigate("/admin/doctors");
    } catch (error) {
      toast.error(
        `Error updating doctor: ${
          error.response?.data?.message || "Please check the data."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-6 w-full">
      <p className="mb-4 text-xl font-semibold text-gray-800">Edit Doctor</p>
       <div className="bg-white px-8 py-8 border border-gray-300 rounded-lg w-full max-w-5xl shadow-lg">
        {/* Image Upload */}
        <div className="flex items-center gap-6 mb-8 text-gray-600">
          <label htmlFor="doc-img">
            <img
              className="w-24 h-24 bg-gray-100 rounded-lg cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary transition-all object-cover"
              src={imgPreview || assets.upload_area}
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
            <p className="font-medium">Change doctor picture</p>
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
              onChange={(e) => setPhone(e.g.target.value)}
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
              onChange={(e) => setSpeciality(e.target.value)}
              value={speciality}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="GeneralPhysician">General Physician</option>
              <option value="Gynecologist">Gynecologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Gastroenterologist">Gastroenterologist</option>
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
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-all disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Update Doctor"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditDoctor; 