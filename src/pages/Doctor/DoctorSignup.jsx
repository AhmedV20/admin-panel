import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://authappapi.runasp.net/api";

const specialties = [
  { label: "General Physician", value: 0 },
  { label: "Gynecologist", value: 1 },
  { label: "Dermatologist", value: 2 },
  { label: "Pediatrician", value: 3 },
  { label: "Neurologist", value: 4 },
  { label: "Gastroenterologist", value: 5 }
];

const DoctorSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState(0);
  const [specialty, setSpecialty] = useState(specialties[0].value);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build and log the payload
      const payload = {
        firstName,
        lastName,
        email,
        password,
        gender: Number(gender),
        specialty: Number(specialty), // Send as number
        address
      };
      console.log("Payload being sent:", payload);
      const res = await axios.post(`${API_BASE_URL}/register-doctor`, payload, {
        headers: { "Content-Type": "application/json" }
      });
      console.log("SIGNUP RESPONSE:", res.data);

      if (res.data.success && res.data.userId) {
        toast.success(
          res.data.message ||
            "Account created! Please verify with the OTP sent to your email."
        );
        setTimeout(() => {
          navigate("/otp", {
            state: {
              email,
              userId: res.data.userId,
              role: "Doctor",
            },
          });
        }, 1200);
      } else {
        toast.error(res.data.message || "Registration failed. Please try again.");
      }
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setGender(0);
      setSpecialty(specialties[0].value);
      setAddress("");
    } catch (error) {
      toast.error(
        `Failed to create account: ${
          error.response?.data?.message || "Please check your data."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center mt-5">
      <div className="flex flex-col gap-4 m-auto items-start p-5 min-w-[340px] sm:min-w-96 border border-gray-300 rounded-2xl text-[#5E5E5E] text-sm shadow-xl bg-white w-full max-w-md">
        <p className="text-2xl font-semibold m-auto mb-2 text-primary">Doctor Signup</p>
        <div className="w-full flex gap-3">
        <div className="w-full">
          <p className="mb-2 font-medium">First Name</p>
          <input
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            className="border border-gray-300 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            type="text"
            required
          />
        </div>
        <div className="w-full">
          <p className="mb-2 font-medium">Last Name</p>
          <input
            onChange={(e) => setLastName(e.target.value)}
            value={lastName}
            className="border border-gray-300 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            type="text"
            required
          />
        </div>
        </div>
        <div className="w-full">
          <p className="mb-2 font-medium">Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-gray-300 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            type="email"
            required
          />
        </div>
        <div className="w-full">
          <p className="mb-2 font-medium">Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-gray-300 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            type="password"
            required
          />
        </div>
        <div className="w-full">
          <p className="mb-2 font-medium">Gender</p>
          <select
            onChange={(e) => setGender(e.target.value)}
            value={gender}
            className="border border-gray-300 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          >
            <option value={0}>Male</option>
            <option value={1}>Female</option>
          </select>
        </div>
        <div className="w-full">
          <p className="mb-2 font-medium">Specialty</p>
          <select
            onChange={(e) => setSpecialty(e.target.value)}
            value={specialty}
            className="border border-gray-300 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          >
            {specialties.map((spec) => (
              <option key={spec.value} value={spec.value}>{spec.label}</option>
            ))}
          </select>
        </div>
        <div className="w-full">
          <p className="mb-2 font-medium">Address</p>
          <input
            onChange={(e) => setAddress(e.target.value)}
            value={address}
            className="border border-gray-300 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            type="text"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white w-full px-6 py-3 rounded-xl text-base font-medium hover:bg-primary/90 transition-all shadow-md mt-2"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
        <p className="text-center w-full mt-2">
          Already have an account?{' '}
          <span
            className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </form>
  );
};

export default DoctorSignup; 