import React, { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";
import { DoctorContext } from "../context/DoctorContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = "https://authappapi.runasp.net/api";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const { setAToken } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        email,
        password,
        rememberMe,
      };
      const res = await axios.post(`${API_BASE_URL}/login`, payload);
      if (res.data.otpRequired) {
        toast.info("Enter the OTP sent to your email");
        navigate("/otp", {
          state: {
            email,
            tempToken: res.data.tempToken,
            role: state,
            fromLogin: true,
            isDoctor: state === 'Doctor'
          },
        });
      } else if (res.data.accessToken) {
        const token = res.data.accessToken;
        const decodedToken = jwtDecode(token);
        const userRole =
          decodedToken.role ||
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        if (state === "Admin") {
          if (userRole !== "Admin") {
            toast.error("Access Denied: You do not have admin privileges.");
            return;
          }
          // Clear any doctor token and set the admin token
          localStorage.removeItem("dToken");
          setDToken("");
          localStorage.setItem("aToken", token);
          setAToken(token);
          navigate("/admin");
        } else { // state === "Doctor"
          if (userRole !== "Doctor") {
            toast.error("Access Denied: You are not a registered doctor.");
            return;
          }
          // Clear any admin token and set the doctor token
          localStorage.removeItem("aToken");
          setAToken("");
          localStorage.setItem("dToken", token);
          setDToken(token);
          navigate("/doctor");
        }
        toast.success("Login successful");
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      toast.error("Invalid credentials or error during login");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center mt-10">
      <div className="flex flex-col gap-4 m-auto items-start p-10 min-w-[340px] sm:min-w-96 border border-gray-300 rounded-2xl text-[#5E5E5E] text-sm shadow-xl bg-white">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary"> {state} </span> Login
        </p>
        
          
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
            <div className="w-full flex items-center gap-2 mb-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((prev) => !prev)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="rememberMe" className="text-sm font-medium text-gray-700 cursor-pointer">
                Remember Me
              </label>
            </div>
            <button className="bg-primary text-white w-full px-6 py-3 rounded-xl text-base font-medium hover:bg-primary/90 transition-all shadow-md">
              Login
            </button>
            <p className="text-center w-full mt-2">
              Don't have a doctor account?{" "}
              <span
                className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
                onClick={() => navigate("/doctor-signup")}
              >
                Sign up
              </span>
            </p>
          
        
        {state === "Admin" ? (
          <p className="text-center w-full">
            Doctor Login?{" "}
            <span
              className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
              onClick={() => {
                setState("Doctor");
              }}
            >
              Click here
            </span>
          </p>
        ) : (
          <p className="text-center w-full">
            Admin Login?{" "}
            <span
              className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
              onClick={() => {
                setState("Admin");
              }}
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;

