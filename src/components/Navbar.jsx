import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { state } = useContext(AppContext);
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
    if (aToken) {
      localStorage.removeItem("aToken");
      setAToken("");
    }
    if (dToken) {
      localStorage.removeItem("dToken");
      setDToken("");
    }
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b border-gray-300 bg-white">
      <div className="flex items-center gap-2 text-xs">
        <img
          className="w-36 sm::w-40 cursor-pointer"
          src={assets.admin_logo}
          alt=""
        />
        <p className="text-xl font-semibold text-gray-800">{state}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="bg-primary cursor-pointer text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
