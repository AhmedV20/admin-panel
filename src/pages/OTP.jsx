import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";

const API_BASE_URL = "https://authappapi.runasp.net/api";

const OTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { email, tempToken, userId, role } = location.state || {};
  
  const { setAToken } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  useEffect(() => {
    if (!tempToken && !userId) {
      toast.error("Invalid session. Please try again.");
      navigate("/login");
    }
  }, [tempToken, userId, navigate]);

  const onOtpSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = tempToken
        ? { otp, tempToken, email }
        : { otp, userId, email };

      const res = await axios.post(`${API_BASE_URL}/verify-otp`, payload);

      if (res.data.accessToken) {
        if (role === "Admin") {
          localStorage.setItem("aToken", res.data.accessToken);
          setAToken(res.data.accessToken);
          navigate("/admin");
        } else if (role === "Doctor") {
          localStorage.setItem("dToken", res.data.accessToken);
          setDToken(res.data.accessToken);
          navigate("/doctor");
        }
        toast.success("Verification successful!");
      } else {
        toast.error(res.data.message || "Invalid OTP or error during verification.");
      }
    } catch (error) {
      toast.error(
        `Verification failed: ${
          error.response?.data?.message || "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center">
      <form
        onSubmit={onOtpSubmit}
        className="flex flex-col gap-4 m-auto items-start p-10 min-w-[340px] sm:min-w-96 border border-gray-300 rounded-2xl text-[#5E5E5E] text-sm shadow-xl bg-white"
      >
        <p className="text-2xl font-semibold m-auto mb-2 text-primary">
          Verify Your Account
        </p>
        <p className="text-center w-full">
          An OTP has been sent to <strong>{email}</strong>. Please enter it
          below.
        </p>

        <div className="w-full">
          <p className="mb-2 font-medium">Enter OTP</p>
          <input
            onChange={(e) => setOtp(e.target.value)}
            value={otp}
            className="border border-gray-300 rounded-xl w-full p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            type="text"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-white w-full px-6 py-3 rounded-xl text-base font-medium hover:bg-primary/90 transition-all shadow-md mt-2"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default OTP; 