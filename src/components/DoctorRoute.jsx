import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const DoctorRoute = () => {
  const token = localStorage.getItem('dToken');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    // Allow if the role is either Doctor or Patient (as per login logic)
    if (userRole !== 'Doctor' && userRole !== 'Patient') {
      return <Navigate to="/login" />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default DoctorRoute; 